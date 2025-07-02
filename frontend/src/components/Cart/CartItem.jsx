import React from 'react';
import { FaTrash } from 'react-icons/fa';
import styles from './CartItem.module.css';

const CartItem = ({ item, onUpdateQuantity, onRemoveItem, formatCurrency }) => {
    console.log('🛒 CartItem Debug - Rendered with props:', {
        item,
        onUpdateQuantity: typeof onUpdateQuantity,
        onRemoveItem: typeof onRemoveItem,
        formatCurrency: typeof formatCurrency
    });

    const handleQuantityDecrease = () => {
        const newQuantity = Math.max(0, item.quantity - 1);
        console.log('🔽 CartItem Debug - Decrease quantity:', {
            itemId: item.id,
            currentQuantity: item.quantity,
            newQuantity: newQuantity
        });
        onUpdateQuantity(item.id, newQuantity);
    };

    const handleQuantityIncrease = () => {
        const newQuantity = item.quantity + 1;
        console.log('🔼 CartItem Debug - Increase quantity:', {
            itemId: item.id,
            currentQuantity: item.quantity,
            newQuantity: newQuantity
        });
        onUpdateQuantity(item.id, newQuantity);
    };

    const handleRemoveItem = () => {
        console.log('🗑️ CartItem Debug - Remove item:', {
            itemId: item.id,
            itemName: item.name,
            quantity: item.quantity
        });
        onRemoveItem(item.id);
    };

    // Debug item data validation
    if (!item) {
        console.error('❌ CartItem Debug - Item is null or undefined');
        return <div>Error: Invalid item data</div>;
    }

    if (!item.id) {
        console.error('❌ CartItem Debug - Item missing ID:', item);
    }

    if (!item.name) {
        console.error('❌ CartItem Debug - Item missing name:', item);
    }

    if (typeof item.price !== 'number') {
        console.warn('⚠️ CartItem Debug - Invalid price type:', typeof item.price, item.price);
    }

    if (typeof item.quantity !== 'number' || item.quantity < 0) {
        console.warn('⚠️ CartItem Debug - Invalid quantity:', typeof item.quantity, item.quantity);
    }

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
                        onClick={handleQuantityDecrease}
                        className={styles.quantityButton}
                        aria-label="Giảm số lượng"
                    >
                        −
                    </button>
                    <span className={styles.quantity}>{item.quantity}</span>
                    <button 
                        onClick={handleQuantityIncrease}
                        className={styles.quantityButton}
                        aria-label="Tăng số lượng"
                    >
                        +
                    </button>
                    <button 
                        onClick={handleRemoveItem}
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
