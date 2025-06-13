import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CartItem from '../components/Cart/CartItem';
import { useCartContext } from '../Hook/useCart';

const CartPage = () => {
    const navigate = useNavigate();
    const {
        cartItems,
        updateQuantity,
        removeFromCart,
        getFinalTotal,
        getCartTotal,
        getTax,
        getShipping
    } = useCartContext();

    const handleQuantityChange = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            updateQuantity(productId, newQuantity);
        }
    };

    const handleProceedToCheckout = () => {
        navigate('/checkout');
    };

    // Add cart-page-active class to body to remove main-content padding
    useEffect(() => {
        document.body.classList.add('cart-page-active');
        return () => document.body.classList.remove('cart-page-active');
    }, []);

    if (cartItems.length === 0) {
        return (
            <div style={{ margin: 0, padding: 0 }}>
                {/* Cart page header */}
                <nav className="navbar navbar-expand-lg" style={{
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
                    padding: '1.2rem 2rem',
                    boxShadow: '0 4px 20px rgba(30, 41, 59, 0.4)',
                    margin: 0,
                    marginTop: 0,
                    borderBottom: '2px solid #0ea5e9'
                }}>
                    <div className="container-fluid">
                        <div className="navbar-brand text-white d-flex align-items-center">
                            <div className="me-3" style={{
                                fontSize: '2rem',
                                background: 'linear-gradient(45deg, #ff6b6b, #ffd93d)',
                                borderRadius: '12px',
                                padding: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '50px',
                                height: '50px'
                            }}>
                                🛒
                            </div>
                            <div>
                                <div style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0' }}>
                                    Tech Store
                                </div>
                                <div style={{ fontSize: '0.9rem', opacity: '0.8' }}>
                                    Giỏ hàng của bạn
                                </div>
                            </div>
                        </div>

                        <div className="navbar-nav ms-auto">
                            <button
                                className="btn text-white"
                                style={{
                                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%)',
                                    border: '2px solid rgba(255, 255, 255, 0.1)',
                                    padding: '0.8rem 2rem',
                                    borderRadius: '25px',
                                    fontWeight: '600',
                                    boxShadow: '0 6px 20px rgba(249, 115, 22, 0.3)',
                                    transition: 'all 0.3s ease',
                                    fontSize: '0.95rem'
                                }}
                                onClick={() => navigate('/orders')}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px) scale(1.05)';
                                    e.target.style.boxShadow = '0 8px 25px rgba(249, 115, 22, 0.5)';
                                    e.target.style.background = 'linear-gradient(135deg, #fb923c 0%, #f97316 50%, #ea580c 100%)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0) scale(1)';
                                    e.target.style.boxShadow = '0 6px 20px rgba(249, 115, 22, 0.3)';
                                    e.target.style.background = 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%)';
                                }}
                            >
                                📋 Lịch sử đơn hàng
                            </button>
                        </div>
                    </div>
                </nav>

                <div className="container-fluid px-4 py-5" style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
                    minHeight: 'calc(100vh - 80px)'
                }}>
                    <div className="row justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                        <div className="col-lg-6 col-md-8">
                            <div className="card" style={{
                                border: 'none',
                                borderRadius: '20px',
                                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
                                overflow: 'hidden'
                            }}>
                                <div className="card-body text-center p-5" style={{
                                    background: 'linear-gradient(135deg, #fff 0%, #f8f9ff 100%)'
                                }}>
                                    <div className="mb-4" style={{ position: 'relative' }}>
                                        <div style={{
                                            fontSize: '5rem',
                                            background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                            borderRadius: '50%',
                                            width: '120px',
                                            height: '120px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto',
                                            boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
                                            color: 'white'
                                        }}>
                                            🛒
                                        </div>
                                        <div style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: 'calc(50% - 80px)',
                                            background: 'linear-gradient(45deg, #ff6b6b, #ffd93d)',
                                            borderRadius: '50%',
                                            width: '30px',
                                            height: '30px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.2rem',
                                            boxShadow: '0 5px 15px rgba(255, 107, 107, 0.3)'
                                        }}>
                                            ✨
                                        </div>
                                    </div>

                                    <h2 className="mb-3" style={{
                                        color: '#2d3748',
                                        fontWeight: '700',
                                        fontSize: '2.2rem'
                                    }}>
                                        Giỏ hàng trống
                                    </h2>

                                    <p className="text-muted mb-4" style={{
                                        fontSize: '1.1rem',
                                        lineHeight: '1.6',
                                        color: '#718096'
                                    }}>
                                        Hãy khám phá những sản phẩm tuyệt vời của chúng tôi<br />
                                        và thêm chúng vào giỏ hàng!
                                    </p>

                                    <button
                                        className="btn btn-lg"
                                        style={{
                                            background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
                                            border: '2px solid #0ea5e9',
                                            padding: '1rem 3rem',
                                            borderRadius: '25px',
                                            fontWeight: '600',
                                            color: 'white',
                                            fontSize: '1.1rem',
                                            boxShadow: '0 8px 25px rgba(30, 41, 59, 0.3)',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onClick={() => navigate('/')}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-3px) scale(1.05)';
                                            e.target.style.boxShadow = '0 12px 35px rgba(30, 41, 59, 0.4)';
                                            e.target.style.borderColor = '#38bdf8';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0) scale(1)';
                                            e.target.style.boxShadow = '0 8px 25px rgba(30, 41, 59, 0.3)';
                                            e.target.style.borderColor = '#0ea5e9';
                                        }}
                                    >
                                        🛍️ Khám phá sản phẩm
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ margin: 0, padding: 0 }}>
            {/* Cart page header */}
            <nav className="navbar navbar-expand-lg" style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
                padding: '1.2rem 2rem',
                boxShadow: '0 4px 20px rgba(30, 41, 59, 0.4)',
                margin: 0,
                marginTop: 0,
                borderBottom: '2px solid #0ea5e9'
            }}>
                <div className="container-fluid">
                    <div className="navbar-brand text-white d-flex align-items-center">
                        <div className="me-3" style={{
                            fontSize: '2rem',
                            background: 'linear-gradient(45deg, #ff6b6b, #ffd93d)',
                            borderRadius: '12px',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '50px',
                            height: '50px'
                        }}>
                            🛒
                        </div>
                        <div>
                            <div style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0' }}>
                                Tech Store
                            </div>
                            <div style={{ fontSize: '0.9rem', opacity: '0.8' }}>
                                Giỏ hàng của bạn
                            </div>
                        </div>
                    </div>

                    <div className="navbar-nav ms-auto">
                        <button
                            className="btn text-white"
                            style={{
                                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%)',
                                border: '2px solid rgba(255, 255, 255, 0.1)',
                                padding: '0.8rem 2rem',
                                borderRadius: '25px',
                                fontWeight: '600',
                                boxShadow: '0 6px 20px rgba(249, 115, 22, 0.3)',
                                transition: 'all 0.3s ease',
                                fontSize: '0.95rem'
                            }}
                            onClick={() => navigate('/orders')}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px) scale(1.05)';
                                e.target.style.boxShadow = '0 8px 25px rgba(249, 115, 22, 0.5)';
                                e.target.style.background = 'linear-gradient(135deg, #fb923c 0%, #f97316 50%, #ea580c 100%)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0) scale(1)';
                                e.target.style.boxShadow = '0 6px 20px rgba(249, 115, 22, 0.3)';
                                e.target.style.background = 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%)';
                            }}
                        >
                            📋 Lịch sử đơn hàng
                        </button>
                    </div>
                </div>
            </nav>

            <div className="container-fluid px-4 py-3 cart-page">
                {/* Hidden header but keep history button */}
                <div className="row mb-4" style={{ display: 'none' }}>
                    <div className="col-md-8">
                        <h2 className="mb-0">Giỏ hàng của bạn</h2>
                        <p className="text-muted">Bạn có {cartItems.length} sản phẩm trong giỏ hàng</p>
                    </div>
                    <div className="col-md-4 text-end">
                        <button
                            className="btn btn-info btn-sm text-white"
                            onClick={() => navigate('/orders')}
                        >
                            📋 Lịch sử đơn hàng
                        </button>
                    </div>
                </div>

                {/* Main Content với Bootstrap Grid */}
                <div className="row g-4">
                    {/* Cột trái: Danh sách sản phẩm */}
                    <div className="col-lg-8">
                        <div className="card">
                            <div className="card-header bg-light">
                                <h5 className="card-title mb-0">Sản phẩm trong giỏ hàng</h5>
                            </div>
                            <div className="card-body p-0">
                                <div className="row">
                                    <div className="col-lg-12">
                                        <div className="cart-items-list">
                                            {cartItems
                                                .filter(item => item && item.product)
                                                .map(item => (
                                                    <CartItem
                                                        key={item.product.id}
                                                        item={item}
                                                        onUpdate={handleQuantityChange}
                                                    />
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cột phải: Tóm tắt đơn hàng */}
                    <div className="col-lg-4">
                        <div className="card sticky-top">
                            <div className="card-header bg-primary text-white">
                                <h5 className="card-title mb-0">Tóm tắt đơn hàng</h5>
                            </div>
                            <div className="card-body">
                                <div className="summary-details mb-4">
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

                                <div className="d-grid gap-2">
                                    <button
                                        className="btn btn-primary btn-lg"
                                        onClick={handleProceedToCheckout}
                                    >
                                        🛒 Tiến hành thanh toán
                                    </button>

                                    <button
                                        className="btn btn-outline-secondary"
                                        onClick={() => navigate('/')}
                                    >
                                        ← Tiếp tục mua sắm
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage; 