import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

const Login = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [showOTP, setShowOTP] = useState(false);
    const [otp, setOTP] = useState("");
    const containerRef = useRef(null);

    const namePattern = /^[A-Za-z\s]{3,}$/;
    const phonePattern = /^[0-9]{10}$/;

    const [formData, setFormData] = useState({
        registerName: "",
        registerPhone: "",
        registerPassword: "",
        loginPhone: "",
        loginPassword: "",
    });

    const [errors, setErrors] = useState({
        registerName: "",
        registerPhone: "",
        registerPassword: "",
        loginPhone: "",
        loginPassword: "",
        otp: "",
    });

    const validateRegister = () => {
        const newErrors = {};
        if (!namePattern.test(formData.registerName)) {
            newErrors.registerName = "Name must contain at least 3 letters ";
        }
        if (!phonePattern.test(formData.registerPhone)) {
            newErrors.registerPhone = "Please enter a valid 10-digit phone number";
        }
        if (!formData.registerPassword) {
            newErrors.registerPassword = "Password is required";
        }
        setErrors((prev) => ({ ...prev, ...newErrors }));
        return Object.keys(newErrors).length === 0;
    };

    const validateLogin = () => {
        const newErrors = {};
        if (!phonePattern.test(formData.loginPhone)) {
            newErrors.loginPhone = "Please enter a valid 10-digit phone number";
        }
        if (!formData.loginPassword) {
            newErrors.loginPassword = "Password is required";
        }
        setErrors((prev) => ({ ...prev, ...newErrors }));
        return Object.keys(newErrors).length === 0;
    };

    const validateOTP = () => {
        const newErrors = {};
        if (!otp || otp.length !== 6) {
            newErrors.otp = "Please enter a valid 6-digit OTP";
            setErrors((prev) => ({ ...prev, ...newErrors }));
            return false;
        }
        return true;
    };

    const handleInput = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
        setErrors({ ...errors, [id]: "" });
    };

    const handleOTPInput = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
        setOTP(value);
        setErrors({ ...errors, otp: "" });
    };

    const handleRegister = (e) => {
        e.preventDefault();
        if (validateRegister()) {
            setShowOTP(true);
            // Here you would typically make an API call to send OTP
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (validateLogin()) {
            setShowOTP(true);
            // Here you would typically make an API call to send OTP
        }
    };

    const handleVerifyOTP = () => {
        if (validateOTP()) {
            // Here you would typically make an API call to verify OTP
            alert("Verification successful!");
            setShowOTP(false);
            setOTP("");
        }
    };

    useEffect(() => {
        if (containerRef.current) {
            if (isRegister) {
                containerRef.current.classList.add("right-panel-active");
            } else {
                containerRef.current.classList.remove("right-panel-active");
            }
        }
    }, [isRegister]);

    const buttonStyle = {
        borderRadius: "25px",
        border: "1px solid #4d8b67",
        backgroundColor: "#4d8b67",
        color: "#fff",
        fontSize: "15px",
        fontWeight: "700",
        margin: "5px",
        padding: "12px 50px",
        letterSpacing: "1px",
        textTransform: "capitalize",
        cursor: "pointer",
    };

    const ghostButtonStyle = {
        backgroundColor: "transparent",
        border: "2px solid #fff",
        color: "#fff",
        padding: "12px 50px",
        fontSize: "15px",
        fontWeight: "700",
        marginTop: "35px",
        borderRadius: "25px",
        cursor: "pointer",
    };

    return (
        <div className="wrapper" style={{ backgroundColor: '#6932a1' }}>
            <div className="container" ref={containerRef} style={{ width: "900px" }}>
                <div className="form-container register-container">
                    <form onSubmit={handleRegister} noValidate>
                        <h1>Register</h1>
                        <input
                            type="text"
                            id="registerName"
                            placeholder="Name"
                            value={formData.registerName}
                            onChange={handleInput}
                            required
                        />
                        <div className="error-message">{errors.registerName}</div>

                        <input
                            type="tel"
                            id="registerPhone"
                            placeholder="Phone Number"
                            value={formData.registerPhone}
                            onChange={handleInput}
                            required
                        />
                        <div className="error-message">{errors.registerPhone}</div>

                        <input
                            type="password"
                            id="registerPassword"
                            placeholder="Password"
                            value={formData.registerPassword}
                            onChange={handleInput}
                            required
                        />
                        <div className="error-message">{errors.registerPassword}</div>

                        {showOTP && isRegister && (
                            <>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={handleOTPInput}
                                    placeholder="Enter 6-digit OTP"
                                    maxLength="6"
                                    required
                                />
                                <div className="error-message">{errors.otp}</div>
                                <button type="button" onClick={handleVerifyOTP} style={buttonStyle}>
                                    Verify OTP
                                </button>
                            </>
                        )}

                        {!showOTP && (
                            <button type="submit" style={buttonStyle}>Register</button>
                        )}
                    </form>
                </div>

                <div className="form-container login-container">
                    <form onSubmit={handleLogin} noValidate>
                        <h1>Login</h1>
                        <input
                            type="tel"
                            id="loginPhone"
                            placeholder="Phone Number"
                            value={formData.loginPhone}
                            onChange={handleInput}
                            required
                        />
                        <div className="error-message">{errors.loginPhone}</div>

                        <input
                            type="password"
                            id="loginPassword"
                            placeholder="Password"
                            value={formData.loginPassword}
                            onChange={handleInput}
                            required
                        />
                        <div className="error-message">{errors.loginPassword}</div>

                        {showOTP && !isRegister && (
                            <>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={handleOTPInput}
                                    placeholder="Enter 6-digit OTP"
                                    maxLength="6"
                                    required
                                />
                                <div className="error-message">{errors.otp}</div>
                                <button type="button" onClick={handleVerifyOTP} style={buttonStyle}>
                                    Verify OTP
                                </button>
                            </>
                        )}

                        <div className="pass-link">
                            <Link to="/forgot-password">Forgot password?</Link>
                        </div>

                        {!showOTP && (
                            <button type="submit" style={buttonStyle}>Login</button>
                        )}
                    </form>
                </div>

                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left" style={{ marginTop: "22px" }}>
                            <h1 className="title" style={{ color: "white" }}>Hello <br /> friends!</h1>
                            <p style={{ color: "white" }}>If you have an account, login here and have fun!</p>
                            <button style={ghostButtonStyle} onClick={() => setIsRegister(false)}>Login</button>
                        </div>
                        <div className="overlay-panel overlay-right" style={{ marginTop: "22px" }}>
                            <h1 className="title" style={{ color: "white" }}>Start your <br /> journey now!</h1>
                            <p style={{ color: "white" }}>If you don't have an account yet, join us and start your journey.</p>
                            <button style={ghostButtonStyle} onClick={() => setIsRegister(true)}>Register</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
