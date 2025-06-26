import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowCircleRight, faStar, faExchange, faEye, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular, faHeart as faHeartRegular2 } from '@fortawesome/free-regular-svg-icons';
import './HomePage.css';
import Header from '../components/header';
import Footer from '../components/footer';
import { productService } from '../services/productService';
import type { Product, Category } from '../services/productService';

const HomePage: React.FC = () => {
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [topSellingProducts, setTopSellingProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [newProductsData, topSellingData, categoriesData] = await Promise.all([
          productService.getNewProducts(8),
          productService.getTopSellingProducts(6),
          productService.getCategories()
        ]);
        
        // Ensure we have arrays
        setNewProducts(Array.isArray(newProductsData) ? newProductsData : []);
        setTopSellingProducts(Array.isArray(topSellingData) ? topSellingData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Set empty arrays on error
        setNewProducts([]);
        setTopSellingProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatPrice = (price: number): string =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const getProductImage = (product: Product): string => {
    const categoryName = product.category?.name?.toLowerCase() || '';
    if (categoryName.includes('laptop')) return '/img/product01.png';
    if (categoryName.includes('pc')) return '/img/product02.png';
    if (categoryName.includes('monitor')) return '/img/product03.png';
    if (categoryName.includes('keyboard')) return '/img/product04.png';
    if (categoryName.includes('mouse')) return '/img/product05.png';
    if (categoryName.includes('headset')) return '/img/product06.png';
    if (categoryName.includes('cpu')) return '/img/product07.png';
    if (categoryName.includes('gpu')) return '/img/product08.png';
    if (categoryName.includes('ram')) return '/img/product09.png';
    return '/img/product01.png';
  };

  const renderStars = (rating: number = 5) => (
    <>
      {[...Array(5)].map((_, i) => (
        <FontAwesomeIcon
          key={i}
          icon={i < rating ? faStar : faStarRegular}
          style={{ color: i < rating ? '#D10024' : '#E4E7ED' }}
        />
      ))}
    </>
  );

  const renderProduct = (product: Product) => (
    <div key={product.id} className="product">
      <div className="product-img">
        <img src={getProductImage(product)} alt={product.name} />
        <div className="product-label">
          <span className="new">NEW</span>
        </div>
      </div>
      <div className="product-body">
        <p className="product-category">{product.category?.name || 'Category'}</p>
        <h3 className="product-name">
          <Link to={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        <h4 className="product-price">{formatPrice(product.price)}</h4>
        <div className="product-rating">{renderStars()}</div>
        <div className="product-btns">
          <button className="add-to-wishlist">
            <FontAwesomeIcon icon={faHeartRegular2} />
            <span className="tooltipp">add to wishlist</span>
          </button>
          <button className="add-to-compare">
            <FontAwesomeIcon icon={faExchange} />
            <span className="tooltipp">add to compare</span>
          </button>
          <button className="quick-view">
            <FontAwesomeIcon icon={faEye} />
            <span className="tooltipp">quick view</span>
          </button>
        </div>
      </div>
      <div className="add-to-cart">
        <button className="add-to-cart-btn">
          <FontAwesomeIcon icon={faShoppingCart} /> add to cart
        </button>
      </div>
    </div>
  );

  const renderProductWidget = (product: Product) => (
    <div key={product.id} className="product-widget">
      <div className="product-img">
        <img src={getProductImage(product)} alt={product.name} />
      </div>
      <div className="product-body">
        <p className="product-category">{product.category?.name || 'Category'}</p>
        <h3 className="product-name">
          <Link to={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        <h4 className="product-price">{formatPrice(product.price)}</h4>
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
        <Header />
        <div className="section">
          <div className="container">
            <div className="row">
              <div className="col-md-12 text-center">
                <h3>Loading...</h3>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

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
              {categories && categories.length > 0 && categories.slice(0, 4).map(category => (
                <li key={category.id}>
                  <Link to={`/category/${category.slug}`}>{category.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
      {/* /NAVIGATION */}

      {/* SECTION: SHOP BOXES */}
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
                  <Link to="/category/laptop" className="cta-btn">
                    Shop now <FontAwesomeIcon icon={faArrowCircleRight} />
                  </Link>
                </div>
              </div>
            </div>
            {/* /shop */}
            <div className="col-md-4 col-xs-6">
              <div className="shop">
                <div className="shop-img">
                  <img src="/img/shop03.png" alt="" />
                </div>
                <div className="shop-body">
                  <h3>Accessories<br />Collection</h3>
                  <Link to="/category/keyboard" className="cta-btn">
                    Shop now <FontAwesomeIcon icon={faArrowCircleRight} />
                  </Link>
                </div>
              </div>
            </div>
            {/* /shop */}
            <div className="col-md-4 col-xs-6">
              <div className="shop">
                <div className="shop-img">
                  <img src="/img/shop02.png" alt="" />
                </div>
                <div className="shop-body">
                  <h3>PC<br />Collection</h3>
                  <Link to="/category/pc" className="cta-btn">
                    Shop now <FontAwesomeIcon icon={faArrowCircleRight} />
                  </Link>
                </div>
              </div>
            </div>
            {/* /shop */}
          </div>
        </div>
      </div>
      {/* /SECTION */}

      {/* SECTION: NEW PRODUCTS */}
      <div className="section">
        <div className="container">
          <div className="row">
            {/* section title */}
            <div className="col-md-12">
              <div className="section-title">
                <h3 className="title">New Products</h3>
                <div className="section-nav">
                  <ul className="section-tab-nav tab-nav">
                    {categories && categories.length > 0 && categories.slice(0, 3).map((category, index) => (
                      <li key={category.id} className={index === 0 ? 'active' : ''}>
                        <a data-toggle="tab" href="#tab1">{category.name}</a>
                      </li>
                    ))}
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
                      {newProducts && newProducts.length > 0 && newProducts.map(renderProduct)}
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

      {/* SECTION: TOP SELLING */}
      <div className="section">
        <div className="container">
          <div className="row">
            {[0, 1, 2].map(index => (
              <div key={index} className="col-md-4 col-xs-6">
                <div className="section-title">
                  <h4 className="title">Top selling</h4>
                  <div className="section-nav">
                    <div id={`slick-nav-${index + 3}`} className="products-slick-nav"></div>
                  </div>
                </div>
                <div className="products-widget-slick" data-nav={`#slick-nav-${index + 3}`}>
                  {topSellingProducts && topSellingProducts.length > 0 && topSellingProducts.slice(index * 2, (index + 1) * 2).map(product => (
                    <div key={product.id}>
                      {renderProductWidget(product)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* /SECTION */}
      <Footer />
    </>
  );
};

export default HomePage; 