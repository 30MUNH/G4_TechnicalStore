import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faPhone, faMapMarker, faShoppingCart, faTimes, faArrowCircleRight, faBars, faStar, faExchange, faEye, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope as faEnvelopeRegular, faUser as faUserRegular, faStar as faStarRegular, faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import './HomePage.css';

const HomePage = () => {
  return (
    <>
      {/* HEADER */}
      <header>
        {/* TOP HEADER */}
        <div id="top-header">
          <div className="container">
            <ul className="header-links pull-left">
              <li>
                <a href="#"><FontAwesomeIcon icon={faPhone} color="#D10024" /> 0373307285</a>
              </li>
              <li>
                <a href="#"><FontAwesomeIcon icon={faEnvelopeRegular} color="#D10024" /> manhndthe181128@fpt.edu.vn</a>
              </li>
              <li>
                <a href="#"><FontAwesomeIcon icon={faMapMarker} color="#D10024" /> Khu Công Nghệ Cao Hòa Lạc, km 29, Đại lộ, Thăng Long, Hà Nội</a>
              </li>
            </ul>
            <ul className="header-links pull-right">
              <li>
                <a href="#"><FontAwesomeIcon icon={faUserRegular} /> My Account</a>
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
                  <a href="#" className="logo">
                    <img src="/img/logo.png" alt="" />
                  </a>
                </div>
              </div>
              {/* /LOGO */}

              {/* SEARCH BAR */}
              <div className="col-md-6">
                <div className="header-search">
                  <form>
                    <select className="input-select">
                      <option value="0">All Categories</option>
                      <option value="1">Category 01</option>
                      <option value="1">Category 02</option>
                    </select>
                    <input className="input" placeholder="Search here" />
                    <button className="search-btn">Search</button>
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
                      <div className="qty">2</div>
                    </a>
                  </div>
                  {/* /Wishlist */}

                  {/* Cart */}
                  <div className="dropdown">
                    <Link to="/cart" className="dropdown-toggle">
                      <FontAwesomeIcon icon={faShoppingCart} />
                      <span>Your Cart</span>
                      <div className="qty">3</div>
                    </Link>
                    <div className="cart-dropdown">
                      <div className="cart-list">
                        <div className="product-widget">
                          <div className="product-img">
                            <img src="/img/product01.png" alt="" />
                          </div>
                          <div className="product-body">
                            <h3 className="product-name">
                              <a href="#">product name goes here</a>
                            </h3>
                            <h4 className="product-price">
                              <span className="qty">1x</span>$980.00
                            </h4>
                          </div>
                          <button className="delete">
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        </div>

                        <div className="product-widget">
                          <div className="product-img">
                            <img src="/img/product02.png" alt="" />
                          </div>
                          <div className="product-body">
                            <h3 className="product-name">
                              <a href="#">product name goes here</a>
                            </h3>
                            <h4 className="product-price">
                              <span className="qty">3x</span>$980.00
                            </h4>
                          </div>
                          <button className="delete">
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        </div>
                      </div>
                      <div className="cart-summary">
                        <small>3 Item(s) selected</small>
                        <h5>SUBTOTAL: $2940.00</h5>
                      </div>
                      <div className="cart-btns">
                        <Link to="/cart">View Cart</Link>
                        <a href="#">Checkout <FontAwesomeIcon icon={faArrowCircleRight} /></a>
                      </div>
                    </div>
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

      {/* NAVIGATION */}
      <nav id="navigation">
        <div className="container">
          <div id="responsive-nav">
            <ul className="main-nav nav navbar-nav">
              <li className="active"><a href="#">Home</a></li>
              <li><a href="#">Hot Deals</a></li>
              <li><a href="#">Categories</a></li>
              <li><a href="#">Laptop</a></li>
              <li><a href="#">PC</a></li>
              <li><a href="#">Accessories</a></li>
              <li><a href="#">Build PC</a></li>
            </ul>
          </div>
        </div>
      </nav>
      {/* /NAVIGATION */}

      {/* SECTION */}
      <div className="section">
        <div className="container">
          <div className="row">
            {/* shop */}
            <div className="col-md-4 col-xs-6">
              <div className="shop">
                <div className="shop-img">
                  <img src="/img/shop01.png" alt="" />
                </div>
                <div className="shop-body">
                  <h3>Laptop<br />Collection</h3>
                  <a href="#" className="cta-btn"
                    >Shop now <FontAwesomeIcon icon={faArrowCircleRight} /></a
                  >
                </div>
              </div>
            </div>
            {/* /shop */}

            {/* shop */}
            <div className="col-md-4 col-xs-6">
              <div className="shop">
                <div className="shop-img">
                  <img src="/img/shop03.png" alt="" />
                </div>
                <div className="shop-body">
                  <h3>Accessories<br />Collection</h3>
                  <a href="#" className="cta-btn"
                    >Shop now <FontAwesomeIcon icon={faArrowCircleRight} /></a
                  >
                </div>
              </div>
            </div>
            {/* /shop */}

            {/* shop */}
            <div className="col-md-4 col-xs-6">
              <div className="shop">
                <div className="shop-img">
                  <img src="/img/shop02.png" alt="" />
                </div>
                <div className="shop-body">
                  <h3>Cameras<br />Collection</h3>
                  <a href="#" className="cta-btn"
                    >Shop now <FontAwesomeIcon icon={faArrowCircleRight} /></a
                  >
                </div>
              </div>
            </div>
            {/* /shop */}
          </div>
        </div>
      </div>
      {/* /SECTION */}

      {/* SECTION */}
      <div className="section">
        <div className="container">
          <div className="row">
            {/* section title */}
            <div className="col-md-12">
              <div className="section-title">
                <h3 className="title">New Products</h3>
                <div className="section-nav">
                  <ul className="section-tab-nav tab-nav">
                    <li className="active">
                      <a data-toggle="tab" href="#tab1">Laptop</a>
                    </li>
                    <li><a data-toggle="tab" href="#tab1">PC</a></li>
                    <li><a data-toggle="tab" href="#tab1">Accessories</a></li>
                  </ul>
                </div>
              </div>
            </div>
            {/* /section title */}

            {/* Products tab & slick */}
            <div className="col-md-12">
              <div className="row">
                <div className="products-tabs">
                  {/* tab */}
                  <div id="tab1" className="tab-pane active">
                    <div className="products-slick" data-nav="#slick-nav-1">
                      {/* product */}
                      <div className="product">
                        <div className="product-img">
                          <img src="/img/product01.png" alt="" />
                          <div className="product-label">
                            <span className="sale">-30%</span>
                            <span className="new">NEW</span>
                          </div>
                        </div>
                        <div className="product-body">
                          <p className="product-category">Category</p>
                          <h3 className="product-name">
                            <a href="#">product name goes here</a>
                          </h3>
                          <h4 className="product-price">
                            $980.00 <del className="product-old-price">$990.00</del>
                          </h4>
                          <div className="product-rating">
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStar} />
                          </div>
                          <div className="product-btns">
                            <button className="add-to-wishlist">
                              <FontAwesomeIcon icon={faHeartRegular} /><span className="tooltipp">add to wishlist</span>
                            </button>
                            <button className="add-to-compare">
                              <FontAwesomeIcon icon={faExchange} /><span className="tooltipp">add to compare</span>
                            </button>
                            <button className="quick-view">
                              <FontAwesomeIcon icon={faEye} /><span className="tooltipp">quick view</span>
                            </button>
                          </div>
                        </div>
                        <div className="add-to-cart">
                          <button className="add-to-cart-btn">
                            <FontAwesomeIcon icon={faShoppingCart} /> add to cart
                          </button>
                        </div>
                      </div>
                      {/* /product */}

                      {/* product */}
                      <div className="product">
                        <div className="product-img">
                          <img src="/img/product02.png" alt="" />
                          <div className="product-label">
                            <span className="new">NEW</span>
                          </div>
                        </div>
                        <div className="product-body">
                          <p className="product-category">Category</p>
                          <h3 className="product-name">
                            <a href="#">product name goes here</a>
                          </h3>
                          <h4 className="product-price">
                            $980.00 <del className="product-old-price">$990.00</del>
                          </h4>
                          <div className="product-rating">
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStarRegular} />
                          </div>
                          <div className="product-btns">
                            <button className="add-to-wishlist">
                              <FontAwesomeIcon icon={faHeartRegular} /><span className="tooltipp">add to wishlist</span>
                            </button>
                            <button className="add-to-compare">
                              <FontAwesomeIcon icon={faExchange} /><span className="tooltipp">add to compare</span>
                            </button>
                            <button className="quick-view">
                              <FontAwesomeIcon icon={faEye} /><span className="tooltipp">quick view</span>
                            </button>
                          </div>
                        </div>
                        <div className="add-to-cart">
                          <button className="add-to-cart-btn">
                            <FontAwesomeIcon icon={faShoppingCart} /> add to cart
                          </button>
                        </div>
                      </div>
                      {/* /product */}

                      {/* product */}
                      <div className="product">
                        <div className="product-img">
                          <img src="/img/product03.png" alt="" />
                          <div className="product-label">
                            <span className="sale">-30%</span>
                          </div>
                        </div>
                        <div className="product-body">
                          <p className="product-category">Category</p>
                          <h3 className="product-name">
                            <a href="#">product name goes here</a>
                          </h3>
                          <h4 className="product-price">
                            $980.00 <del className="product-old-price">$990.00</del>
                          </h4>
                          <div className="product-rating"></div>
                          <div className="product-btns">
                            <button className="add-to-wishlist">
                              <FontAwesomeIcon icon={faHeartRegular} /><span className="tooltipp">add to wishlist</span>
                            </button>
                            <button className="add-to-compare">
                              <FontAwesomeIcon icon={faExchange} /><span className="tooltipp">add to compare</span>
                            </button>
                            <button className="quick-view">
                              <FontAwesomeIcon icon={faEye} /><span className="tooltipp">quick view</span>
                            </button>
                          </div>
                        </div>
                        <div className="add-to-cart">
                          <button className="add-to-cart-btn">
                            <FontAwesomeIcon icon={faShoppingCart} /> add to cart
                          </button>
                        </div>
                      </div>
                      {/* /product */}

                      {/* product */}
                      <div className="product">
                        <div className="product-img">
                          <img src="/img/product04.png" alt="" />
                        </div>
                        <div className="product-body">
                          <p className="product-category">Category</p>
                          <h3 className="product-name">
                            <a href="#">product name goes here</a>
                          </h3>
                          <h4 className="product-price">
                            $980.00 <del className="product-old-price">$990.00</del>
                          </h4>
                          <div className="product-rating">
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStar} />
                          </div>
                          <div className="product-btns">
                            <button className="add-to-wishlist">
                              <FontAwesomeIcon icon={faHeartRegular} /><span className="tooltipp">add to wishlist</span>
                            </button>
                            <button className="add-to-compare">
                              <FontAwesomeIcon icon={faExchange} /><span className="tooltipp">add to compare</span>
                            </button>
                            <button className="quick-view">
                              <FontAwesomeIcon icon={faEye} /><span className="tooltipp">quick view</span>
                            </button>
                          </div>
                        </div>
                        <div className="add-to-cart">
                          <button className="add-to-cart-btn">
                            <FontAwesomeIcon icon={faShoppingCart} /> add to cart
                          </button>
                        </div>
                      </div>
                      {/* /product */}

                      {/* product */}
                      <div className="product">
                        <div className="product-img">
                          <img src="/img/product05.png" alt="" />
                        </div>
                        <div className="product-body">
                          <p className="product-category">Category</p>
                          <h3 className="product-name">
                            <a href="#">product name goes here</a>
                          </h3>
                          <h4 className="product-price">
                            $980.00 <del className="product-old-price">$990.00</del>
                          </h4>
                          <div className="product-rating">
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStar} />
                          </div>
                          <div className="product-btns">
                            <button className="add-to-wishlist">
                              <FontAwesomeIcon icon={faHeartRegular} /><span className="tooltipp">add to wishlist</span>
                            </button>
                            <button className="add-to-compare">
                              <FontAwesomeIcon icon={faExchange} /><span className="tooltipp">add to compare</span>
                            </button>
                            <button className="quick-view">
                              <FontAwesomeIcon icon={faEye} /><span className="tooltipp">quick view</span>
                            </button>
                          </div>
                        </div>
                        <div className="add-to-cart">
                          <button className="add-to-cart-btn">
                            <FontAwesomeIcon icon={faShoppingCart} /> add to cart
                          </button>
                        </div>
                      </div>
                      {/* /product */}
                    </div>
                    <div id="slick-nav-1" className="products-slick-nav"></div>
                  </div>
                  {/* /tab */}
                </div>
              </div>
            </div>
            {/* Products tab & slick */}
          </div>
        </div>
      </div>
      {/* /SECTION */}

      {/* SECTION */}
      <div className="section">
        <div className="container">
          <div className="row">
            {/* section title */}
            <div className="col-md-12">
              <div className="section-title">
                <h3 className="title">New Products</h3>
                <div className="section-nav">
                  <ul className="section-tab-nav tab-nav">
                    <li className="active">
                      <a data-toggle="tab" href="#tab1">Laptop</a>
                    </li>
                    <li><a data-toggle="tab" href="#tab1">PC</a></li>
                    <li><a data-toggle="tab" href="#tab1">Accessories</a></li>
                  </ul>
                </div>
              </div>
            </div>
            {/* /section title */}

            {/* Products tab & slick */}
            <div className="col-md-12">
              <div className="row">
                <div className="products-tabs">
                  {/* tab */}
                  <div id="tab1" className="tab-pane active">
                    <div className="products-slick" data-nav="#slick-nav-1">
                      {/* product */}
                      <div className="product">
                        <div className="product-img">
                          <img src="/img/product01.png" alt="" />
                          <div className="product-label">
                            <span className="sale">-30%</span>
                            <span className="new">NEW</span>
                          </div>
                        </div>
                        <div className="product-body">
                          <p className="product-category">Category</p>
                          <h3 className="product-name">
                            <a href="#">product name goes here</a>
                          </h3>
                          <h4 className="product-price">
                            $980.00 <del className="product-old-price">$990.00</del>
                          </h4>
                          <div className="product-rating">
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStar} />
                          </div>
                          <div className="product-btns">
                            <button className="add-to-wishlist">
                              <FontAwesomeIcon icon={faHeartRegular} /><span className="tooltipp">add to wishlist</span>
                            </button>
                            <button className="add-to-compare">
                              <FontAwesomeIcon icon={faExchange} /><span className="tooltipp">add to compare</span>
                            </button>
                            <button className="quick-view">
                              <FontAwesomeIcon icon={faEye} /><span className="tooltipp">quick view</span>
                            </button>
                          </div>
                        </div>
                        <div className="add-to-cart">
                          <button className="add-to-cart-btn">
                            <FontAwesomeIcon icon={faShoppingCart} /> add to cart
                          </button>
                        </div>
                      </div>
                      {/* /product */}

                      {/* product */}
                      <div className="product">
                        <div className="product-img">
                          <img src="/img/product02.png" alt="" />
                          <div className="product-label">
                            <span className="new">NEW</span>
                          </div>
                        </div>
                        <div className="product-body">
                          <p className="product-category">Category</p>
                          <h3 className="product-name">
                            <a href="#">product name goes here</a>
                          </h3>
                          <h4 className="product-price">
                            $980.00 <del className="product-old-price">$990.00</del>
                          </h4>
                          <div className="product-rating">
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStarRegular} />
                          </div>
                          <div className="product-btns">
                            <button className="add-to-wishlist">
                              <FontAwesomeIcon icon={faHeartRegular} /><span className="tooltipp">add to wishlist</span>
                            </button>
                            <button className="add-to-compare">
                              <FontAwesomeIcon icon={faExchange} /><span className="tooltipp">add to compare</span>
                            </button>
                            <button className="quick-view">
                              <FontAwesomeIcon icon={faEye} /><span className="tooltipp">quick view</span>
                            </button>
                          </div>
                        </div>
                        <div className="add-to-cart">
                          <button className="add-to-cart-btn">
                            <FontAwesomeIcon icon={faShoppingCart} /> add to cart
                          </button>
                        </div>
                      </div>
                      {/* /product */}

                      {/* product */}
                      <div className="product">
                        <div className="product-img">
                          <img src="/img/product03.png" alt="" />
                          <div className="product-label">
                            <span className="sale">-30%</span>
                          </div>
                        </div>
                        <div className="product-body">
                          <p className="product-category">Category</p>
                          <h3 className="product-name">
                            <a href="#">product name goes here</a>
                          </h3>
                          <h4 className="product-price">
                            $980.00 <del className="product-old-price">$990.00</del>
                          </h4>
                          <div className="product-rating"></div>
                          <div className="product-btns">
                            <button className="add-to-wishlist">
                              <FontAwesomeIcon icon={faHeartRegular} /><span className="tooltipp">add to wishlist</span>
                            </button>
                            <button className="add-to-compare">
                              <FontAwesomeIcon icon={faExchange} /><span className="tooltipp">add to compare</span>
                            </button>
                            <button className="quick-view">
                              <FontAwesomeIcon icon={faEye} /><span className="tooltipp">quick view</span>
                            </button>
                          </div>
                        </div>
                        <div className="add-to-cart">
                          <button className="add-to-cart-btn">
                            <FontAwesomeIcon icon={faShoppingCart} /> add to cart
                          </button>
                        </div>
                      </div>
                      {/* /product */}

                      {/* product */}
                      <div className="product">
                        <div className="product-img">
                          <img src="/img/product04.png" alt="" />
                        </div>
                        <div className="product-body">
                          <p className="product-category">Category</p>
                          <h3 className="product-name">
                            <a href="#">product name goes here</a>
                          </h3>
                          <h4 className="product-price">
                            $980.00 <del className="product-old-price">$990.00</del>
                          </h4>
                          <div className="product-rating">
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStar} />
                          </div>
                          <div className="product-btns">
                            <button className="add-to-wishlist">
                              <FontAwesomeIcon icon={faHeartRegular} /><span className="tooltipp">add to wishlist</span>
                            </button>
                            <button className="add-to-compare">
                              <FontAwesomeIcon icon={faExchange} /><span className="tooltipp">add to compare</span>
                            </button>
                            <button className="quick-view">
                              <FontAwesomeIcon icon={faEye} /><span className="tooltipp">quick view</span>
                            </button>
                          </div>
                        </div>
                        <div className="add-to-cart">
                          <button className="add-to-cart-btn">
                            <FontAwesomeIcon icon={faShoppingCart} /> add to cart
                          </button>
                        </div>
                      </div>
                      {/* /product */}

                      {/* product */}
                      <div className="product">
                        <div className="product-img">
                          <img src="/img/product05.png" alt="" />
                        </div>
                        <div className="product-body">
                          <p className="product-category">Category</p>
                          <h3 className="product-name">
                            <a href="#">product name goes here</a>
                          </h3>
                          <h4 className="product-price">
                            $980.00 <del className="product-old-price">$990.00</del>
                          </h4>
                          <div className="product-rating">
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStar} />
                            <FontAwesomeIcon icon={faStar} />
                          </div>
                          <div className="product-btns">
                            <button className="add-to-wishlist">
                              <FontAwesomeIcon icon={faHeartRegular} /><span className="tooltipp">add to wishlist</span>
                            </button>
                            <button className="add-to-compare">
                              <FontAwesomeIcon icon={faExchange} /><span className="tooltipp">add to compare</span>
                            </button>
                            <button className="quick-view">
                              <FontAwesomeIcon icon={faEye} /><span className="tooltipp">quick view</span>
                            </button>
                          </div>
                        </div>
                        <div className="add-to-cart">
                          <button className="add-to-cart-btn">
                            <FontAwesomeIcon icon={faShoppingCart} /> add to cart
                          </button>
                        </div>
                      </div>
                      {/* /product */}
                    </div>
                    <div id="slick-nav-1" className="products-slick-nav"></div>
                  </div>
                  {/* /tab */}
                </div>
              </div>
            </div>
            {/* Products tab & slick */}
          </div>
        </div>
      </div>
      {/* /SECTION */}

      {/* SECTION */}
      <div className="section">
        <div className="container">
          <div className="row">
            <div className="col-md-4 col-xs-6">
              <div className="section-title">
                <h4 className="title">Top selling</h4>
                <div className="section-nav">
                  <div id="slick-nav-3" className="products-slick-nav"></div>
                </div>
              </div>

              <div className="products-widget-slick" data-nav="#slick-nav-3">
                <div>
                  {/* product widget */}
                  <div className="product-widget">
                    <div className="product-img">
                      <img src="/img/product07.png" alt="" />
                    </div>
                    <div className="product-body">
                      <p className="product-category">Category</p>
                      <h3 className="product-name">
                        <a href="#">product name goes here</a>
                      </h3>
                      <h4 className="product-price">
                        $980.00 <del className="product-old-price">$990.00</del>
                      </h4>
                    </div>
                  </div>
                  {/* product widget */}
                </div>

                <div>
                  {/* product widget */}
                  <div className="product-widget">
                    <div className="product-img">
                      <img src="/img/product08.png" alt="" />
                    </div>
                    <div className="product-body">
                      <p className="product-category">Category</p>
                      <h3 className="product-name">
                        <a href="#">product name goes here</a>
                      </h3>
                      <h4 className="product-price">
                        $980.00 <del className="product-old-price">$990.00</del>
                      </h4>
                    </div>
                  </div>
                  {/* /product widget */}
                </div>
              </div>
            </div>

            <div className="col-md-4 col-xs-6">
              <div className="section-title">
                <h4 className="title">Top selling</h4>
                <div className="section-nav">
                  <div id="slick-nav-4" className="products-slick-nav"></div>
                </div>
              </div>

              <div className="products-widget-slick" data-nav="#slick-nav-4">
                <div>
                  {/* product widget */}
                  <div className="product-widget">
                    <div className="product-img">
                      <img src="/img/product09.png" alt="" />
                    </div>
                    <div className="product-body">
                      <p className="product-category">Category</p>
                      <h3 className="product-name">
                        <a href="#">product name goes here</a>
                      </h3>
                      <h4 className="product-price">
                        $980.00 <del className="product-old-price">$990.00</del>
                      </h4>
                    </div>
                  </div>
                  {/* /product widget */}
                </div>

                <div>
                  {/* product widget */}
                  <div className="product-widget">
                    <div className="product-img">
                      <img src="/img/product01.png" alt="" />
                    </div>
                    <div className="product-body">
                      <p className="product-category">Category</p>
                      <h3 className="product-name">
                        <a href="#">product name goes here</a>
                      </h3>
                      <h4 className="product-price">
                        $980.00 <del className="product-old-price">$990.00</del>
                      </h4>
                    </div>
                  </div>
                  {/* /product widget */}
                </div>
              </div>
            </div>

            <div className="col-md-4 col-xs-6">
              <div className="section-title">
                <h4 className="title">Top selling</h4>
                <div className="section-nav">
                  <div id="slick-nav-5" className="products-slick-nav"></div>
                </div>
              </div>

              <div className="products-widget-slick" data-nav="#slick-nav-5">
                <div>
                  {/* product widget */}
                  <div className="product-widget">
                    <div className="product-img">
                      <img src="/img/product02.png" alt="" />
                    </div>
                    <div className="product-body">
                      <p className="product-category">Category</p>
                      <h3 className="product-name">
                        <a href="#">product name goes here</a>
                      </h3>
                      <h4 className="product-price">
                        $980.00 <del className="product-old-price">$990.00</del>
                      </h4>
                    </div>
                  </div>
                  {/* /product widget */}
                </div>

                <div>
                  {/* product widget */}
                  <div className="product-widget">
                    <div className="product-img">
                      <img src="/img/product03.png" alt="" />
                    </div>
                    <div className="product-body">
                      <p className="product-category">Category</p>
                      <h3 className="product-name">
                        <a href="#">product name goes here</a>
                      </h3>
                      <h4 className="product-price">
                        $980.00 <del className="product-old-price">$990.00</del>
                      </h4>
                    </div>
                  </div>
                  {/* /product widget */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /SECTION */}

      {/* NEWSLETTER */}
      <div id="newsletter" className="section">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="newsletter">
                <p>Sign Up for the <strong>NEWSLETTER</strong></p>
                <form>
                  <input
                    className="input"
                    type="email"
                    placeholder="Enter Your Email"
                  />
                  <button className="newsletter-btn">
                    <FontAwesomeIcon icon={faEnvelope} /> Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /NEWSLETTER */}

      {/* FOOTER */}
      <footer id="footer">
        <div className="section">
          <div className="container">
            <div className="row">
              <div className="col-md-3 col-xs-6">
                <div className="footer">
                  <h3 className="footer-title">About Us</h3>
                  <p>Quality components – Build a standard PC to assemble according to your needs.
                    High quality, top performance, dedicated support.</p>
                  <ul className="footer-links">
                    <li><a href="#"><FontAwesomeIcon icon={faMapMarker} color="#D10024" />Khu Công Nghệ Cao Hòa Lạc, km 29, Đại lộ, Thăng Long, Hà Nội</a></li>
                    <li><a href="#"><FontAwesomeIcon icon={faPhone} color="#D10024" />0373307285</a></li>
                    <li><a href="#"><FontAwesomeIcon icon={faEnvelopeRegular} color="#D10024" />manhndthe181128</a></li>
                  </ul>
                </div>
              </div>

              <div className="col-md-3 col-xs-6">
                <div className="footer">
                  <h3 className="footer-title">Categories</h3>
                  <ul className="footer-links">
                    <li><a href="#">Hot deals</a></li>
                    <li><a href="#">Laptop</a></li>
                    <li><a href="#">PC</a></li>
                    <li><a href="#">Accessories</a></li>
                    <li><a href="#">Build PC</a></li>
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
                    <li><a href="#">Terms & Conditions</a></li>
                  </ul>
                </div>
              </div>

              <div className="col-md-3 col-xs-6">
                <div className="footer">
                  <h3 className="footer-title">Service</h3>
                  <ul className="footer-links">
                    <li><a href="#">My Account</a></li>
                    <li><a href="#">View Cart</a></li>
                    <li><a href="#">Wishlist</a></li>
                    <li><a href="#">Track My Order</a></li>
                    <li><a href="#">Help</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
      {/* /FOOTER */}
    </>
  );
};

export default HomePage;
