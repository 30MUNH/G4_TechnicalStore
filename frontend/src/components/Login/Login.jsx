import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, Phone } from 'lucide-react';
import FormCard from './FormCard';
import OTPPopup from './OTPPopup';
import styles from './Login.module.css';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

const Login = ({ onNavigate }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    nameOrPhone: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOTPPopup, setShowOTPPopup] = useState(false);
  const [pendingLogin, setPendingLogin] = useState(null);

  const validateField = (name, value) => {
    switch (name) {
      case 'nameOrPhone':
        if (!value.trim()) return 'Name or phone number is required';
        if (value.length < 2) return 'Must be at least 2 characters';

        const isPhone = /^[\+]?[0-9\s\-\(\)]+$/.test(value);
        const isName = /^[a-zA-Z\s]+$/.test(value);
        if (!isPhone && !isName) return 'Enter a valid name or phone number';
        if (isPhone && value.replace(/\D/g, '').length < 10) return 'Phone number must be at least 10 digits';
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

      const response = await authService.login({
        username: formData.nameOrPhone,
        password: formData.password
      });
      
      
      if (response && typeof response === 'string' && response.includes('OTP')) {
        setPendingLogin(formData.nameOrPhone);
        setShowOTPPopup(true);
        setErrors({});
      } else {
        setErrors({ general: 'Unexpected response from server' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ 
        general: error.response?.data?.message || 'Login failed. Please check your credentials.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (otp) => {
    if (!pendingLogin) return;
    
    setIsSubmitting(true);
    try {
      const response = await authService.verifyLogin({
        username: pendingLogin,
        otp: otp
      });
      
      // Backend trả về trực tiếp accessToken string
      console.log('OTP verification response:', response);
      const accessToken = response;
      
      if (accessToken && typeof accessToken === 'string') {
        // Tạo user object với thông tin cơ bản
        const user = {
          id: pendingLogin, 
          username: pendingLogin,
          email: '', 
          fullName: pendingLogin, 
          role: 'user' 
        };
        
        
        login(user, accessToken);
        
        setShowOTPPopup(false);
        setPendingLogin(null);
        
        
        navigate('/');
        alert('Login successful!');
      } else {
        throw new Error('Invalid token received');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setErrors({ 
        general: error.response?.data?.message || 'OTP verification failed. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    if (!pendingLogin) return;
    
    try {
     
      await authService.login({
        username: formData.nameOrPhone,
        password: formData.password
      });
      alert('New OTP has been sent!');
    } catch (error) {
      console.error('Resend OTP error:', error);
      alert('Failed to resend OTP. Please try again.');
    }
  };

  const isPhoneNumber = /^[\+]?[0-9\s\-\(\)]+$/.test(formData.nameOrPhone);

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
              {isPhoneNumber ? <Phone size={20} /> : <User size={20} />}
            </div>
            <input
              type="text"
              name="nameOrPhone"
              placeholder="Name or Phone Number"
              value={formData.nameOrPhone}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.nameOrPhone ? styles.error : ''}`}
            />
          </div>
          {errors.nameOrPhone && <span className={styles.errorMessage}>{errors.nameOrPhone}</span>}
        </div>

        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <div className={styles.inputIcon}>
              <Lock size={20} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.password ? styles.error : ''}`}
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
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
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className={styles.authLinks}>
        <button 
          type="button" 
          className={styles.linkBtn}
          onClick={() => navigate('/forgot-password')}
        >
          Forgot Password?
        </button>
        <button 
          type="button" 
          className={styles.linkBtn}
          onClick={() => navigate('/signup')}
        >
          Create Account
        </button>
      </div>

      <OTPPopup
        isOpen={showOTPPopup}
        onClose={() => {
          setShowOTPPopup(false);
          setPendingLogin(null);
        }}
        onVerify={handleVerifyOTP}
        onResend={handleResendOTP}
      />
    </FormCard>
  );
};

export default Login; 