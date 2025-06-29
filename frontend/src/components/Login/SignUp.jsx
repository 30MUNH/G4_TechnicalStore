import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Lock, Eye, EyeOff, X, Check } from 'lucide-react';
import FormCard from './FormCard';
import OTPPopup from './OTPPopup';
import styles from './SignUp.module.css';
import { authService } from '../../services/authService';

const SignUp = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOTPPopup, setShowOTPPopup] = useState(false);
  const [pendingSignup, setPendingSignup] = useState(null);

  const validateField = (name, value) => {
    switch (name) {
      case 'username':
        if (!value.trim()) return 'Username is required';
        if (value.length < 3) return 'Username must be at least 3 characters';
        return undefined;
        
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (!/^0\d{9}$/.test(value)) return 'Please enter a valid 10-digit phone number (bắt đầu bằng 0)';
        return undefined;
        
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return undefined;
        
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return undefined;
        
      default:
        return undefined;
    }
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const phoneValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: phoneValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
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
      const formattedPhone = '+84' + formData.phone.substring(1);

      const response = await authService.register({
        username: formData.username,
        phone: formattedPhone,
        password: formData.password,
        roleSlug: 'customer'
      });

      if ((response && response.success) || (response && typeof response.message === 'string' && response.message.toLowerCase().includes('otp'))) {
        setPendingSignup(formattedPhone);
        setShowOTPPopup(true);
        setErrors({});
        setTimeout(() => {
          setErrors({ general: 'Vui lòng kiểm tra tin nhắn OTP để hoàn tất đăng ký.' });
        }, 100);
      } else {
        setErrors({ general: response?.message || 'Unexpected response from server' });
      }
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';

      if (error.response?.status === 409) {
        errorMessage = 'Username or phone number already registered';
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
    if (!pendingSignup || !formData.username) {
      setErrors({ general: 'No pending registration session' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.verifyRegister({
        username: formData.username,
        password: formData.password,
        phone: pendingSignup,
        roleSlug: 'customer',
        otp: otp
      });

      if (response && response.success) {
        alert('Account created successfully! Please login.');
        navigate('/login');
      } else {
        setErrors({ general: response?.message || 'OTP verification failed' });
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
    if (!pendingSignup) {
      setErrors({ general: 'No pending registration session' });
      return;
    }

    try {
      const response = await authService.resendOTP({
        phone: pendingSignup,
        type: 'registration'
      });

      if (response && response.success) {
        alert('New OTP code has been sent to your phone');
      } else {
        setErrors({ general: response?.message || 'Failed to resend OTP' });
      }
    } catch (error) {
      setErrors({ general: error.response?.data?.message || 'Failed to resend OTP. Please try again.' });
    }
  };

  return (
    <FormCard>
      <div className={styles.authHeader}>
        <h1 className={styles.authTitle}>Create Account</h1>
        <p className={styles.authSubtitle}>Join us to explore premium PC components</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.authForm}>
        {errors.general && (
          <div className={styles.errorMessage}>
            <X className="w-4 h-4" />
            {errors.general}
          </div>
        )}

        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <div className={styles.inputIcon}>
              <User className={styles.iconSvg} size={18} />
            </div>
            <input
              type="text"
              name="username"
              placeholder="Choose your username"
              value={formData.username}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.username ? styles.error : ''}`}
            />
          </div>
          {errors.username && (
            <div className={styles.errorMessage}>
              <X className="w-4 h-4" />
              {errors.username}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <div className={styles.inputIcon}>
              <Phone className={styles.iconSvg} size={18} />
            </div>
            <div className={styles.prefixWrapper}>
              +84
            </div>
            <input
              type="tel"
              name="phone"
              placeholder="Enter 10 digits"
              value={formData.phone}
              onChange={handleInputChange}
              className={`${styles.input} ${styles.withPrefix} ${errors.phone ? styles.error : ''}`}
            />
          </div>
          {errors.phone && (
            <div className={styles.errorMessage}>
              <X className="w-4 h-4" />
              {errors.phone}
            </div>
          )}
          {formData.phone && !errors.phone && (
            <div className={styles.successMessage}>
              <Check className="w-4 h-4" />
              Phone: +84{formData.phone}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <div className={styles.inputIcon}>
              <Lock className={styles.iconSvg} size={18} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Create your password"
              value={formData.password}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.password ? styles.error : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.passwordToggle}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {formData.password && (
            <div className={styles.passwordStrength}>
              <div className={styles.strengthBars}>
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`${styles.strengthBar} ${
                      i < passwordStrength ? styles[strengthColors[passwordStrength - 1]] : ''
                    }`}
                  />
                ))}
              </div>
              <p className={styles[`strength${passwordStrength}`]}>
                Password strength: {strengthLabels[passwordStrength - 1] || 'Very Weak'}
              </p>
            </div>
          )}
          {errors.password && (
            <div className={styles.errorMessage}>
              <X className="w-4 h-4" />
              {errors.password}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <div className={styles.inputIcon}>
              <Lock className={styles.iconSvg} size={18} />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.confirmPassword ? styles.error : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={styles.passwordToggle}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <div className={styles.errorMessage}>
              <X className="w-4 h-4" />
              {errors.confirmPassword}
            </div>
          )}
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <div className={styles.successMessage}>
              <Check className="w-4 h-4" />
              Passwords match
            </div>
          )}
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className={styles.loadingWrapper}>
              <div className={styles.spinner}></div>
              Creating Account...
            </div>
          ) : (
            'CREATE ACCOUNT'
          )}
        </button>

        <div className={styles.authLinks}>
          <p className={styles.signInText}>
            Already have an account?{' '}<button type="button" onClick={() => navigate('/login')} className={styles.signInLink}>SIGN IN
            </button>
          </p>
        </div>
      </form>

      {showOTPPopup && (
        <OTPPopup
          isOpen={showOTPPopup}
          onClose={() => {
            setShowOTPPopup(false);
            setPendingSignup(null);
          }}
          onVerify={handleVerifyOTP}
          onResend={handleResendOTP}
          error={errors.general}
        />
      )}
    </FormCard>
  );
};

export default SignUp; 