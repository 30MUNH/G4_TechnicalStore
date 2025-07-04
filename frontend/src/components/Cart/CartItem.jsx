import React, { useState, useRef } from 'react';
import { useCart } from '../../contexts/CartContext';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import styles from './CartItem.module.css';

const CartItem = ({ item }) => {
    const { increaseQuantity, decreaseQuantity, removeItem } = useCart();
    const [isUpdating, setIsUpdating] = useState(false);
    const debounceRef = useRef(null);

    const handleIncrease = async () => {
        if (isUpdating) return; // Prevent multiple rapid clicks
        
        setIsUpdating(true);
        try {
            await increaseQuantity(item.product.id, 1);
        } catch (error) {
            console.error('Failed to increase quantity:', error);
        } finally {
            setTimeout(() => setIsUpdating(false), 50); // Brief delay to prevent spam
        }
    };

    const handleDecrease = async () => {
        if (isUpdating) return; // Prevent multiple rapid clicks
        
        if (item.quantity <= 1) {
            // If quantity is 1, remove the item instead of decreasing to 0
            handleRemove();
            return;
        }
        
        setIsUpdating(true);
        try {
            await decreaseQuantity(item.product.id, 1);
        } catch (error) {
            console.error('Failed to decrease quantity:', error);
        } finally {
            setTimeout(() => setIsUpdating(false), 50); // Brief delay to prevent spam
        }
    };

    const handleRemove = async () => {
        if (isUpdating) return; // Prevent multiple rapid clicks
        
        setIsUpdating(true);
        try {
            await removeItem(item.product.id);
        } catch (error) {
            console.error('Failed to remove item:', error);
        } finally {
            setTimeout(() => setIsUpdating(false), 50);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount).replace('₫', '₫');
    };

    // Calculate item total
    const itemTotal = item.product.price * item.quantity;

    return (
        <div className={styles.cartItem}>
            <div className={styles.productImage}>
                {item.product.url ? (
                    <img 
                        src={item.product.url} 
                        alt={item.product.name}
                        onError={(e) => {
                            e.target.src = '/img/product-placeholder.png';
                        }}
                    />
                ) : (
                    <div className={styles.imagePlaceholder}>
                        <span>No Image</span>
                    </div>
                )}
            </div>

            <div className={styles.productInfo}>
                <h3 className={styles.productName}>{item.product.name}</h3>
                {item.product.category && (
                    <p className={styles.productCategory}>{item.product.category}</p>
                )}
                <p className={styles.productPrice}>
                    {formatCurrency(item.product.price)}
                </p>
                
                {/* Stock info */}
                <div className={styles.stockInfo}>
                    <span className={`${styles.stockStatus} ${item.product.stock > 0 ? styles.inStock : styles.outOfStock}`}>
                        {item.product.stock > 0 ? `${item.product.stock} in stock` : 'Out of stock'}
                    </span>
                </div>
            </div>

            <div className={styles.quantityControls}>
                <button 
                    className={styles.quantityBtn}
                    onClick={handleDecrease}
                    disabled={isUpdating}
                    aria-label="Decrease quantity"
                >
                    <FaMinus />
                </button>
                
                <span className={styles.quantity}>{item.quantity}</span>
                
                <button 
                    className={styles.quantityBtn}
                    onClick={handleIncrease}
                    disabled={isUpdating || item.product.stock <= item.quantity}
                    aria-label="Increase quantity"
                    style={{ opacity: (isUpdating || item.product.stock <= item.quantity) ? 0.6 : 1 }}
                >
                    <FaPlus />
                </button>
            </div>

            <div className={styles.itemTotal}>
                <span className={styles.totalLabel}>Total:</span>
                <span className={styles.totalAmount}>
                    {formatCurrency(itemTotal)}
                </span>
            </div>

            <div className={styles.itemActions}>
                <button 
                    className={styles.removeBtn}
                    onClick={handleRemove}
                    disabled={isUpdating}
                    aria-label="Remove item from cart"
                    style={{ opacity: isUpdating ? 0.6 : 1 }}
                >
                    <FaTrash />
                </button>
            </div>
        </div>
    );
};

export default CartItem;
