import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Lock, Eye, EyeOff } from 'lucide-react';
import FormCard from './FormCard';
import OTPPopup from './OTPPopup';
import styles from './ForgotPassword.module.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: New Password
  const [formData, setFormData] = useState({
    phone: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        const cleanPhone = value.replace(/\D/g, '');
        if (cleanPhone.length < 10) return 'Phone number must be at least 10 digits';
        if (cleanPhone.length > 15) return 'Phone number must be less than 15 digits';
        if (!/^[\+]?[0-9\s\-\(\)]+$/.test(value)) return 'Enter a valid phone number';
        return undefined;
        
      case 'otp':
        if (!value.trim()) return 'OTP is required';
        if (value.length !== 6) return 'OTP must be 6 digits';
        return undefined;
        
      case 'newPassword':
        if (!value.trim()) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return undefined;
        
      case 'confirmPassword':
        if (!value.trim()) return 'Confirm password is required';
        if (value !== formData.newPassword) return 'Passwords do not match';
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
    
    const phoneError = validateField('phone', formData.phone);
    if (phoneError) {
      setErrors({ phone: phoneError });
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate sending OTP
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStep(2);
    } catch (error) {
      setErrors({ phone: 'Failed to send OTP. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (otp) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      // After successful OTP verification, navigate to reset password page
      setStep(3);
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

  return (
    <FormCard>
      <div className={styles.authHeader}>
        <h1 className={styles.authTitle}>Reset Password</h1>
        <p className={styles.authSubtitle}>
          {step === 1 && "Enter your phone number to reset password"}
          {step === 2 && "Enter the OTP code sent to your phone"}
          {step === 3 && "Create your new password"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.authForm}>
        {errors.general && (
          <div className={styles.errorMessage} style={{ marginBottom: '1rem', textAlign: 'center' }}>
            {errors.general}
          </div>
        )}

        {step === 1 && (
          <div className={styles.formGroup}>
            <div className={styles.inputWrapper}>
              <div className={styles.inputIcon}>
                <Phone size={20} />
              </div>
              <input
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.phone ? styles.error : ''}`}
                autoComplete="tel"
                maxLength={11}
              />
            </div>
            {errors.phone && <span className={styles.errorMessage}>{errors.phone}</span>}
            
          </div>
        )}

        {step === 3 && (
          <>
            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <div className={styles.inputIcon}>
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.newPassword ? styles.error : ''}`}
                  autoComplete="new-password"
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
              {errors.newPassword && <span className={styles.errorMessage}>{errors.newPassword}</span>}
            </div>

            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <div className={styles.inputIcon}>
                  <Lock size={20} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.confirmPassword ? styles.error : ''}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && <span className={styles.errorMessage}>{errors.confirmPassword}</span>}
            </div>
          </>
        )}

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : (
            step === 1 ? 'Send OTP' :
            step === 2 ? 'Verify OTP' :
            'Reset Password'
          )}
        </button>

        <div className={styles.authLinks}>
          <button type="button" onClick={() => navigate('/login')} className={styles.linkBtn}>
            Back to Sign In
          </button>
        </div>
      </form>

      {step === 2 && (
        <OTPPopup
          onVerify={handleVerifyOTP}
          onClose={() => navigate('/login')}
          isLoading={isSubmitting}
          error={errors.general}
        />
      )}
    </FormCard>
  );
};

export default ForgotPassword; 