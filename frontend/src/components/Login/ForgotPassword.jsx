import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone } from 'lucide-react';
import FormCard from './FormCard';
import OTPPopup from './OTPPopup';
import styles from './ForgotPassword.module.css';

const ForgotPassword = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOTPPopup, setShowOTPPopup] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        const cleanPhone = value.replace(/\D/g, '');
        if (cleanPhone.length < 10) return 'Phone number must be at least 10 digits';
        if (cleanPhone.length > 15) return 'Phone number must be less than 15 digits';
        if (!/^[\+]?[0-9\s\-\(\)]+$/.test(value)) return 'Enter a valid phone number';
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
      setShowOTPPopup(true);
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
      onNavigate('reset');
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

  return (
    <FormCard>
      <div className={styles.authHeader}>
        <h1 className={styles.authTitle}>Reset Password</h1>
        <p className={styles.authSubtitle}>Enter your phone number to receive a verification code</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.authForm}>
        <div className={styles.formGroup}>
          <div className={styles.inputWrapper}>
            <div className={styles.inputIcon}>
              <Phone size={20} />
            </div>
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleInputChange}
              className={`${styles.input} ${errors.phone ? styles.error : ''}`}
            />
          </div>
          {errors.phone && <span className={styles.errorMessage}>{errors.phone}</span>}
        </div>

        <button 
          type="submit" 
          className={styles.submitBtn}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
        </button>
      </form>

      <div className={styles.authLinks}>
        <button 
          type="button" 
          className={styles.linkBtn}
          onClick={() => navigate('/login')}
        >
          Back to Sign In
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

export default ForgotPassword; 