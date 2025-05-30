import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton, Badge } from '@mui/material';
import { ShoppingCart, Favorite, Person } from '@mui/icons-material';
import './Header.css';

// Sub-components
const TopHeader = () => (
  <div className="top-header">
    <div className="container">
      <div className="top-header-content">
        <div className="top-header-left">
          <Typography variant="body2">
            <i className="fa fa-phone"></i> 0373325643
          </Typography>
          <Typography variant="body2">
            <i className="fa fa-envelope-o"></i> manhndthe181128@fpt.edu.vn
          </Typography>
          <Typography variant="body2">
            <i className="fa fa-map-marker"></i> Khu Công Nghệ Cao Hòa Lạc, km 29, Đại lộ, Thăng Long, Hà Nội
          </Typography>
        </div>
        <div className="top-header-right">
          <Typography variant="body2">
            <i className="fa fa-usd"></i>
          </Typography>
          <Typography variant="body2">
            <i className="fa fa-user"></i> My Account
          </Typography>
        </div>
      </div>
    </div>
  </div>
);

const Logo = () => (
  <div className="logo-container">
    <Link to="/">
      <img src="img/logo.png" alt="Technical store" className="logo" />
    </Link>
  </div>
);

const SearchBar = () => (
  <div className="search-container">
    <div className="search-box">
      <select className="search-select">
        <option value="0">All Product</option>
        <option value="1">Laptop</option>
        <option value="2">PC</option>
        <option value="3">Accessory</option>
      </select>
      <input
        type="text"
        placeholder="Search here"
        className="search-input"
      />
      <Button variant="contained" className="search-btn">
        Search
      </Button>
    </div>
  </div>
);

const AccountSection = ({ wishlistCount = 0, cartCount = 0 }) => (
  <div className="account-section">
    <Link to="/wishlist" className="account-item">
      <IconButton>
        <Badge badgeContent={wishlistCount} color="error">
          <Favorite />
        </Badge>
      </IconButton>
      <span className="account-label">Your Wishlist</span>
    </Link>
    <Link to="/cart" className="account-item">
      <IconButton>
        <Badge badgeContent={cartCount} color="error">
          <ShoppingCart />
        </Badge>
      </IconButton>
      <span className="account-label">Your Cart</span>
    </Link>
  </div>
);

AccountSection.propTypes = {
  wishlistCount: PropTypes.number,
  cartCount: PropTypes.number
};

const Header = () => {
  return (
    <header>
      <TopHeader />
      <AppBar position="static" color="inherit" elevation={0} className="main-header" sx={{ backgroundColor: '#232f3e', color: '#fff' }}>
        <Toolbar className="header-container">
          <Logo />
          <SearchBar />
          <AccountSection wishlistCount={2} cartCount={3} />
        </Toolbar>
      </AppBar>
    </header>
  );
};

export default Header; 