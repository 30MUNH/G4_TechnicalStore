import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton, Badge } from '@mui/material';
import { ShoppingCart, Favorite, Person } from '@mui/icons-material';
import './Header.css';

const Header = () => {
  return (
    <header>
      {/* Top Header */}
      <div className="top-header">
        <div className="container">
          <div className="top-header-content">
            <div className="top-header-left">
              <Typography variant="body2">
                <i className="fa fa-phone"></i> +021-95-51-84
              </Typography>
              <Typography variant="body2">
                <i className="fa fa-envelope-o"></i> email@email.com
              </Typography>
              <Typography variant="body2">
                <i className="fa fa-map-marker"></i> 1734 Stonecoal Road
              </Typography>
            </div>
            <div className="top-header-right">
              <Typography variant="body2">
                <i className="fa fa-usd"></i> USD
              </Typography>
              <Typography variant="body2">
                <i className="fa fa-user"></i> My Account
              </Typography>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <AppBar position="static" color="inherit" elevation={0} className="main-header" sx={{ backgroundColor: '#191923' }}>
        <Toolbar className="header-container">
          {/* Logo */}
          <div className="logo-container">
            <Link to="/">
              <img src="img/logo.png" alt="Technical store" className="logo" />
            </Link>
          </div>

          {/* Search Bar */}
          <div className="search-container">
            <div className="search-box">
              <select className="search-select">
                <option value="0">All Categories</option>
                <option value="1">Category 01</option>
                <option value="2">Category 02</option>
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

          {/* Account Section */}
          <div className="account-section">
            <Link to="/wishlist" className="account-item">
              <IconButton>
                <Badge badgeContent={2} color="error">
                  <Favorite />
                </Badge>
              </IconButton>
              <span className="account-label">Your Wishlist</span>
            </Link>
            <Link to="/cart" className="account-item">
              <IconButton>
                <Badge badgeContent={3} color="error">
                  <ShoppingCart />
                </Badge>
              </IconButton>
              <span className="account-label">Your Cart</span>
            </Link>
          </div>
        </Toolbar>
      </AppBar>
    </header>
  );
};

export default Header; 