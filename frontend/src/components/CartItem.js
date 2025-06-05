
import React from 'react';
import './CartItem.css';

const CartItem = ({ item, onQtyChange, onRemove }) => {
    return (
        <div className="cart-item">
            <div className="product-section">
                <div className="product-image">
                    <img src={item.images} alt={item.item.name} />
                </div>
                <div className="product-details">
                    <h3>{item.item.name}</h3>
                    <div className="product-price">Đ{item.item.price.toFixed(2)}</div>
                </div>
            </div>

            <div className="quantity-section">
                <div className="quantity-controls">
                    <button onClick={() => onQtyChange(item.item._id, -1)}>−</button>
                    <span className="quantity">{item.qty}</span>
                    <button onClick={() => onQtyChange(item.item._id, 1)}>+</button>
                </div>
            </div>

            <div className="total-section">
                <div className="total-price">
                    ${(item.price * item.qty).toFixed(2)}
                </div>
                <button className="remove-btn" onClick={() => onRemove(item.item._id)}>
                    🗑️
                </button>
            </div>
        </div>
    );
};

export default CartItem;
