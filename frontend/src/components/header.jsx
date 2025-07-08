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
  const { isAuthenticated, user, logout } = useAuth();
  const { items, totalAmount } = useCart();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);

  // Debug user data
  React.useEffect(() => {
    if (user) {
      console.log('🔍 [DEBUG] Header - User data:', {
        username: user.username,
        phone: user.phone,
        role: user.role,
        isRegistered: user.isRegistered
      });
    }
  }, [user]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(amount)
      .replace('₫', 'đ');
  };

  const totalItems = items ? items.reduce((total, item) => total + item.quantity, 0) : 0;

  const handleSearch = async (e) => {
    e.preventDefault();
    console.log("SEARCH SUBMIT:", searchValue);
    if (!searchValue.trim()) {
      navigate('/all-products', { state: { clearFilter: true } });
      setSearchValue("");
      return;
    }
    setIsSearching(true);
    try {
      const results = await productService.searchProducts(searchValue.trim());
      console.log("SEARCH API RESULT:", results);
      navigate('/all-products', { 
        state: { 
          searchResults: results, 
          searchKeyword: searchValue.trim() 
        } 
      });
      setSearchValue("");
    } catch (error) {
      console.error('Search error:', error);
      navigate('/all-products', { 
        state: { 
          searchKeyword: searchValue.trim() 
        } 
      });
      setSearchValue("");
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserDropdown = (open) => setUserDropdownOpen(open);
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* HEADER */}
      <header>
        {/* TOP HEADER */}
        <div id="top-header">
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <ul className="header-links pull-left" style={{ display: 'flex', gap: 36, alignItems: 'center', marginBottom: 0 }}>
                <li style={{ padding: 0, margin: 0 }}>
                  <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FontAwesomeIcon icon={faPhone} color="#D10024" /> 1900-1234</a>
                </li>
                <li style={{ padding: 0, margin: 0 }}>
                  <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FontAwesomeIcon icon={faEnvelopeRegular} color="#D10024" /> Technical@gmail.com</a>
                </li>
                <li style={{ padding: 0, margin: 0 }}>
                  <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FontAwesomeIcon icon={faMapMarker} color="#D10024" /> Khu Công Nghệ Cao Hòa Lạc, km 29, Đại lộ, Thăng Long, Hà Nội</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* /TOP HEADER */}

        {/* MAIN HEADER */}
        <div id="header">
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, padding: '16px 0' }}>
              {/* LOGO */}
              <div style={{ minWidth: 160, display: 'flex', alignItems: 'center' }}>
                <Link to="/" className="logo">
                  <img src="/img/logo.png" alt="" style={{ height: 60, width: 'auto' }} />
                </Link>
              </div>
              {/* /LOGO */}

              {/* SEARCH BAR */}
              <div style={{ flex: 1, maxWidth: 600, margin: '0 24px' }}>
                <div className="header-search">
                  <form style={{ display: 'flex', width: '100%' }} onSubmit={handleSearch}>
                    <input 
                      className="input" 
                      placeholder="Search for products..." 
                      style={{ flex: 1, minWidth: 0 }} 
                      value={searchValue} 
                      onChange={e => setSearchValue(e.target.value)}
                      disabled={isSearching}
                    />
                    <button 
                      className="search-btn" 
                      type="submit" 
                      disabled={isSearching}
                      style={{ opacity: isSearching ? 0.7 : 1 }}
                    >
                      {isSearching ? 'Searching...' : 'Search'}
                    </button>
                  </form>
                </div>
              </div>
              {/* /SEARCH BAR */}

              {/* Cart + Login */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                {/* Cart */}
                <div className="dropdown" style={{ minWidth: 140, display: 'flex', alignItems: 'center' }}>
                  <Link to="/cart" className="dropdown-toggle" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <FontAwesomeIcon icon={faShoppingCart} />
                    <span style={{ marginLeft: 8, whiteSpace: 'nowrap', fontWeight: 500, fontSize: 17 }}>Your Cart</span>
                    <div className="qty" style={{ marginLeft: 8 }}>{totalItems}</div>
                  </Link>
                  {isAuthenticated() && items && items.length > 0 && (
                    <div className="cart-dropdown">
                      <div className="cart-list">
                        {items.slice(0, 3).map(item => (
                          <div key={item.id} className="product-widget">
                            <div className="product-img">
                              <img 
                                src={item.product.images && item.product.images.length > 0 ? item.product.images[0].url : "/img/product01.png"} 
                                alt={item.product.name} 
                              />
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
                        <h5>SUBTOTAL: {formatCurrency(totalAmount)}</h5>
                      </div>
                      <div className="cart-btns">
                        <Link to="/cart">View Cart</Link>
                        <Link to="/checkout">Checkout <FontAwesomeIcon icon={faArrowCircleRight} /></Link>
                      </div>
                    </div>
                  )}
                </div>
                {/* /Cart */}

                {/* Login Button */}
                <div>
                  {isAuthenticated() ? (
                    <div
                      className="user-dropdown-wrapper"
                      style={{ position: 'relative', display: 'inline-block' }}
                      onMouseEnter={() => handleUserDropdown(true)}
                      onMouseLeave={() => handleUserDropdown(false)}
                    >
                      <span style={{ cursor: 'pointer' }}>
                        <FontAwesomeIcon icon={faUserRegular} /> Welcome, {user?.username || 'User'}
                      </span>
                      {userDropdownOpen && (
                        <div
                          className="user-dropdown-menu"
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            background: '#fff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            zIndex: 1000,
                            minWidth: 120,
                            padding: '8px 0',
                            borderRadius: 4
                          }}
                        >
                          <button
                            onClick={handleLogout}
                            style={{
                              background: 'none',
                              border: 'none',
                              width: '100%',
                              textAlign: 'left',
                              padding: '8px 16px',
                              cursor: 'pointer',
                              color: '#D10024',
                              fontWeight: 500
                            }}
                          >
                            Log out
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link to="/login"><FontAwesomeIcon icon={faUserRegular} /> Login</Link>
                  )}
                </div>
              </div>
              {/* /Cart + Login */}
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