import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckoutForm } from '../components/Cart/CheckoutForm';
import { useCart } from '../contexts/CartContext';
import { orderService } from '../services/orderService';
import { toast } from 'react-toastify';

export const CheckoutPage = () => {
    console.log('💳 CheckoutPage Debug - Component initializing');
    
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
    } = useCart();

    // Removed cart data debug to prevent console spam

    // Debug state changes
    useEffect(() => {
        console.log('💳 CheckoutPage Debug - State changed:', {
            loading,
            error,
            cartItemsCount: cartItems?.length
        });
    }, [loading, error, cartItems]);

    // Component mount/unmount debug
    useEffect(() => {
        console.log('💳 CheckoutPage Debug - Component mounted');
        return () => {
            console.log('💳 CheckoutPage Debug - Component unmounting');
        };
    }, []);

    // Check if cart is empty and redirect
    useEffect(() => {
        if (cartItems.length === 0) {
            console.log('⚠️ CheckoutPage Debug - Cart is empty, redirecting to cart page');
            navigate('/cart');
        }
    }, [cartItems, navigate]);

    if (cartItems.length === 0) {
        console.log('🚫 CheckoutPage Debug - Rendering null due to empty cart');
        return null;
    }

    const handleCheckout = async (customerInfo) => {
        console.log('🚀 CheckoutPage Debug - Checkout process started:', {
            customerInfo,
            cartItemsCount: cartItems.length,
            finalTotal: getFinalTotal()
        });

        try {
            console.log('🔄 CheckoutPage Debug - Setting loading state');
            setLoading(true);
            setError(null);

            // Validate customer info
            const requiredFields = ['fullName', 'phone', 'email', 'address', 'city', 'ward', 'commune'];
            const missingFields = requiredFields.filter(field => !customerInfo[field]);
            
            if (missingFields.length > 0) {
                console.error('❌ CheckoutPage Debug - Missing required fields:', missingFields);
                throw new Error(`Vui lòng điền đầy đủ thông tin: ${missingFields.join(', ')}`);
            }

            console.log('✅ CheckoutPage Debug - Customer info validation passed');

            const orderData = {
                shippingAddress: `${customerInfo.address}, ${customerInfo.commune}, ${customerInfo.ward}, ${customerInfo.city}`,
                customerInfo: {
                    fullName: customerInfo.fullName,
                    phone: customerInfo.phone,
                    email: customerInfo.email
                },
                note: customerInfo.note || '',
                cartItems: cartItems,
                totals: {
                    subtotal: getCartTotal(),
                    tax: getTax(),
                    shipping: getShipping(),
                    total: getFinalTotal()
                }
            };

            console.log('📤 CheckoutPage Debug - Calling orderService.createOrder with data:', orderData);
            const response = await orderService.createOrder(orderData);
            
            console.log('📨 CheckoutPage Debug - Order service response:', response);
            
            if (response.message === "Đặt hàng thành công" || response.success) {
                console.log('✅ CheckoutPage Debug - Order created successfully');
                
                console.log('🧹 CheckoutPage Debug - Clearing cart');
                await clearCart();
                
                console.log('🎉 CheckoutPage Debug - Showing success toast');
                toast.success('Đặt hàng thành công!');
                
                console.log('🔄 CheckoutPage Debug - Navigating to orders page');
                navigate('/orders');
            } else {
                console.error('❌ CheckoutPage Debug - Order creation failed:', response);
                throw new Error(response.error || response.message || 'Đặt hàng thất bại');
            }
        } catch (error) {
            console.error('❌ CheckoutPage Debug - Checkout error:', error);
            const errorMessage = error.message || 'Có lỗi xảy ra khi đặt hàng';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            console.log('🔄 CheckoutPage Debug - Setting loading to false');
            setLoading(false);
        }
    };

    const handleCancel = () => {
        console.log('🔙 CheckoutPage Debug - Checkout cancelled, returning to cart');
        navigate('/cart');
    };

    const formatCurrency = (amount) => {
        try {
            return amount.toLocaleString('vi-VN') + 'đ';
        } catch (error) {
            console.warn('⚠️ CheckoutPage Debug - Currency formatting error:', error);
            return amount + 'đ';
        }
    };

    console.log('💳 CheckoutPage Debug - Rendering checkout page');
    return (
        <div className="container-fluid px-4 py-3">
            {/* Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <h2 className="mb-0">Thanh toán đơn hàng</h2>
                    <p className="text-muted">Hoàn tất thông tin để đặt hàng ({cartItems.length} sản phẩm)</p>
                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}
                </div>
            </div>

            <div className="row g-4">
                <div className="col-md-8">
                    <CheckoutForm 
                        cartItems={cartItems}
                        subtotal={getCartTotal()}
                        shippingFee={getShipping()}
                        totalAmount={getFinalTotal()}
                        onPlaceOrder={handleCheckout}
                        onBackToCart={handleCancel}
                        isProcessing={loading}
                        error={error}
                    />
                </div>
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Tổng quan đơn hàng</h5>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Tổng tiền hàng:</span>
                                <span>{formatCurrency(getCartTotal())}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Thuế:</span>
                                <span>{formatCurrency(getTax())}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span>Phí vận chuyển:</span>
                                <span>{getShipping() === 0 ? 'Miễn phí' : formatCurrency(getShipping())}</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between">
                                <strong>Tổng cộng:</strong>
                                <strong>{formatCurrency(getFinalTotal())}</strong>
                            </div>
                            
                            {/* Debug info in development */}
                            {process.env.NODE_ENV === 'development' && (
                                <div className="mt-3 p-2 bg-light rounded">
                                    <small className="text-muted">
                                        <strong>Debug Info:</strong><br/>
                                        Items: {cartItems.length}<br/>
                                        Loading: {loading ? 'Yes' : 'No'}<br/>
                                        Error: {error ? 'Yes' : 'No'}
                                    </small>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 