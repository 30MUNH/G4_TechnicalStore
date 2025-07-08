/** @type {import('react').FC} */
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faMapMarker } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope as faEnvelopeRegular } from '@fortawesome/free-regular-svg-icons';
import '../Page/HomePage.css';

const Footer = () => {
  const navigate = useNavigate();

  const handleFooterNav = (type) => {
    if (type === 'all-products') {
      navigate('/all-products', { state: { clearFilter: true } });
    } else if (type === 'laptop' || type === 'pc' || type === 'accessories') {
      navigate('/all-products', { state: { filter: type } });
    }
  };

  return (
    <footer id="footer">
      <div className="section">
        <div className="container">
          <div className="row">
            <div className="col-md-3 col-xs-6">
              <div className="footer">
                <h3 className="footer-title">About Us</h3>
                <p>Since 2015, we've been fulfilling the tech dreams and big plans of millions of people. You can find literally everything here for your perfect gaming setup.</p>
                <ul className="footer-links">
                  <li><a href="#"><FontAwesomeIcon icon={faMapMarker} color="#D10024" />Khu Công Nghệ Cao Hòa Lạc, km 29, Đại lộ, Thăng Long, Hà Nội</a></li>
                  <li><a href="#"><FontAwesomeIcon icon={faPhone} color="#D10024" />1900-1234</a></li>
                  <li><a href="#"><FontAwesomeIcon icon={faEnvelopeRegular} color="#D10024" />Technical@gmail.com</a></li>
                </ul>
              </div>
            </div>

            <div className="col-md-3 col-xs-6">
              <div className="footer">
                <h3 className="footer-title">Categories</h3>
                <ul className="footer-links">
                  <li><button className="footer-link-btn" style={{background:'none',border:'none',cursor:'pointer',padding:0}} onClick={() => handleFooterNav('all-products')}>All Products</button></li>
                  <li><button className="footer-link-btn" style={{background:'none',border:'none',cursor:'pointer',padding:0}} onClick={() => handleFooterNav('laptop')}>Laptop</button></li>
                  <li><button className="footer-link-btn" style={{background:'none',border:'none',cursor:'pointer',padding:0}} onClick={() => handleFooterNav('pc')}>PC</button></li>
                  <li><button className="footer-link-btn" style={{background:'none',border:'none',cursor:'pointer',padding:0}} onClick={() => handleFooterNav('accessories')}>Accessories</button></li>
                </ul>
              </div>
            </div>

            <div className="col-md-3 col-xs-6">
              <div className="footer">
                <h3 className="footer-title">Information</h3>
                <ul className="footer-links">
                  <li><Link to="/about">About Us</Link></li>
                  <li><Link to="/contact">Contact Us</Link></li>
                  <li><a href="#">Privacy Policy</a></li>
                  <li><a href="#">Orders and Returns</a></li>
                </ul>
              </div>
            </div>

            <div className="col-md-3 col-xs-6">
              <div className="footer">
                <h3 className="footer-title">Service</h3>
                <ul className="footer-links">
                  <li><a href="#">My Account</a></li>
                  <li><Link to="/cart" className="dropdown-toggle">View Cart</Link></li>
                  <li><a href="#">Wishlist</a></li>
                  <li><Link to="/cart?showHistory=true">Track My Order</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 