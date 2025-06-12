import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

const Login = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [apiMessage, setApiMessage] = useState('');
    const containerRef = useRef(null);

    const namePattern = /^[A-Za-z\s]{3,}$/;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const [formData, setFormData] = useState({
        registerName: "",
        registerEmail: "",
        registerPassword: "",
        loginEmail: "",
        loginPassword: "",
    });

    const [errors, setErrors] = useState({
        registerName: "",
        registerEmail: "",
        registerPassword: "",
        loginEmail: "",
        loginPassword: "",
    });

    const validateRegister = () => {
        const newErrors = {};
        if (!namePattern.test(formData.registerName)) {
            newErrors.registerName = "Name must contain at least 3 letters ";
        }
        if (!emailPattern.test(formData.registerEmail)) {
            newErrors.registerEmail = "Please enter a valid email address";
        }
        
        // Enhanced password validation
        if (!formData.registerPassword) {
            newErrors.registerPassword = "Password is required";
        } else if (formData.registerPassword.length < 8) {
            newErrors.registerPassword = "Password must be at least 8 characters long";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.registerPassword)) {
            newErrors.registerPassword = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
        }
        
        setErrors((prev) => ({ ...prev, ...newErrors }));
        return Object.keys(newErrors).length === 0;
    };

    const validateLogin = () => {
        const newErrors = {};
        if (!emailPattern.test(formData.loginEmail)) {
            newErrors.loginEmail = "Please enter a valid email address";
        }
        if (!formData.loginPassword) {
            newErrors.loginPassword = "Password is required";
        }
        setErrors((prev) => ({ ...prev, ...newErrors }));
        return Object.keys(newErrors).length === 0;
    };

    const handleInput = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
        setErrors({ ...errors, [id]: "" });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (validateRegister()) {
            setIsLoading(true);
            setApiMessage('');
            
            try {
                // TODO: Replace with actual API call
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: formData.registerName,
                        email: formData.registerEmail,
                        password: formData.registerPassword,
                    }),
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    setApiMessage('Registration successful! Please check your email for verification.');
                    // Reset form
                    setFormData({
                        ...formData,
                        registerName: '',
                        registerEmail: '',
                        registerPassword: '',
                    });
                } else {
                    setApiMessage(data.message || 'Registration failed. Please try again.');
                }
            } catch (error) {
                console.error('Registration error:', error);
                setApiMessage('Network error. Please check your connection and try again.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (validateLogin()) {
            setIsLoading(true);
            setApiMessage('');
            
            try {
                // TODO: Replace with actual API call
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: formData.loginEmail,
                        password: formData.loginPassword,
                    }),
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    setApiMessage('Login successful! Redirecting...');
                    // TODO: Store token and redirect to dashboard
                    localStorage.setItem('authToken', data.token);
                    setTimeout(() => {
                        // window.location.href = '/dashboard';
                        setApiMessage('Login successful! (Redirect functionality not implemented yet)');
                    }, 1500);
                } else {
                    setApiMessage(data.message || 'Login failed. Please check your credentials.');
                }
            } catch (error) {
                console.error('Login error:', error);
                setApiMessage('Network error. Please check your connection and try again.');
            } finally {
                setIsLoading(false);
            }
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
                        
                        {/* API Message Display */}
                        {apiMessage && (
                            <div style={{
                                padding: '10px',
                                borderRadius: '5px',
                                marginBottom: '10px',
                                backgroundColor: apiMessage.includes('successful') ? '#d4edda' : '#f8d7da',
                                color: apiMessage.includes('successful') ? '#155724' : '#721c24',
                                fontSize: '14px',
                                border: `1px solid ${apiMessage.includes('successful') ? '#c3e6cb' : '#f5c6cb'}`
                            }}>
                                {apiMessage}
                            </div>
                        )}
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
                            type="email"
                            id="registerEmail"
                            placeholder="Email"
                            value={formData.registerEmail}
                            onChange={handleInput}
                            required
                        />
                        <div className="error-message">{errors.registerEmail}</div>

                        <input
                            type="password"
                            id="registerPassword"
                            placeholder="Password"
                            value={formData.registerPassword}
                            onChange={handleInput}
                            required
                        />
                        <div className="error-message">{errors.registerPassword}</div>

                        <button 
                            type="submit" 
                            style={{
                                ...buttonStyle,
                                opacity: isLoading ? 0.7 : 1,
                                cursor: isLoading ? 'not-allowed' : 'pointer'
                            }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Registering...' : 'Register'}
                        </button>
                    </form>
                </div>

                <div className="form-container login-container">
                    <form onSubmit={handleLogin} noValidate>
                        <h1>Login</h1>
                        
                        {/* API Message Display */}
                        {apiMessage && (
                            <div style={{
                                padding: '10px',
                                borderRadius: '5px',
                                marginBottom: '10px',
                                backgroundColor: apiMessage.includes('successful') ? '#d4edda' : '#f8d7da',
                                color: apiMessage.includes('successful') ? '#155724' : '#721c24',
                                fontSize: '14px',
                                border: `1px solid ${apiMessage.includes('successful') ? '#c3e6cb' : '#f5c6cb'}`
                            }}>
                                {apiMessage}
                            </div>
                        )}
                        <input
                            type="email"
                            id="loginEmail"
                            placeholder="Email"
                            value={formData.loginEmail}
                            onChange={handleInput}
                            required
                        />
                        <div className="error-message">{errors.loginEmail}</div>

                        <input
                            type="password"
                            id="loginPassword"
                            placeholder="Password"
                            value={formData.loginPassword}
                            onChange={handleInput}
                            required
                        />
                        <div className="error-message">{errors.loginPassword}</div>

                        <div className="pass-link">
                            <Link to="/forgot-password">Forgot password?</Link>
                        </div>
                        <button 
                            type="submit" 
                            style={{
                                ...buttonStyle,
                                opacity: isLoading ? 0.7 : 1,
                                cursor: isLoading ? 'not-allowed' : 'pointer'
                            }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
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
