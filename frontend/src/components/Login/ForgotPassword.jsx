import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './ForgotPassword.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
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
                // TODO: Replace with actual API call
                const response = await fetch('/api/auth/forgot-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email }),
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    setMessage('Password reset link has been sent to your email!');
                    setIsSuccess(true);
                    
                    // Don't auto-redirect, let user choose when to return
                    setEmail('');
                } else {
                    setMessage(data.message || 'Failed to send reset email. Please try again.');
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

    return (
        <div className="forgot-container">
            <div className="forgot-box">
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
                        {isLoading ? 'Sending...' : 'Reset Password'}
                    </button>
                    <div className="back-link">
                        <Link to="/login">Back to Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
