import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faPhone, faMapMarker, faShoppingCart, faTimes, faArrowCircleRight, faBars, faUser as faUserRegular } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope as faEnvelopeRegular } from '@fortawesome/free-regular-svg-icons';
import '../Page/HomePage.css';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { productService } from '../services/productService';

const Header = () => {
  const { isAuthenticated, user } = useAuth();
  const { cartItems, getCartTotal } = useCart();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = React.useState("");

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(amount)
      .replace('₫', 'đ');
  };

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    const results = await productService.searchProducts(searchValue.trim());
    navigate('/all-products', { state: { searchResults: results, searchKeyword: searchValue.trim() } });
  };

  return (
    <>
      {/* HEADER */}
      <header>
        {/* TOP HEADER */}
        <div id="top-header">
          <div className="container">
            <ul className="header-links pull-left">
              <li>
                <a href="#"><FontAwesomeIcon icon={faPhone} color="#D10024" /> 1900-1234</a>
              </li>
              <li>
                <a href="#"><FontAwesomeIcon icon={faEnvelopeRegular} color="#D10024" /> Technical@gmail.com</a>
              </li>
              <li>
                <a href="#"><FontAwesomeIcon icon={faMapMarker} color="#D10024" /> Khu Công Nghệ Cao Hòa Lạc, km 29, Đại lộ, Thăng Long, Hà Nội</a>
              </li>
            </ul>
            <ul className="header-links pull-right">
              <li>
                {isAuthenticated() ? (
                  <span><FontAwesomeIcon icon={faUserRegular} /> Welcome, {user?.username || 'User'}</span>
                ) : (
                  <Link to="/login"><FontAwesomeIcon icon={faUserRegular} /> My Account</Link>
                )}
              </li>
            </ul>
          </div>
        </div>
        {/* /TOP HEADER */}

        {/* MAIN HEADER */}
        <div id="header">
          <div className="container">
            <div className="row">
              {/* LOGO */}
              <div className="col-md-3">
                <div className="header-logo">
                  <Link to="../Page/HomePage.tsx" className="logo">
                    <img src="/img/logo.png" alt="" />
                  </Link>
                </div>
              </div>
              {/* /LOGO */}

              {/* SEARCH BAR */}
              <div className="col-md-6">
                <div className="header-search">
                  <form style={{ display: 'flex', width: '100%' }} onSubmit={handleSearch}>
                    <input className="input" placeholder="Search here" style={{ flex: 1 }} value={searchValue} onChange={e => setSearchValue(e.target.value)} />
                    <button className="search-btn" type="submit">Search</button>
                  </form>
                </div>
              </div>
              {/* /SEARCH BAR */}

              {/* ACCOUNT */}
              <div className="col-md-3 clearfix">
                <div className="header-ctn">
                  {/* Wishlist */}
                  <div>
                    <a href="#">
                      <FontAwesomeIcon icon={faHeart} size="lg" className="wishlist-icon" />
                      <span className="wishlist-text">Your Wishlist</span>
                      <div className="qty">0</div>
                    </a>
                  </div>
                  {/* /Wishlist */}

                  {/* Cart */}
                  <div className="dropdown">
                    <Link to="/cart" className="dropdown-toggle">
                      <FontAwesomeIcon icon={faShoppingCart} />
                      <span>Your Cart</span>
                      <div className="qty">{totalItems}</div>
                    </Link>
                    
                    {isAuthenticated() && cartItems.length > 0 && (
                      <div className="cart-dropdown">
                        <div className="cart-list">
                          {cartItems.slice(0, 3).map(item => (
                            <div key={item.id} className="product-widget">
                              <div className="product-img">
                                <img src="/img/product01.png" alt={item.product.name} />
                              </div>
                              <div className="product-body">
                                <h3 className="product-name">
                                  <a href="#">{item.product.name}</a>
                                </h3>
                                <h4 className="product-price">
                                  <span className="qty">{item.quantity}x</span>
                                  {formatCurrency(item.product.price)}
                                </h4>
                              </div>
                              <button className="delete">
                                <FontAwesomeIcon icon={faTimes} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="cart-summary">
                          <small>{totalItems} Item(s) selected</small>
                          <h5>SUBTOTAL: {formatCurrency(getCartTotal())}</h5>
                        </div>
                        <div className="cart-btns">
                          <Link to="/cart">View Cart</Link>
                          <Link to="/checkout">Checkout <FontAwesomeIcon icon={faArrowCircleRight} /></Link>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* /Cart */}

                  {/* Menu Toogle */}
                  <div className="menu-toggle">
                    <a href="#">
                      <FontAwesomeIcon icon={faBars} />
                      <span>Menu</span>
                    </a>
                  </div>
                  {/* /Menu Toogle */}
                </div>
              </div>
              {/* /ACCOUNT */}
            </div>
          </div>
        </div>
        {/* /MAIN HEADER */}
      </header>
      {/* /HEADER */}
    </>
  );
};

export default Header; 