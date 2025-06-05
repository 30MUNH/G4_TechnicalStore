import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import './ContactUs.css';

const ContactUs = ({ compact }) => {
    const form = useRef();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const sendEmail = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        emailjs.sendForm(
            'service_rqshknr', // EmailJS service ID
            'template_tj8a3xn', //  EmailJS template ID
            form.current,
            'N_MB7gWT5V-WSfWBY' //  EmailJS public key
        )
            .then((result) => {
                alert('Thank you for your message. We will get back to you soon!');
                form.current.reset();
            })
            .catch((error) => {
                alert('Sorry, something went wrong. Please try again later.');
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    return (
        <div className={`contact-us-container${compact ? ' compact' : ''}`} >
            <div className="contact-content" style={compact ? { height: '420px', maxWidth: '700px' } : { height: '600px' }}>
                <div className="contact-image">
                    <img src="/contact.png" alt="Customer Service Team" />
                </div>
                <div className="contact-form-section">
                    <h2 style={{ display: 'flex', justifyContent: 'center', fontSize: compact ? '1.5rem' : undefined }}>CONTACT US</h2>
                    <form ref={form} onSubmit={sendEmail} className="contact-form">
                        <div className="form-group">
                            <label>Name</label>
                            <input
                                type="text"
                                name="user_name"
                                placeholder="abcxyz"
                                required
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="user_email"
                                    placeholder="abcxyz@gmail.com"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone_number"
                                    placeholder="+84 1234567890"
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Message</label>
                            <textarea
                                name="message"
                                placeholder="text here"
                                required
                            ></textarea>
                        </div>
                        <div className="button-container">
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'SENDING...' : 'SUBMIT'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactUs; 