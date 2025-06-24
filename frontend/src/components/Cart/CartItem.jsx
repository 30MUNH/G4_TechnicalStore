import React from 'react';
import { FaTrash } from 'react-icons/fa';
import styles from './CartItem.module.css';

const CartItem = ({ item, onUpdateQuantity, onRemoveItem, formatCurrency }) => {
    return (
        <div className={styles.cartItem}>
            <img src={item.image} alt={item.name} className={styles.itemImage} />
            
            <div className={styles.itemInfo}>
                <h3 className={styles.itemName}>{item.name}</h3>
                <p className={styles.itemCategory}>{item.category}</p>
                <p className={styles.itemPrice}>{formatCurrency(item.price)}</p>
            </div>
            
            <div className={styles.itemControls}>
                <div className={styles.quantityControls}>
                    <button 
                        onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                        className={styles.quantityButton}
                        aria-label="Giảm số lượng"
                    >
                        −
                    </button>
                    <span className={styles.quantity}>{item.quantity}</span>
                    <button 
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className={styles.quantityButton}
                        aria-label="Tăng số lượng"
                    >
                        +
                    </button>
                    <button 
                        onClick={() => onRemoveItem(item.id)}
                        className={styles.removeButton}
                        aria-label="Xóa sản phẩm"
                    >
                        <FaTrash />
                    </button>
                </div>
                
                <div className={styles.itemTotal}>
                    <span className={styles.totalLabel}>Thành tiền:</span>
                    <span className={styles.totalPrice}>{formatCurrency(item.price * item.quantity)}</span>
                </div>
            </div>
        </div>
    );
};

export default CartItem;
