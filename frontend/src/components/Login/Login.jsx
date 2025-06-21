import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock, Phone } from 'lucide-react';
import FormCard from './FormCard';
import OTPPopup from './OTPPopup';
import styles from './Login.module.css';

const Login = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    nameOrPhone: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOTPPopup, setShowOTPPopup] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case 'nameOrPhone':
        if (!value.trim()) return 'Name or phone number is required';
        if (value.length < 2) return 'Must be at least 2 characters';
        // Check if it's a phone number (starts with + or digits)
        const isPhone = /^[\+]?[0-9\s\-\(\)]+$/.test(value);
        const isName = /^[a-zA-Z\s]+$/.test(value);
        if (!isPhone && !isName) return 'Enter a valid name or phone number';
        if (isPhone && value.replace(/\D/g, '').length < 10) return 'Phone number must be at least 10 digits';
        return undefined;
        
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return 'Password must contain uppercase, lowercase, and number';
        }
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
    
    // Show OTP popup instead of submitting directly
    setShowOTPPopup(true);
  };

  const handleVerifyOTP = async (otp) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Login successful! Welcome to PC Components Store!');
      setFormData({ nameOrPhone: '', password: '' });
      setShowOTPPopup(false);
    } catch (error) {
      alert('Invalid OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      // Simulate API call to resend OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('New OTP has been sent to your phone!');
    } catch (error) {
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
          onClick={() => onNavigate('forgot')}
        >
          Forgot Password?
        </button>
        <button 
          type="button" 
          className={styles.linkBtn}
          onClick={() => onNavigate('signup')}
        >
          Create Account
        </button>
      </div>

      <OTPPopup
        isOpen={showOTPPopup}
        onClose={() => setShowOTPPopup(false)}
        onVerify={handleVerifyOTP}
        onResend={handleResendOTP}
      />
    </FormCard>
  );
};

export default Login; 