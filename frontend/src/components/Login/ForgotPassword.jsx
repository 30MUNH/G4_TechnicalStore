import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Lock, Eye, EyeOff } from 'lucide-react';
import FormCard from './FormCard';
import OTPPopup from './OTPPopup';
import styles from './ForgotPassword.module.css';
import { authService } from '../../services/authService';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); 
  const [formData, setFormData] = useState({
    phone: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOTPPopup, setShowOTPPopup] = useState(false);
  const [pendingReset, setPendingReset] = useState(null);

  const validateField = (name, value) => {
    switch (name) {
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        const cleanPhone = value.replace(/\D/g, '');
        if (cleanPhone.length !== 10) return 'Phone number must be 10 digits';
        return undefined;
        
      case 'newPassword':
        if (!value.trim()) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        if (!/\d/.test(value)) return 'Password must contain at least one number';
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
    
    if (step === 1) {
      const phoneError = validateField('phone', formData.phone);
      if (phoneError) {
        setErrors({ phone: phoneError });
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await authService.requestPasswordReset(formData.phone.replace(/\D/g, ''));
        if (response && response.success) {
          setPendingReset(formData.phone.replace(/\D/g, ''));
          setShowOTPPopup(true);
          setErrors({});
          setTimeout(() => {
            setErrors({ general: 'Vui lòng kiểm tra tin nhắn OTP để đặt lại mật khẩu.' });
          }, 100);
          setStep(2);
        } else if (response && typeof response.message === 'string' && response.message.toLowerCase().includes('otp')) {
          setPendingReset(formData.phone.replace(/\D/g, ''));
          setShowOTPPopup(true);
          setErrors({});
          setTimeout(() => {
            setErrors({ general: 'Vui lòng kiểm tra tin nhắn OTP để đặt lại mật khẩu.' });
          }, 100);
          setStep(2);
        } else {
          throw new Error('Failed to send OTP');
        }
      } catch (error) {
        setErrors({ phone: error.response?.data?.message || 'Failed to send OTP. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    } else if (step === 3) {
      const newPasswordError = validateField('newPassword', formData.newPassword);
      const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword);
      
      if (newPasswordError || confirmPasswordError) {
        setErrors({
          newPassword: newPasswordError,
          confirmPassword: confirmPasswordError
        });
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await authService.resetPassword({
          phone: pendingReset,
          newPassword: formData.newPassword
        });

        if (response && response.success) {
          alert('Password has been reset successfully!');
          navigate('/login');
        } else {
          throw new Error('Failed to reset password');
        }
      } catch (error) {
        setErrors({ general: error.response?.data?.message || 'Failed to reset password. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleVerifyOTP = async (otp) => {
    if (!pendingReset) {
      setErrors({ general: 'No pending reset session' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.verifyResetOTP({
        phone: pendingReset,
        otp: otp
      });

      if (response && response.success) {
        setShowOTPPopup(false);
        setStep(3);
      } else {
        throw new Error('Invalid OTP');
      }
    } catch (error) {
      setErrors({ general: error.response?.data?.message || 'Invalid OTP. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    if (!pendingReset) {
      setErrors({ general: 'No pending reset session' });
      return;
    }

    try {
      const response = await authService.resendOTP({
        phone: pendingReset,
        type: 'reset'
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
            step === 3 ? 'Reset Password' :
            'Verify OTP'
          )}
        </button>

        <div className={styles.authLinks}>
          <button type="button" onClick={() => navigate('/login')} className={styles.linkBtn}>
            Back to Sign In
          </button>
        </div>
      </form>

      {showOTPPopup && (
        <OTPPopup
          isOpen={showOTPPopup}
          onClose={() => {
            setShowOTPPopup(false);
            setPendingReset(null);
            navigate('/login');
          }}
          onVerify={handleVerifyOTP}
          onResend={handleResendOTP}
          error={errors.general}
        />
      )}
    </FormCard>
  );
};

export default ForgotPassword; 