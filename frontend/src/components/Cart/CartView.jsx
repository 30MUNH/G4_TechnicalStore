import React from 'react';
import { FaHistory, FaShoppingBag, FaShoppingCart, FaTrash } from 'react-icons/fa';
import styles from './CartView.module.css';

const CartView = ({ 
    cartItems, 
    onUpdateQuantity, 
    onRemoveItem, 
    onCheckout, 
    onViewOrderHistory, 
    onContinueShopping,
    subtotal, 
    shippingFee, 
    totalAmount 
}) => {
    console.log('🛒 CartView Debug - Component rendered with props:', {
        cartItemsCount: cartItems?.length,
        cartItems: cartItems,
        subtotal,
        shippingFee,
        totalAmount,
        onUpdateQuantity: typeof onUpdateQuantity,
        onRemoveItem: typeof onRemoveItem,
        onCheckout: typeof onCheckout,
        onViewOrderHistory: typeof onViewOrderHistory,
        onContinueShopping: typeof onContinueShopping
    });

    const formatCurrency = (amount) => {
        console.log('💰 CartView Debug - Formatting currency:', { amount, type: typeof amount });
        try {
            const formatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
                .format(amount)
                .replace('₫', 'đ');
            console.log('💰 CartView Debug - Currency formatted:', { original: amount, formatted });
            return formatted;
        } catch (error) {
            console.error('❌ CartView Debug - Currency formatting error:', error, { amount });
            return `${amount} đ`;
        }
    };

    const handleUpdateQuantity = (itemId, newQuantity) => {
        console.log('🔄 CartView Debug - Update quantity called:', {
            itemId,
            newQuantity,
            type: typeof newQuantity
        });
        if (typeof onUpdateQuantity === 'function') {
            onUpdateQuantity(itemId, newQuantity);
        } else {
            console.error('❌ CartView Debug - onUpdateQuantity is not a function:', typeof onUpdateQuantity);
        }
    };

    const handleRemoveItem = (itemId) => {
        console.log('🗑️ CartView Debug - Remove item called:', { itemId });
        if (typeof onRemoveItem === 'function') {
            onRemoveItem(itemId);
        } else {
            console.error('❌ CartView Debug - onRemoveItem is not a function:', typeof onRemoveItem);
        }
    };

    const handleCheckout = () => {
        console.log('💳 CartView Debug - Checkout called:', {
            cartItemsCount: cartItems?.length,
            totalAmount,
            hasCheckoutFunction: typeof onCheckout === 'function'
        });
        if (typeof onCheckout === 'function') {
            onCheckout();
        } else {
            console.error('❌ CartView Debug - onCheckout is not a function:', typeof onCheckout);
        }
    };

    const handleViewOrderHistory = () => {
        console.log('📋 CartView Debug - View order history called');
        if (typeof onViewOrderHistory === 'function') {
            onViewOrderHistory();
        } else {
            console.error('❌ CartView Debug - onViewOrderHistory is not a function:', typeof onViewOrderHistory);
        }
    };

    const handleContinueShopping = () => {
        console.log('🛍️ CartView Debug - Continue shopping called');
        if (typeof onContinueShopping === 'function') {
            onContinueShopping();
        } else {
            console.error('❌ CartView Debug - onContinueShopping is not a function:', typeof onContinueShopping);
        }
    };

    // Validate cart data
    if (!Array.isArray(cartItems)) {
        console.error('❌ CartView Debug - cartItems is not an array:', cartItems);
        return <div>Error: Invalid cart data</div>;
    }

    // Validate numeric values
    if (typeof subtotal !== 'number') {
        console.warn('⚠️ CartView Debug - Invalid subtotal type:', typeof subtotal, subtotal);
    }
    if (typeof shippingFee !== 'number') {
        console.warn('⚠️ CartView Debug - Invalid shippingFee type:', typeof shippingFee, shippingFee);
    }
    if (typeof totalAmount !== 'number') {
        console.warn('⚠️ CartView Debug - Invalid totalAmount type:', typeof totalAmount, totalAmount);
    }

    return (
        <div className={styles.cartView}>
            <div className={styles.cartHeader}>
                <h1>
                    Giỏ hàng
                    <span className={styles.itemCount}>({cartItems.length} sản phẩm trong giỏ)</span>
                </h1>
                <button onClick={handleViewOrderHistory} className={styles.historyButton}>
                    <FaHistory />
                    Lịch sử đơn hàng
                </button>
            </div>

            {cartItems.length === 0 ? (
                <div className={styles.emptyCart}>
                    <FaShoppingCart className={styles.emptyCartIcon} />
                    <h2>Giỏ hàng của bạn đang trống</h2>
                    <p>Hãy thêm sản phẩm vào giỏ hàng và quay lại để tiến hành thanh toán</p>
                    <button onClick={handleContinueShopping} className={styles.continueShoppingButton}>
                        <FaShoppingBag />
                        Tiếp tục mua sắm
                    </button>
                </div>
            ) : (
                <div className={styles.cartContent}>
                    <div className={styles.cartItems}>
                        {cartItems.map(item => {
                            console.log('🛒 CartView Debug - Rendering cart item:', item);
                            return (
                                <div key={item.id} className={styles.cartItem}>
                                    <img src={item.image} alt={item.name} className={styles.itemImage} />
                                    <div className={styles.itemDetails}>
                                        <h3>{item.name}</h3>
                                        <p className={styles.itemCategory}>{item.category}</p>
                                        <p className={styles.itemPrice}>{formatCurrency(item.price)}</p>
                                        <div className={styles.quantityControls}>
                                            <button 
                                                onClick={() => handleUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                                                className={styles.quantityButton}
                                                aria-label="Giảm số lượng"
                                            >
                                                -
                                            </button>
                                            <span className={styles.quantity}>{item.quantity}</span>
                                            <button 
                                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                className={styles.quantityButton}
                                                aria-label="Tăng số lượng"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <div className={styles.itemActions}>
                                        <div className={styles.itemTotal}>
                                            <span>Thành tiền:</span>
                                            <span className={styles.totalValue}>
                                                {formatCurrency(item.price * item.quantity)}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => handleRemoveItem(item.id)}
                                            className={styles.removeButton}
                                            aria-label="Xóa sản phẩm"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className={styles.cartSummary}>
                        <h2>Tóm tắt đơn hàng</h2>
                        <div className={styles.summaryDetails}>
                            <div className={styles.summaryRow}>
                                <span>Tạm tính ({cartItems.length} sản phẩm)</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Phí vận chuyển</span>
                                <span>{shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}</span>
                            </div>
                            <div className={`${styles.summaryRow} ${styles.total}`}>
                                <span>Tổng cộng</span>
                                <span>{formatCurrency(totalAmount)}</span>
                            </div>
                        </div>
                        <button 
                            onClick={handleCheckout}
                            className={styles.checkoutButton}
                            disabled={cartItems.length === 0}
                        >
                            Thanh toán
                        </button>
                        <button 
                            onClick={handleContinueShopping} 
                            className={styles.continueShoppingBtn}
                        >
                            <FaShoppingBag />
                            Tiếp tục mua sắm
                        </button>
                        {totalAmount > 1000000 && shippingFee === 0 && (
                            <p className={styles.shippingPromo}>
                                Miễn phí vận chuyển cho đơn hàng trên 1.000.000đ
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartView;
