import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckoutForm } from '../components';
import { useCartContext } from '../hooks/useCart';

export const CheckoutPage = () => {
    const navigate = useNavigate();
    const {
        cartItems,
        getFinalTotal,
        getCartTotal,
        getTax,
        getShipping,
        checkout
    } = useCartContext();


    if (cartItems.length === 0) {
        navigate('/cart');
        return null;
    }

    const handleCheckout = (customerInfo) => {
        const order = checkout(customerInfo);
        alert(`Đặt hàng thành công! Mã đơn hàng: ${order.id}`);
        navigate('/orders');
    };

    const handleCancel = () => {
        navigate('/cart');
    };

    return (
        <div className="container-fluid px-4 py-3">
            {/* Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <h2 className="mb-0">Thanh toán đơn hàng</h2>
                    <p className="text-muted">Hoàn tất thông tin để đặt hàng</p>
                </div>
            </div>


            <div className="row g-4">

                <div className="col-lg-6">
                    <div className="card h-100">
                        <div className="card-header bg-light">
                            <h5 className="card-title mb-0">Chi tiết đơn hàng</h5>
                        </div>
                        <div className="card-body">
                            <div className="order-items-bootstrap">
                                {cartItems.map(item => (
                                    <div key={item.product.id} className="d-flex align-items-center mb-3 pb-3 border-bottom">
                                        <img
                                            src={item.product.image}
                                            alt={item.product.name}
                                            className="rounded me-3"
                                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                        />
                                        <div className="flex-grow-1">
                                            <h6 className="mb-1">{item.product.name}</h6>
                                            <small className="text-muted">Số lượng: {item.quantity}</small>
                                        </div>
                                        <div className="text-end">
                                            <strong className="text-primary">
                                                {(item.product.price * item.quantity).toLocaleString()}đ
                                            </strong>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="order-summary-bootstrap mt-4 pt-3 border-top">
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Tạm tính:</span>
                                    <span>{getCartTotal().toLocaleString()}đ</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Thuế (10%):</span>
                                    <span>{getTax().toLocaleString()}đ</span>
                                </div>
                                <div className="d-flex justify-content-between mb-3">
                                    <span>Phí vận chuyển:</span>
                                    <span className="text-success">
                                        {getShipping() === 0 ? 'Miễn phí' : getShipping().toLocaleString() + 'đ'}
                                    </span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between fs-5 fw-bold text-primary">
                                    <span>Tổng cộng:</span>
                                    <span>{getFinalTotal().toLocaleString()}đ</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="col-lg-6">
                    <div className="card h-100">
                        <div className="card-header bg-primary text-white">
                            <h5 className="card-title mb-0">Thông tin thanh toán</h5>
                        </div>
                        <div className="card-body">
                            <CheckoutForm
                                total={getFinalTotal()}
                                onSubmit={handleCheckout}
                                onCancel={handleCancel}
                                isLoading={false}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 