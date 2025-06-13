import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./ForgotPassword.css";

const ForgotPassword = () => {
    const [phone, setPhone] = useState("");
    const [otp, setOTP] = useState("");
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [showOTP, setShowOTP] = useState(false);
    const navigate = useNavigate();

    const phonePattern = /^[0-9]{10}$/;

    const validatePhone = (value) => {
        if (!phonePattern.test(value)) {
            setMessage("Please enter a valid 10-digit phone number");
            setIsSuccess(false);
            return false;
        }
        setMessage("");
        return true;
    };

    const validateOTP = (value) => {
        if (!value || value.length !== 6) {
            setMessage("Please enter a valid 6-digit OTP");
            setIsSuccess(false);
            return false;
        }
        setMessage("");
        return true;
    };

    const handlePhoneInput = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
        setPhone(value);
        validatePhone(value);
    };

    const handleOTPInput = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
        setOTP(value);
        validateOTP(value);
    };

    const handleSubmitPhone = (e) => {
        e.preventDefault();
        if (validatePhone(phone)) {
            setShowOTP(true);
            setMessage("OTP has been sent to your phone number!");
            setIsSuccess(true);
            // Here you would typically make an API call to send OTP
        }
    };

    const handleVerifyOTP = (e) => {
        e.preventDefault();
        if (validateOTP(otp)) {
            setMessage("Password reset link has been sent to your phone!");
            setIsSuccess(true);
            // Here you would typically make an API call to verify OTP and reset password

            setTimeout(() => {
                setPhone("");
                setOTP("");
                setMessage("");
                setIsSuccess(false);
                navigate("/login");
            }, 3000);
        }
    };

    return (
        <div className="forgot-container">
            <div className="forgot-box">
                <form
                    onSubmit={showOTP ? handleVerifyOTP : handleSubmitPhone}
                    noValidate
                >
                    <h1>Forgot Password</h1>
                    <p>Enter your phone number to reset your password.</p>
                    <input
                        type="tel"
                        value={phone}
                        onChange={handlePhoneInput}
                        placeholder="Phone Number"
                        required
                        disabled={showOTP}
                    />

                    {showOTP && (
                        <input
                            type="text"
                            value={otp}
                            onChange={handleOTPInput}
                            placeholder="Enter 6-digit OTP"
                            maxLength="6"
                            required
                        />
                    )}

                    <div
                        className="error-message"
                        style={{ color: isSuccess ? "#4CAF50" : "red" }}
                    >
                        {message}
                    </div>

                    {!showOTP ? (
                        <button type="submit">Send OTP</button>
                    ) : (
                        <button type="submit">Verify OTP</button>
                    )}

                    <div className="back-link">
                        <Link to="/login">Back to Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
