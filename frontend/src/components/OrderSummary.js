import React, { useState } from 'react';
import './OrderSummary.css';

const OrderSummary = ({ subtotal, onCheckout }) => {
    const [coupon, setCoupon] = useState('');

    return (
        <div className="order-summary">
            <h2>ORDER SUMMARY</h2>

            <div className="summary-line">
                <span>Subtotal</span>
                <span>{subtotal.toFixed(2)}Đ</span>
            </div>

            <div className="summary-line">
                <span>Shipping</span>
                <span>Free</span>
            </div>

            <div className="summary-line">
                <span>VAT</span>
                <span>Free</span>
            </div>

            <div className="summary-total">
                <span>TOTAL</span>
                <span>{subtotal.toFixed(2)}Đ</span>
            </div>

            <button className="checkout-btn" onClick={onCheckout}>
                PROCCEES TO CHECKOUT
            </button>
        </div>
    );
};

export default OrderSummary;