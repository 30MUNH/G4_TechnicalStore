import React from 'react';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import CartItem from './CartItem';
import styles from './CartView.module.css';

const CartView = () => {
    const { items, totalAmount, loading, error, clearCart } = useCart();
    const navigate = useNavigate();

    const handleCheckout = () => {
        navigate('/checkout');
    };

    const handleClearCart = async () => {
        try {
            await clearCart();
        } catch (error) {
            console.error('Failed to clear cart:', error);
        }
    };

    if (loading) {
        return (
            <div className={styles.cartView}>
                <div className={styles.loading}>
                    <p>Loading cart...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.cartView}>
                <div className={styles.error}>
                    <p>Error: {error}</p>
                </div>
            </div>
        );
    }

    if (!items || items.length === 0) {
        return (
            <div className={styles.cartView}>
                <div className={styles.emptyCart}>
                    <h2>Your cart is empty</h2>
                    <p>Add some products to get started</p>
                    <button 
                        className={styles.continueShopping}
                        onClick={() => navigate('/products')}
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.cartView}>
            <div className={styles.cartHeader}>
                <h2>Shopping Cart ({items.length} items)</h2>
                <button 
                    className={styles.clearCartBtn}
                    onClick={handleClearCart}
                    disabled={loading}
                >
                    Clear Cart
                </button>
            </div>

            <div className={styles.cartContent}>
                <div className={styles.cartItems}>
                    {items.map((item) => (
                        <CartItem 
                            key={item.id} 
                            item={item}
                        />
                    ))}
                </div>

                <div className={styles.cartSummary}>
                    <h3>Order Summary</h3>
                    
                    <div className={styles.summaryRow}>
                        <span>Total Amount:</span>
                        <span className={styles.totalAmount}>
                            {totalAmount.toLocaleString('vi-VN')} ₫
                        </span>
                    </div>

                    <div className={styles.note}>
                        <p>* Tax and shipping will be calculated at checkout</p>
                    </div>

                    <div className={styles.cartActions}>
                        <button 
                            className={styles.continueShoppingBtn}
                            onClick={() => navigate('/products')}
                        >
                            Continue Shopping
                        </button>
                        
                        <button 
                            className={styles.checkoutBtn}
                            onClick={handleCheckout}
                            disabled={loading}
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartView;
