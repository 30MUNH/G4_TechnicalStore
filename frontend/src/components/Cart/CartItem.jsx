import React from 'react';
import { Plus, Minus, Trash2, Star } from 'lucide-react';
import { cartService } from '../../services/cartService';
import './CartItem.css';

export default function CartItem({ item, onUpdate }) {
    if (!item) {
        return null; // Or render a placeholder if preferred
    }
    const { product, quantity } = item;
    const totalPrice = product.price * quantity;

    const MAX_QUANTITY = 10;
    const MIN_QUANTITY = 1;

    const validateQuantity = (quantity) => {
        return quantity >= MIN_QUANTITY && quantity <= MAX_QUANTITY;
    };

    const handleQuantityChange = async (productId, newQuantity) => {
        try {
            if (newQuantity < 1) return;
            const difference = newQuantity - quantity;
            const result = await cartService.updateQuantity(productId, difference);
            if (result.cart) {
                onUpdate(result.cart);
            }
        } catch (error) {
            console.error('Failed to update quantity:', error);
        }
    };

    const handleRemove = async () => {
        try {
            const result = await cartService.removeItem(product.id);
            if (result.cart) {
                onUpdate(result.cart);
            }
        } catch (error) {
            console.error('Failed to remove item:', error);
        }
    };

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
                            onClick={handleRemove}
                            className="cart-item-remove-btn"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="cart-item-actions">
                        <div className="cart-item-quantity">
                            <button
                                onClick={() => handleQuantityChange(product.id, quantity - 1)}
                                className="cart-item-qty-btn"
                                disabled={quantity <= 1}
                            >
                                <Minus className="w-4 h-4" />
                            </button>

                            <span className="cart-item-qty-display">{quantity}</span>

                            <button
                                onClick={() => handleQuantityChange(product.id, quantity + 1)}
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
} 