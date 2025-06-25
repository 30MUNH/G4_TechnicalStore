import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowCircleRight, faBars, faStar, faExchange, faEye, faShoppingCart, faHeart as faHeartRegular } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular, faHeart as faHeartRegular2 } from '@fortawesome/free-regular-svg-icons';
import './HomePage.css';
import Header from '../components/header';
import Footer from '../components/footer';

const HomePage = () => {
  return (
    <>
      <Header />
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
                              <FontAwesomeIcon icon={faHeartRegular2} /><span className="tooltipp">add to wishlist</span>
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
                              <FontAwesomeIcon icon={faHeartRegular2} /><span className="tooltipp">add to wishlist</span>
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
                              <FontAwesomeIcon icon={faHeartRegular2} /><span className="tooltipp">add to wishlist</span>
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
                              <FontAwesomeIcon icon={faHeartRegular2} /><span className="tooltipp">add to wishlist</span>
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
                              <FontAwesomeIcon icon={faHeartRegular2} /><span className="tooltipp">add to wishlist</span>
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
      <Footer />
    </>
  );
};

export default HomePage;
