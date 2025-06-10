import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, ShoppingCart } from 'lucide-react';
import { useCartContext } from '../hooks/useCart';

export const Navigation = () => {
    const location = useLocation();
    const { cartItems } = useCartContext();

    const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    const navItems = [
        { path: '/cart', label: 'Giỏ hàng', icon: ShoppingCart, badge: cartItemCount },
    ];

    return (
        <nav className="navigation">
            <div className="nav-container">
                <Link to="/" className="nav-logo">
                    <Package className="logo-icon" />
                    Tech Store
                </Link>

                <ul className="nav-menu">
                    {navItems.map(item => {
                        const IconComponent = item.icon;
                        return (
                            <li key={item.path} className="nav-item">
                                <Link
                                    to={item.path}
                                    className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                                >
                                    <div className="nav-link-content">
                                        <IconComponent className="nav-icon" />
                                        <span className="nav-label">{item.label}</span>
                                        {item.badge && item.badge > 0 && (
                                            <span className="nav-badge">{item.badge}</span>
                                        )}
                                    </div>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </nav>
    );
}; 