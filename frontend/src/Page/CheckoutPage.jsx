import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckoutForm } from '../components/Cart/CheckoutForm';
import { useCartContext } from '../Hook/useCart.jsx';
import { orderService } from '../services/orderService';
import { toast } from 'react-toastify';

export const CheckoutPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const {
        cartItems,
        getFinalTotal,
        getCartTotal,
        getTax,
        getShipping,
        clearCart
    } = useCartContext();

    if (cartItems.length === 0) {
        navigate('/cart');
        return null;
    }

    const handleCheckout = async (customerInfo) => {
        try {
            setLoading(true);
            setError(null);

            const orderData = {
                shippingAddress: customerInfo.address,
                note: customerInfo.note
            };

            const response = await orderService.createOrder(orderData);
            
            if (response.message === "Đặt hàng thành công") {
                clearCart();
                toast.success('Đặt hàng thành công!');
                navigate('/orders');
            } else {
                throw new Error(response.error || 'Đặt hàng thất bại');
            }
        } catch (error) {
            setError(error.message);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
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
                    {error && <div className="alert alert-danger">{error}</div>}
                </div>
            </div>

            <div className="row g-4">
                <div className="col-md-8">
                    <CheckoutForm 
                        onSubmit={handleCheckout} 
                        onCancel={handleCancel}
                        loading={loading}
                    />
                </div>
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Tổng quan đơn hàng</h5>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Tổng tiền hàng:</span>
                                <span>{getCartTotal().toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Thuế:</span>
                                <span>{getTax().toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span>Phí vận chuyển:</span>
                                <span>{getShipping().toLocaleString('vi-VN')}đ</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between">
                                <strong>Tổng cộng:</strong>
                                <strong>{getFinalTotal().toLocaleString('vi-VN')}đ</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 