import React from "react";
import "./../styles/Checkout.css";

const Checkout = ({ subtotal }) => {
    return (
        <div className="checkout-container">
            <h2>Thông tin thanh toán</h2>

            <div className="section">
                <h3>🧑‍💼 Thông tin khách hàng</h3>
                <div className="form-grid">
                    <input type="text" placeholder="Nhập họ và tên" />
                    <input type="email" placeholder="your@email.com" />
                </div>
                <input type="tel" placeholder="📞 0123 456 789" />
            </div>

            <div className="section">
                <h3>📍 Địa chỉ giao hàng</h3>
                <input type="text" placeholder="Số nhà, tên đường" />
                <div className="form-grid">
                    <input type="text" placeholder="Thành phố" />
                    <input type="text" placeholder="70000" />
                </div>
            </div>

            <div className="section">
                <h3>💳 Phương thức thanh toán</h3>
                <div className="payment-options">
                    <label className="payment-option selected">
                        <input type="radio" name="payment" defaultChecked />
                        <span>💳 Thẻ tín dụng</span>
                    </label>
                    <label className="payment-option">
                        <input type="radio" name="payment" />
                        <span>🏦 VNPay</span>
                    </label>
                </div>
            </div>

            <div className="total-row">
                <span>Tổng thanh toán:</span>
                <span className="total-amount">{subtotal.toLocaleString()}Đ</span>
            </div>

            <div className="button-row">
                <button className="cancel-btn">Huỷ</button>
                <button className="submit-btn">Thanh toán</button>
            </div>
        </div>
    );
};

export default Checkout;
