import React, { useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faEnvelope, faLocationDot, faClock, faShieldHalved, faTruck, faCheckCircle, faHeadset, faComments, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import emailjs from '@emailjs/browser';
import './ContactUs.css';

const ContactUs = () => {
    const form = useRef();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const sendEmail = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        emailjs.sendForm(
            'service_rqshknr',
            'template_tj8a3xn',
            form.current,
            'N_MB7gWT5V-WSfWBY'
        )
            .then(() => {
                alert('Cảm ơn bạn đã liên hệ!');
                form.current.reset();
            })
            .catch(() => {
                alert('Có lỗi xảy ra, vui lòng thử lại.');
            })
            .finally(() => setIsSubmitting(false));
    };

    return (
        <div className="contactus-root">
            {/* Header */}
            <div className="contactus-header">
                <h1>Liên hệ với chúng tôi</h1>
                <div className="header-underline" />
                <p>Chuyên cung cấp linh kiện máy tính chính hãng với giá tốt nhất thị trường</p>
            </div>
            {/* Info boxes */}
            <div className="contactus-info-row">
                <div className="contactus-info-box box-1">
                    <div className="contactus-info-flex">
                        <div className="contactus-info-icon-bg"><FontAwesomeIcon icon={faPhone} className="contactus-info-icon" /></div>
                        <div className="contactus-info-content">
                            <div className="contactus-info-title">Hotline</div>
                            <div className="contactus-info-main">0373307285</div>
                            <div className="contactus-info-desc">Hỗ trợ 24/7</div>
                        </div>
                    </div>
                </div>
                <div className="contactus-info-box box-2">
                    <div className="contactus-info-flex">
                        <div className="contactus-info-icon-bg"><FontAwesomeIcon icon={faEnvelope} className="contactus-info-icon" /></div>
                        <div className="contactus-info-content">
                            <div className="contactus-info-title">Email</div>
                            <div className="contactus-info-main">manhndthe181128@fpt.edu.vn</div>
                            <div className="contactus-info-desc">Phản hồi trong 2h</div>
                        </div>
                    </div>
                </div>
                <div className="contactus-info-box box-3">
                    <div className="contactus-info-flex">
                        <div className="contactus-info-icon-bg"><FontAwesomeIcon icon={faLocationDot} className="contactus-info-icon" /></div>
                        <div className="contactus-info-content">
                            <div className="contactus-info-title">Địa chỉ</div>
                            <div className="contactus-info-main"> Khu Công Nghệ Cao Hòa Lạc, Hà Nội</div>
                            <div className="contactus-info-desc">TP.Hà Nội </div>
                        </div>
                    </div>
                </div>
                <div className="contactus-info-box box-4">
                    <div className="contactus-info-flex">
                        <div className="contactus-info-icon-bg"><FontAwesomeIcon icon={faClock} className="contactus-info-icon" /></div>
                        <div className="contactus-info-content">
                            <div className="contactus-info-title">Giờ làm việc</div>
                            <div className="contactus-info-main">8:00 - 22:00</div>
                            <div className="contactus-info-desc">Tất cả các ngày</div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Main content: form + why us */}
            <div className="contactus-main-row">
                {/* Form */}
                <div className="contactus-form-col">
                    <div className="contactus-form-title">
                        <FontAwesomeIcon icon={faComments} className="contactus-form-title-icon" />
                        <span>Gửi yêu cầu tư vấn</span>
                    </div>
                    <div className="contactus-form-desc">Chúng tôi sẽ phản hồi trong vòng 30 phút</div>
                    <form ref={form} onSubmit={sendEmail} className="contactus-form">
                        <div className="contactus-form-row">
                            <input type="text" name="user_name" placeholder="Họ và tên *" required />
                            <input type="email" name="user_email" placeholder="Email *" required />
                        </div>
                        <div className="contactus-form-row">
                            <input type="tel" name="phone_number" placeholder="Số điện thoại" />
                            <select name="service" defaultValue="">
                                <option value="" disabled>Chọn dịch vụ</option>
                                <option value="tuvan">Tư vấn mua hàng</option>
                                <option value="baohanh">Bảo hành</option>
                                <option value="giaohang">Giao hàng</option>
                                <option value="khac">Khác</option>
                            </select>
                        </div>
                        <textarea name="message" placeholder="Mô tả chi tiết yêu cầu của bạn *" required />
                        <button type="submit" className="contactus-submit-btn" disabled={isSubmitting}>
                            <FontAwesomeIcon icon={faPaperPlane} style={{ marginRight: 8 }} />
                            {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                        </button>
                    </form>
                </div>
                {/* Why us */}
                <div className="contactus-whyus-col">
                    <div className="contactus-whyus-title">Tại sao chọn chúng tôi?</div>
                    <div className="contactus-whyus-list">
                        <div className="contactus-whyus-item">
                            <FontAwesomeIcon icon={faShieldHalved} className="contactus-whyus-icon" />
                            <div>
                                <div className="contactus-whyus-item-title">Bảo hành chính hãng</div>
                                <div className="contactus-whyus-item-desc">Cam kết 100% hàng chính hãng</div>
                            </div>
                        </div>
                        <div className="contactus-whyus-item">
                            <FontAwesomeIcon icon={faTruck} className="contactus-whyus-icon" />
                            <div>
                                <div className="contactus-whyus-item-title">Giao hàng nhanh</div>
                                <div className="contactus-whyus-item-desc">Giao hàng trong 2-4 giờ tại TPHCM</div>
                            </div>
                        </div>
                        <div className="contactus-whyus-item">
                            <FontAwesomeIcon icon={faCheckCircle} className="contactus-whyus-icon" />
                            <div>
                                <div className="contactus-whyus-item-title">Chất lượng đảm bảo</div>
                                <div className="contactus-whyus-item-desc">Kiểm tra kỹ trước khi giao</div>
                            </div>
                        </div>
                        <div className="contactus-whyus-item">
                            <FontAwesomeIcon icon={faHeadset} className="contactus-whyus-icon" />
                            <div>
                                <div className="contactus-whyus-item-title">Tư vấn chuyên nghiệp</div>
                                <div className="contactus-whyus-item-desc">Đội ngũ kỹ thuật giàu kinh nghiệm</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs; 