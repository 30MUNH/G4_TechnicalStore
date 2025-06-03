import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import './ContactUs.css';

const ContactUs = () => {
    const form = useRef();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const sendEmail = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);


    };

    return (
        <div className="contact-us-container">
            <div className="contact-content">
                <div className="contact-image">
                    <img src="/contact.png" alt="Customer Service Team" />
                </div>
                <div className="contact-form-section">
                    <h2 style={{ display: 'flex', justifyContent: 'center' }}>CONTACT US</h2>
                    <form ref={form} onSubmit={sendEmail} className="contact-form">
                        <div className="form-group">
                            <label>Name</label>
                            <input
                                type="text"
                                name="user_name"
                                placeholder="Francisco Andrade"
                                required
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="user_email"
                                    placeholder="hello@reallygreasite.com"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone_number"
                                    placeholder="+123-456-7890"
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Message</label>
                            <textarea
                                name="message"
                                placeholder="Hi..."
                                required
                            ></textarea>
                        </div>
                        <div className="button-container">
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={isSubmitting}
                            >
                                SUBMIT
                            </button>
                        </div>

                        {submitStatus && (
                            <div className={`submit-status ${submitStatus.success ? 'success' : 'error'}`}>
                                {submitStatus.message}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactUs; 