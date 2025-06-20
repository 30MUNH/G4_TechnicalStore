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
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
            .format(amount)
            .replace('₫', 'đ');
    };

    return (
        <div className={styles.cartView}>
            <div className={styles.cartHeader}>
                <h1>
                    Giỏ hàng
                    <span className={styles.itemCount}>({cartItems.length} sản phẩm trong giỏ)</span>
                </h1>
                <button onClick={onViewOrderHistory} className={styles.historyButton}>
                    <FaHistory />
                    Lịch sử đơn hàng
                </button>
            </div>

            {cartItems.length === 0 ? (
                <div className={styles.emptyCart}>
                    <FaShoppingCart className={styles.emptyCartIcon} />
                    <h2>Giỏ hàng của bạn đang trống</h2>
                    <p>Hãy thêm sản phẩm vào giỏ hàng và quay lại để tiến hành thanh toán</p>
                    <button onClick={onContinueShopping} className={styles.continueShoppingButton}>
                        <FaShoppingBag />
                        Tiếp tục mua sắm
                    </button>
                </div>
            ) : (
                <div className={styles.cartContent}>
                    <div className={styles.cartItems}>
                        {cartItems.map(item => (
                            <div key={item.id} className={styles.cartItem}>
                                <img src={item.image} alt={item.name} className={styles.itemImage} />
                                <div className={styles.itemDetails}>
                                    <h3>{item.name}</h3>
                                    <p className={styles.itemCategory}>{item.category}</p>
                                    <p className={styles.itemPrice}>{formatCurrency(item.price)}</p>
                                    <div className={styles.quantityControls}>
                                        <button 
                                            onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                                            className={styles.quantityButton}
                                            aria-label="Giảm số lượng"
                                        >
                                            -
                                        </button>
                                        <span className={styles.quantity}>{item.quantity}</span>
                                        <button 
                                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
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
                                        onClick={() => onRemoveItem(item.id)}
                                        className={styles.removeButton}
                                        aria-label="Xóa sản phẩm"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))}
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
                            onClick={onCheckout}
                            className={styles.checkoutButton}
                            disabled={cartItems.length === 0}
                        >
                            Thanh toán
                        </button>
                        <button 
                            onClick={onContinueShopping} 
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
