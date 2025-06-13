import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './ForgotPassword.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const navigate = useNavigate();

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const validateEmail = (value) => {
        if (!emailPattern.test(value)) {
            setMessage('Please enter a valid email address');
            setIsSuccess(false);
            return false;
        }
        setMessage('');
        return true;
    };

    const handleInputChange = (e) => {
        setEmail(e.target.value);
        validateEmail(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateEmail(email)) {
            setIsLoading(true);
            setMessage('');
            
            try {
                const response = await fetch('http://localhost:8080/api/account/forgot-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username: email }),
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    setMessage('OTP has been sent to your email!');
                    setIsSuccess(true);
                    setShowOtpInput(true);
                } else {
                    setMessage(data.message || 'Failed to send OTP. Please try again.');
                    setIsSuccess(false);
                }
            } catch (error) {
                console.error('Forgot password error:', error);
                setMessage('Network error. Please check your connection and try again.');
                setIsSuccess(false);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp || !newPassword) {
            setMessage('Please enter both OTP and new password');
            setIsSuccess(false);
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch('http://localhost:8080/api/account/verify-change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: email,
                    otp: otp,
                    newPassword: newPassword
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Password has been reset successfully!');
                setIsSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setMessage(data.message || 'Failed to verify OTP. Please try again.');
                setIsSuccess(false);
            }
        } catch (error) {
            console.error('Verify OTP error:', error);
            setMessage('Network error. Please check your connection and try again.');
            setIsSuccess(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="forgot-container">
            <div className="forgot-box">
                {!showOtpInput ? (
                    <form onSubmit={handleSubmit} noValidate>
                        <h1>Forgot Password</h1>
                        <p>Enter your email address to reset your password.</p>
                        <input
                            type="email"
                            value={email}
                            onChange={handleInputChange}
                            placeholder="Email"
                            required
                        />
                        <div
                            className="error-message"
                            style={{ color: isSuccess ? '#4CAF50' : 'red' }}
                        >
                            {message}
                        </div>
                        <button 
                            type="submit"
                            disabled={isLoading}
                            style={{
                                opacity: isLoading ? 0.7 : 1,
                                cursor: isLoading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isLoading ? 'Sending...' : 'Send OTP'}
                        </button>
                        <div className="back-link">
                            <Link to="/login">Back to Login</Link>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} noValidate>
                        <h1>Reset Password</h1>
                        <p>Enter the OTP sent to your email and your new password.</p>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter OTP"
                            required
                        />
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter New Password"
                            required
                        />
                        <div
                            className="error-message"
                            style={{ color: isSuccess ? '#4CAF50' : 'red' }}
                        >
                            {message}
                        </div>
                        <button 
                            type="submit"
                            disabled={isLoading}
                            style={{
                                opacity: isLoading ? 0.7 : 1,
                                cursor: isLoading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isLoading ? 'Verifying...' : 'Reset Password'}
                        </button>
                        <div className="back-link">
                            <Link to="/login">Back to Login</Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
