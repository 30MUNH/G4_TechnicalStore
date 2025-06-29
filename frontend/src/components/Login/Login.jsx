import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Lock, Eye, EyeOff } from 'lucide-react';
import FormCard from './FormCard';
import OTPPopup from './OTPPopup';
import styles from './Login.module.css';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

const Login = ({ onNavigate }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '', 
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOTPPopup, setShowOTPPopup] = useState(false);
  const [pendingLogin, setPendingLogin] = useState(null);

  const validateField = (name, value) => {
    switch (name) {
      case 'username':
        if (!value) return 'Phone number is required';
        if (!/^0\d{9}$/.test(value)) return 'Please enter a valid 10-digit phone number (bắt đầu bằng 0)';
        return undefined;

      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return undefined;

      default:
        return undefined;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'username') {
      const numbersOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: numbersOnly }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: undefined }));
      }
      const error = validateField(name, numbersOnly);
      if (error) {
        setErrors(prev => ({ ...prev, [name]: error }));
      }
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const phoneNumber = formData.username.replace(/\D/g, '');
      const formattedPhone = phoneNumber && phoneNumber.length === 10 && phoneNumber.startsWith('0')
        ? '+84' + phoneNumber.slice(1)
        : phoneNumber;

      const loginData = {
        username: formattedPhone,
        password: formData.password
      };

      const response = await authService.login(loginData);

      if (response && typeof response === 'string' && response.toLowerCase().includes('otp')) {
        setPendingLogin(formattedPhone);
        setShowOTPPopup(true);
        setErrors({});
        setTimeout(() => {
          setErrors({ general: 'Vui lòng kiểm tra tin nhắn OTP để hoàn tất đăng nhập.' });
        }, 100);
      } else {
        setErrors({ general: 'Unexpected response from server' });
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please check your credentials.';

      if (error.response?.status === 401) {
        errorMessage = 'Invalid phone number or password';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Invalid input format';
      } else if (!navigator.onLine) {
        errorMessage = 'No internet connection. Please check your network.';
      }

      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (otp) => {
    if (!pendingLogin) {
      setErrors({ general: 'No pending login session' });
      return;
    }

    setIsSubmitting(true);
    try {
      const verifyData = {
        username: pendingLogin,
        otp: otp.trim()
      };

      const response = await authService.verifyLogin(verifyData);

      if (response && typeof response === 'string') {
        login({ username: pendingLogin }, response);
        setShowOTPPopup(false);
        setPendingLogin(null);
        navigate('/');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      let errorMessage = 'OTP verification failed. Please try again.';

      if (error.response?.status === 401) {
        errorMessage = 'Invalid OTP code';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    if (!pendingLogin) {
      setErrors({ general: 'No pending login session' });
      return;
    }

    try {
      const response = await authService.resendOTP({
        phone: pendingLogin,
        type: 'login'
      });

      if (response && response.success) {
        alert('New OTP code has been sent to your phone');
      } else {
        throw new Error('Failed to resend OTP');
      }
    } catch (error) {
      setErrors({ general: 'Failed to resend OTP. Please try again.' });
    }
  };

  return (
    <FormCard>
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
              <Phone size={20} />
            </div>
            <div className={styles.prefixWrapper}>
              +84
            </div>
            <input
              type="tel"
              name="username"
              placeholder="Enter 10 digits"
              value={formData.username}
              onChange={handleInputChange}
              className={`${styles.input} ${styles.withPrefix} ${errors.username ? styles.error : ''}`}
              autoComplete="tel"
              maxLength={10}
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