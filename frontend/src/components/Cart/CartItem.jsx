import React from 'react';
import { Plus, Minus, Trash2, Star } from 'lucide-react';
import './CartItem.css';

export const CartItem = ({ item, onQuantityChange, onRemove }) => {
    const { product, quantity } = item;
    const totalPrice = product.price * quantity;

    return (
        <div className="cart-item">
            <div className="cart-item-content">
                <div className="cart-item-image">
                    <img
                        src={product.image}
                        alt={product.name}
                    />
                </div>

                <div className="cart-item-details">
                    <div className="cart-item-header">
                        <div className="cart-item-info">
                            <h3>{product.name}</h3>
                            <p>{product.brand} • {product.category}</p>
                            <div className="cart-item-rating">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="cart-item-rating-text">{product.rating}</span>
                                <span className="cart-item-rating-reviews">({product.reviews} reviews)</span>
                            </div>
                        </div>

                        <button
                            onClick={onRemove}
                            className="cart-item-remove-btn"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="cart-item-actions">
                        <div className="cart-item-quantity">
                            <button
                                onClick={() => onQuantityChange(product.id, Math.max(1, quantity - 1))}
                                className="cart-item-qty-btn"
                            >
                                <Minus className="w-4 h-4" />
                            </button>

                            <span className="cart-item-qty-display">{quantity}</span>

                            <button
                                onClick={() => onQuantityChange(product.id, quantity + 1)}
                                className="cart-item-qty-btn"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="cart-item-pricing">
                            <div className="cart-item-total">{totalPrice.toLocaleString()}đ</div>
                            <div className="cart-item-unit-price">{product.price.toLocaleString()}đ mỗi sản phẩm</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 