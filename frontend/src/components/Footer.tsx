import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer" style={{background: '#222', color: '#fff', padding: '3rem 0 1rem', marginTop: '3rem', width: '100%'}}>
      <div className="footer-container" style={{width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32, padding: '0 1rem'}}>
        <div className="footer-section">
          <h3 style={{marginBottom: 12}}>SEE INFORMATION</h3>
          <p>123, 2nd Road, 21st, Main City, Your address goes here</p>
          <p><b>Phone:</b> 230 456 7890</p>
          <p><b>Email:</b> info@yourcompany.com</p>
        </div>
        <div className="footer-section">
          <h3 style={{marginBottom: 12}}>COMPANY</h3>
          <ul style={{listStyle: 'none', padding: 0, color: '#bbb'}}>
            <li>About Us</li>
            <li>Careers</li>
            <li>Blog</li>
            <li>Contact Us</li>
          </ul>
        </div>
        <div className="footer-section">
          <h3 style={{marginBottom: 12}}>USEFUL LINKS</h3>
          <ul style={{listStyle: 'none', padding: 0, color: '#bbb'}}>
            <li>Legal & Privacy</li>
            <li>Contact</li>
            <li>Gift Card</li>
            <li>Customer Service</li>
            <li>Affiliate</li>
          </ul>
        </div>
        <div className="footer-section">
          <h3 style={{marginBottom: 12}}>EXPLORE</h3>
          <ul style={{listStyle: 'none', padding: 0, color: '#bbb'}}>
            <li>Gift in</li>
            <li>Compare</li>
            <li>FAQ's</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
        <div className="footer-section">
          <h3 style={{marginBottom: 12}}>MY ACCOUNT</h3>
          <ul style={{listStyle: 'none', padding: 0, color: '#bbb'}}>
            <li>My Account</li>
            <li>My Order History</li>
            <li>My Wish List</li>
            <li>Order Tracking</li>
            <li>Shopping Cart</li>
          </ul>
        </div>
      </div>
      <div style={{textAlign: 'center', marginTop: 32}}>
        <div style={{marginBottom: 16}}>
          <a href="#" style={{color: '#7ac142', margin: '0 8px', fontSize: 20}}>●</a>
          <a href="#" style={{color: '#7ac142', margin: '0 8px', fontSize: 20}}>●</a>
          <a href="#" style={{color: '#7ac142', margin: '0 8px', fontSize: 20}}>●</a>
          <a href="#" style={{color: '#7ac142', margin: '0 8px', fontSize: 20}}>●</a>
        </div>
        <div style={{fontSize: 13, color: '#bbb'}}>Copyright © 2022 . All Rights Reserved</div>
      </div>
    </footer>
  );
};

export default Footer; 