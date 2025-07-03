import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Lock } from 'lucide-react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingReset, setPendingReset] = useState(null);
  const [verifiedOTP, setVerifiedOTP] = useState(null);
  const [showOTPPopup, setShowOTPPopup] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        const cleanPhone = value.replace(/\D/g, '');
        if (cleanPhone.length !== 10) return 'Phone number must be 10 digits';
        if (!cleanPhone.startsWith('0')) return 'Phone number must start with 0';
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
    
    if (name === 'phone') {
      // Only allow digits and limit to 10 characters
      const phoneValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: phoneValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
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
        // Remove leading 0 for API call (backend expects +84xxxxxxxxx format)
        const phoneForApi = formData.phone.slice(1); // Remove leading 0
        const response = await authService.requestPasswordReset(phoneForApi);
        
        if (response && response.success) {
          setPendingReset(phoneForApi);
          setShowOTPPopup(true);
          setErrors({});
        } else if (response && typeof response.message === 'string' && response.message.toLowerCase().includes('otp')) {
          setPendingReset(phoneForApi);
          setShowOTPPopup(true);
          setErrors({});
        } else {
          throw new Error('Failed to send OTP');
        }
      } catch (error) {
        setErrors({ phone: error.response?.data?.message || 'Failed to send OTP. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    } else if (step === 2) {
      // Validate password fields for step 2
      const newPasswordError = validateField('newPassword', formData.newPassword);
      const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword);
      
      if (newPasswordError || confirmPasswordError) {
        setErrors({
          newPassword: newPasswordError,
          confirmPassword: confirmPasswordError
        });
        return;
      }

      if (!verifiedOTP) {
        setErrors({ general: 'OTP verification required' });
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await authService.verifyResetOTP({
          phone: pendingReset,
          otp: verifiedOTP,
          newPassword: formData.newPassword
        });

        if (response && response.success) {
          // Store the phone number for login page
          sessionStorage.setItem('lastResetUser', JSON.stringify({
            phone: formData.phone,
            timestamp: Date.now()
          }));
          
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

    // Store the verified OTP and move to step 2
    setVerifiedOTP(otp);
    setShowOTPPopup(false);
    setStep(2);
    setErrors({});
  };

  const handleResendOTP = async () => {
    if (!pendingReset) {
      setErrors({ general: 'No pending reset session' });
      return;
    }

    try {
      const response = await authService.resendOTP({
        phone: pendingReset,
        isForLogin: true
      });

      if (response && response.success) {
        setErrors({ general: 'New OTP sent to your phone' });
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
          {step === 2 && "Enter OTP code and your new password"}
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
                placeholder="Enter 10 digits"
                value={formData.phone}
                onChange={handleInputChange}
                className={`${styles.input} ${errors.phone ? styles.error : ''}`}
                autoComplete="tel"
                maxLength={10}
              />
            </div>
            {errors.phone && <span className={styles.errorMessage}>{errors.phone}</span>}
          </div>
        )}

        {step === 2 && (
          <>
            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <div className={styles.inputIcon}>
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  name="newPassword"
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.newPassword ? styles.error : ''}`}
                  autoComplete="new-password"
                />
              </div>
              {errors.newPassword && <span className={styles.errorMessage}>{errors.newPassword}</span>}
            </div>

            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <div className={styles.inputIcon}>
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.confirmPassword ? styles.error : ''}`}
                  autoComplete="new-password"
                />
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
            step === 1 ? 'Send OTP' : 'Reset Password'
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