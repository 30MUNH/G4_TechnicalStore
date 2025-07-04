import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, ArrowLeft } from 'lucide-react';
import FormCard from './FormCard';
import OTPPopup from './OTPPopup';
import styles from './Login.module.css';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import signupDebugUtils, { otpDebugUtils } from '../../utils/signupDebug';

const Login = ({ onNavigate }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOTPPopup, setShowOTPPopup] = useState(false);
  const [pendingLogin, setPendingLogin] = useState(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Check for stored registration or reset data
  useEffect(() => {
    // Check for registration data
    const lastRegisteredUser = sessionStorage.getItem('lastRegisteredUser');
    if (lastRegisteredUser) {
      try {
        const { username, timestamp } = JSON.parse(lastRegisteredUser);
        // Only use data if it's less than 5 minutes old
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          setFormData(prev => ({ ...prev, username }));
        }
        // Clear the stored data
        sessionStorage.removeItem('lastRegisteredUser');
      } catch (error) {
        console.error('Error parsing lastRegisteredUser:', error);
      }
    }

    // Check for password reset data
    const lastResetUser = sessionStorage.getItem('lastResetUser');
    if (lastResetUser) {
      try {
        const { phone, timestamp } = JSON.parse(lastResetUser);
        // Only use data if it's less than 5 minutes old
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          // We need to get the username associated with this phone number
          authService.getUsernameByPhone(phone)
            .then(username => {
              if (username) {
                setFormData(prev => ({ ...prev, username }));
              }
            })
            .catch(error => console.error('Error getting username:', error));
        }
        // Clear the stored data
        sessionStorage.removeItem('lastResetUser');
      } catch (error) {
        console.error('Error parsing lastResetUser:', error);
      }
    }
  }, []);

  // Debug helper function
  const getDebugInfo = () => {
    return {
      formData: { 
        username: formData.username, 
        passwordLength: formData.password.length 
      },
      states: {
        isSubmitting,
        showOTPPopup,
        pendingLogin: !!pendingLogin,
        hasErrors: Object.keys(errors).length > 0
      },
      authState: {
        hasToken: !!localStorage.getItem('authToken'),
        hasUser: !!localStorage.getItem('user')
      }
    };
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'username':
        if (!value.trim()) {
          return 'Username is required';
        }
        
        // Simple username validation
        if (value.length < 3) {
          return 'Username must be at least 3 characters';
        }
        return '';
        
      case 'password':
        if (!value) {
          return 'Password is required';
        }
        if (value.length < 6) {
          return 'Password must be at least 6 characters';
        }
        return '';
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      const fieldError = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: fieldError
      }));
    }

    if (errors.general) {
      setErrors(prev => ({
        ...prev,
        general: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.group('🔍 [DEBUG] Login Form Submission');
    console.log('📥 Raw form data:', {
      username: formData.username,
      usernameLength: formData.username.length,
      passwordLength: formData.password.length,
      usernameType: typeof formData.username
    });
    
    const usernameError = validateField('username', formData.username);
    const passwordError = validateField('password', formData.password);

    console.log('🔍 Validation results:', {
      usernameError,
      passwordError,
      hasErrors: !!(usernameError || passwordError)
    });

    if (usernameError || passwordError) {
      setErrors({
        username: usernameError,
        password: passwordError
      });
      console.log('❌ Validation failed, stopping submission');
      console.groupEnd();
      return;
    }

    setIsSubmitting(true);
    try {
      // Simple username processing - just trim whitespace
      const processedUsername = formData.username.trim();
      
      console.log('👤 Processing username input:', processedUsername);

      const loginData = {
        username: processedUsername,
        password: formData.password
      };

      console.log('📤 Sending login request:', { 
        username: loginData.username, 
        passwordLength: loginData.password.length,
        originalInput: formData.username
      });

      const response = await authService.login(loginData);
      
      console.log('📨 Login response received:', {
        response,
        responseType: typeof response,
        includesOTP: response?.toLowerCase?.()?.includes('otp'),
        wrappedData: response?.data,
        wrappedDataType: typeof response?.data
      });

      // Handle both wrapped and direct response formats
      const responseMessage = typeof response === 'string' ? response : response?.data;
      const hasOTP = responseMessage && typeof responseMessage === 'string' && responseMessage.toLowerCase().includes('otp');
      
      console.log('🔍 OTP check:', {
        responseMessage,
        hasOTP,
        messageType: typeof responseMessage
      });

      if (hasOTP) {
        console.log('✅ OTP required, showing popup');
        setPendingLogin(processedUsername); // Use processed username
        setShowOTPPopup(true);
        setErrors({});
        setTimeout(() => {
          setErrors({ general: 'Vui lòng kiểm tra tin nhắn OTP để hoàn tất đăng nhập.' });
        }, 100);
      } else {
        console.error('❌ Unexpected response format:', response);
        setErrors({ general: 'Unexpected response from server' });
      }
    } catch (error) {
      console.error('❌ Login error details:', {
        error,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        originalUsername: formData.username,
        config: error.config
      });
      
      let errorMessage = 'Login failed. Please check your credentials.';

      if (error.response?.status === 401) {
        errorMessage = 'Invalid username or password. Please check and try again.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Invalid input format';
      } else if (error.response?.status === 404) {
        errorMessage = 'Account not found. Please check your username.';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many attempts. Please try again later.';
      } else if (!navigator.onLine) {
        errorMessage = 'No internet connection. Please check your network.';
      }

      console.log('📝 Setting error message:', errorMessage);
      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
      console.groupEnd();
    }
  };

  const handleVerifyOTP = async (otp) => {
    console.group('🔍 [DEBUG] OTP Verification Process');
    
    if (!pendingLogin) {
      console.error('❌ No pending login session');
      setErrors({ general: 'No pending login session' });
      console.groupEnd();
      return;
    }

    console.log('📥 OTP verification input:', {
      username: pendingLogin,
      otp: otp,
      otpLength: otp?.length,
      otpType: typeof otp
    });

    setIsSubmitting(true);
    try {
      const verifyData = {
        username: pendingLogin,
        otp: otp.trim()
      };

      console.log('📤 Sending OTP verification request:', {
        username: verifyData.username,
        otpLength: verifyData.otp.length,
        endpoint: '/account/verify-login'
      });

      const response = await authService.verifyLogin(verifyData);
      
      console.log('📨 OTP verification response received:', {
        response,
        responseType: typeof response,
        responseLength: typeof response === 'string' ? response.length : 'Not string',
        isString: typeof response === 'string',
        hasData: !!response?.data,
        hasSuccess: !!response?.success,
        fullStructure: response
      });

      // Handle both wrapped and direct response formats
      const responseToken = typeof response === 'string' ? response : response?.data;
      const isValidToken = responseToken && typeof responseToken === 'string' && responseToken.length > 10;
      
      console.log('🔍 Token validation:', {
        responseToken: responseToken?.substring(0, 20) + '...',
        tokenType: typeof responseToken,
        tokenLength: responseToken?.length,
        isValidToken,
        tokenSource: typeof response === 'string' ? 'direct' : 'wrapped'
      });

      if (isValidToken) {
        console.log('✅ OTP verification successful, logging in user');
        
        // Enhanced success callback for login
        const handleLoginSuccess = () => {
          console.log('🎉 Preparing login success callback...');
          
          // Store success state for better UX
          sessionStorage.setItem('loginSuccess', JSON.stringify({
            username: pendingLogin,
            timestamp: Date.now()
          }));
          
          console.log('💾 Login success state stored');
          
          // Successful login - authenticate user
          login({ username: pendingLogin }, responseToken);
          console.log('🔐 User authenticated via AuthContext');
          
          // Clear OTP popup and pending state
          setShowOTPPopup(false);
          setPendingLogin(null);
          console.log('🧹 Cleared OTP popup and pending state');
          
          // Success logging
          console.log('🎉 Login completed successfully for user:', pendingLogin);
          
          // Navigate with success state
          navigate('/', { 
            state: { 
              welcomeMessage: `Chào mừng bạn trở lại!`,
              loginTime: new Date().toLocaleTimeString('vi-VN')
            } 
          });
          console.log('🔄 Navigation to home page initiated');
        };
        
        // Execute success callback
        handleLoginSuccess();
        
      } else {
        console.error('❌ Invalid OTP verification response:', {
          response,
          expectedStringToken: 'Expected JWT token string',
          actualResponse: response,
          tokenCheck: {
            hasResponseToken: !!responseToken,
            isString: typeof responseToken === 'string',
            hasMinLength: responseToken?.length > 10
          }
        });
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ OTP verification error details:', {
        error,
        errorType: typeof error,
        errorMessage: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        requestData: {
          username: pendingLogin,
          otpProvided: !!otp
        },
        fullError: error
      });
      
      let errorMessage = 'OTP verification failed. Please try again.';

      if (error.response?.status === 401) {
        errorMessage = 'Invalid OTP code or OTP has expired';
      } else if (error.response?.status === 404) {
        errorMessage = 'Login session not found. Please start login again.';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many OTP attempts. Please try again later.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message === 'Invalid response format') {
        errorMessage = 'Server response format error. Please try logging in again.';
      }

      console.log('📝 Setting OTP error message:', errorMessage);
      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
      console.groupEnd();
    }
  };

  const handleResendOTP = async () => {
    if (!pendingLogin) {
      setErrors({ general: 'No pending login session' });
      return;
    }

    try {
      const response = await authService.resendOTP({
        username: pendingLogin,
        isForLogin: true
      });

      if (response && response.success) {
        alert('New OTP code has been sent to your phone');
        setErrors(prev => ({
          ...prev,
          general: ''
        }));
      } else {
        throw new Error(response?.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      let errorMessage = 'Failed to resend OTP. Please try again.';
      
      if (error.response?.status === 429) {
        errorMessage = 'Too many requests. Please wait before requesting again.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Username not found. Please check and try again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setErrors({ general: errorMessage });
    }
  };

  useEffect(() => {
    console.group('🔑 [DEBUG] Login Component Mount');
    
    // Check if coming from registration
    const registrationSuccess = sessionStorage.getItem('registrationSuccess');
    if (registrationSuccess) {
      console.log('✅ Detected successful registration');
      try {
        const regData = JSON.parse(registrationSuccess);
        console.log('📊 Registration data:', {
          username: regData.username,
          timestamp: new Date(regData.timestamp).toLocaleString()
        });
        
        // Pre-fill username if available
        if (regData.username) {
          setFormData(prev => ({ ...prev, username: regData.username }));
          console.log('📝 Pre-filled username from registration');
        }
      } catch (e) {
        console.warn('❌ Invalid registration data');
      }
    }
    
    // Force clear any stale auth tokens to prevent 401 errors
    const existingToken = localStorage.getItem('authToken');
    if (existingToken) {
      console.log('🧹 Clearing stale auth token from previous session');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Dispatch clear event for contexts
      window.dispatchEvent(new CustomEvent('auth:clear'));
    }
    
    // Add debug helpers to window for testing
    window.otpDebugUtils = otpDebugUtils;
    window.loginDebug = {
      testCredentials: (username, password) => {
        console.log('🧪 Testing credentials:', { username, passwordLength: password?.length });
        setFormData({ username, password });
      },
      
      getCurrentFormData: () => formData,
      
      simulateSubmit: () => {
        console.log('🎭 Simulating form submission with current data');
        handleSubmit({ preventDefault: () => {} });
      },
      
      checkRegistrationData: () => {
        const regData = sessionStorage.getItem('registrationSuccess');
        if (regData) {
          const parsed = JSON.parse(regData);
          console.log('📋 Available registration data:', parsed);
          return parsed;
        }
        console.log('📭 No registration data found');
        return null;
      },
      
      // Test various username formats
      testUsernameFormats: async (baseUsername, password) => {
        const testCases = [
          baseUsername,                    // Original
          baseUsername.toLowerCase(),      // Lowercase
          baseUsername.toUpperCase(),      // Uppercase
          `+84${baseUsername}`,           // With +84 prefix (if phone)
          `0${baseUsername}`,             // With 0 prefix (if phone)
          baseUsername.replace(/^0/, ''), // Remove leading 0 (if phone)
        ];
        
        console.group('🧪 Testing multiple username formats');
        
        for (const testUsername of testCases) {
          console.log(`🔍 Testing username: "${testUsername}"`);
          try {
            const response = await authService.login({ 
              username: testUsername, 
              password: password 
            });
            console.log(`✅ SUCCESS with "${testUsername}":`, response);
            return { success: true, username: testUsername, response };
          } catch (error) {
            console.log(`❌ FAILED with "${testUsername}":`, error.response?.data?.message || error.message);
          }
        }
        
        console.log('❌ All username formats failed');
        console.groupEnd();
        return { success: false };
      },
      
      // Quick test with registration data
      testWithRegistrationData: async () => {
        const regData = window.loginDebug.checkRegistrationData();
        if (!regData) {
          console.log('❌ No registration data to test with');
          return;
        }
        
        console.log('🚀 Testing with registration username and common passwords...');
        const commonPasswords = ['123456', 'password', 'admin', '12345678'];
        
        // First try with the registration username
        for (const pwd of commonPasswords) {
          console.log(`🔍 Testing ${regData.username} with password: ${pwd}`);
          try {
            const response = await authService.login({ 
              username: regData.username, 
              password: pwd 
            });
            console.log(`✅ SUCCESS:`, response);
            return { success: true, username: regData.username, password: pwd };
          } catch (error) {
            console.log(`❌ Failed:`, error.response?.data?.message);
          }
        }
        
        console.log('❌ No working password found');
      }
    };
    
    // Add signupDebugUtils to window for easy access
    window.signupDebugUtils = signupDebugUtils;
    
    // Add authService to window for console testing
    window.authService = authService;
    
    console.log('🔓 Login page ready - clean auth state');
    console.log('🛠️ Debug helper: window.loginDebug available');
    console.groupEnd();
  }, []);

  return (
    <FormCard>
      <button 
        type="button" 
        onClick={() => navigate('/')} 
        className={styles.backArrowBtn}
        aria-label="Back to Home"
      >
        <ArrowLeft size={20} />
      </button>
      
      <div className={styles.authHeader}>
        <h1 className={styles.authTitle}>Welcome Back!</h1>
        <p className={styles.authSubtitle}>Sign in to access premium PC components</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.authForm}>
        {errors.general && (
          <div className={styles.errorMessage} style={{ marginBottom: '1rem', textAlign: 'center' }}>
            {errors.general}
          </div>
        )}

        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <div className={styles.inputIcon}>
              <User size={20} />
            </div>
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.username ? styles.error : ''}`}
              autoComplete="username"
            />
          </div>
          {errors.username && <span className={styles.errorMessage}>{errors.username}</span>}
        </div>

        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <div className={styles.inputIcon}>
              <Lock size={20} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.password ? styles.error : ''}`}
              autoComplete="current-password"
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && <span className={styles.errorMessage}>{errors.password}</span>}
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>

        <div className={styles.authLinks}>
          <button type="button" onClick={() => navigate('/signup')} className={styles.linkBtn}>
            Create Account
          </button>
          <button type="button" onClick={() => navigate('/forgot-password')} className={styles.linkBtn}>
            Forgot Password?
          </button>
        </div>
      </form>

      {showOTPPopup && (
        <OTPPopup
          isOpen={showOTPPopup}
          onClose={() => {
            setShowOTPPopup(false);
            setPendingLogin(null);
          }}
          onVerify={handleVerifyOTP}
          onResend={handleResendOTP}
          error={errors.general}
        />
      )}
    </FormCard>
  );
};

export default Login; 