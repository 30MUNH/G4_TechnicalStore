import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowCircleRight, faEye, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular2 } from '@fortawesome/free-regular-svg-icons';
import './HomePage.css';
import Footer from '../components/footer';
import { productService } from '../services/productService';
import type { Product } from '../types/product';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ProductDetailModal from '../components/product_manager/productDetailModal';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  console.log('🏠 HomePage Debug - Component initializing');
  
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, user, token } = useAuth();
  const [newProducts, setNewProducts] = useState<{ laptops: Product[]; pcs: Product[]; accessories: Product[] }>({ laptops: [], pcs: [], accessories: [] });
  const [topSellingProducts, setTopSellingProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'laptop' | 'pc' | 'accessories'>('laptop');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [addToCartStatus, setAddToCartStatus] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Debug auth state changes - FIXED: Remove isAuthenticated function from dependencies
  useEffect(() => {
    const authStatus = isAuthenticated();
    console.log('🏠 HomePage Debug - Auth state changed:', {
      isAuthenticated: authStatus,
      hasUser: !!user,
      hasToken: !!token,
      userInfo: user ? { username: user.username, role: user.role } : null,
      tokenLength: token?.length,
      localStorageToken: !!localStorage.getItem('authToken'),
      localStorageUser: !!localStorage.getItem('user')
    });
  }, [user, token]);

  // Debug registration success state
  useEffect(() => {
    const registrationSuccess = sessionStorage.getItem('registrationSuccess');
    if (registrationSuccess) {
      try {
        const regData = JSON.parse(registrationSuccess);
        console.log('🎉 HomePage Debug - Registration success detected:', {
          username: regData.username,
          timestamp: new Date(regData.timestamp).toLocaleString(),
          timeSinceReg: Date.now() - regData.timestamp
        });
      } catch (e) {
        console.warn('⚠️ HomePage Debug - Invalid registration success data');
      }
    }
  }, []);

  useEffect(() => {
    console.log("HomePage useEffect chạy");
    const fetchData = async () => {
      try {
        setLoading(true);
        const [newProductsData, topSellingData] = await Promise.all([
          productService.getNewProducts(8),
          productService.getTopSellingProducts(6)
        ]);
        
        // Ensure we have arrays
        setNewProducts(newProductsData);
        setTopSellingProducts(Array.isArray(topSellingData) ? topSellingData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Set empty arrays on error
        setNewProducts({ laptops: [], pcs: [], accessories: [] });
        setTopSellingProducts([]);
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

  const handleOpenQuickView = async (product: Product) => {
    // Gọi API lấy chi tiết sản phẩm
    const detail = await productService.getProductById(product.id);
    setQuickViewProduct(detail || product);
    setIsQuickViewOpen(true);
  };
  const handleCloseQuickView = () => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
  };

  const handleAddToCart = async (product: Product) => {
    console.log('🛒 HomePage Debug - Add to cart clicked:', {
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      isAuthenticated: isAuthenticated(),
      hasToken: !!localStorage.getItem('authToken'),
      hasUser: !!localStorage.getItem('user')
    });

    if (!isAuthenticated()) {
      console.log('❌ HomePage Debug - User not authenticated, redirecting to login');
      navigate('/login', { 
        state: { 
          returnUrl: window.location.pathname,
          message: 'Please login to add items to cart'
        } 
      });
      return;
    }

    try {
      console.log('📤 HomePage Debug - Calling addToCart with product ID:', product.id);
      await addToCart(product.id, 1);
      console.log('✅ HomePage Debug - Add to cart successful');
      setAddToCartStatus({
        message: 'Product added to cart successfully!',
        type: 'success'
      });
      setTimeout(() => setAddToCartStatus(null), 3000);
    } catch (error) {
      console.error('❌ HomePage Debug - Add to cart failed:', error);
      setAddToCartStatus({
        message: 'Failed to add product to cart',
        type: 'error'
      });
      setTimeout(() => setAddToCartStatus(null), 3000);
    }
  };

  const renderProduct = (product: Product) => (
    <div
      key={product.id}
      className="product"
      style={{ margin: '0 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}
      onMouseEnter={() => setHoveredProductId(product.id)}
      onMouseLeave={() => setHoveredProductId(null)}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div className="product-img">
          <img src={getProductImage(product)} alt={product.name} />
          <div className="product-label">
            <span className="new">NEW</span>
          </div>
        </div>
        <div className="product-body">
          <p className="product-category">{product.category?.name || 'Category'}</p>
          <h3 className="product-name">
            <Link to={`/product/${product.id}`}>{product.name}</Link>
          </h3>
          <h4 className="product-price">{formatPrice(product.price)}</h4>
          <div className="product-btns">
            <button className="add-to-wishlist">
              <FontAwesomeIcon icon={faHeartRegular2} />
              <span className="tooltipp">add to wishlist</span>
            </button>
            <button className="quick-view" onClick={async () => await handleOpenQuickView(product)}>
              <FontAwesomeIcon icon={faEye} />
              <span className="tooltipp">quick view</span>
            </button>
          </div>
        </div>
      </div>
      {/* Nút Add to Cart chỉ hiện khi hover */}
      {hoveredProductId === product.id && (
        <div style={{ background: '#18191f', padding: '24px 0', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px', textAlign: 'center', margin: '0 -1px', marginTop: 'auto', transition: 'opacity 0.2s' }}>
          <button 
            className="add-to-cart-btn" 
            style={{ background: '#D10024', color: '#fff', borderRadius: '24px', padding: '12px 36px', fontWeight: 700, fontSize: '18px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', letterSpacing: 1 }}
            onClick={() => handleAddToCart(product)}
          >
            <FontAwesomeIcon icon={faShoppingCart} /> ADD TO CART
          </button>
        </div>
      )}
    </div>
  );

  // Cấu hình slider cho 4 sản phẩm 1 lần, tự động trượt
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
    style: { padding: '0 32px' },
  };

  const getFilteredProducts = () => {
    if (selectedTab === 'laptop') {
      return newProducts.laptops || [];
    }
    if (selectedTab === 'pc') {
      return newProducts.pcs || [];
    }
    // Accessories
    return newProducts.accessories || [];
  };

  // Thêm hàm mới để render sản phẩm Top Selling giống giao diện mẫu
  const renderTopSellingProduct = (product: Product) => (
    <div key={product.id} className="product-widget" style={{ display: 'flex', alignItems: 'center', marginBottom: 32, border: 'none', boxShadow: 'none' }}>
      <div className="product-img" style={{ minWidth: 80, maxWidth: 80, marginRight: 24 }}>
        <img src={getProductImage(product)} alt={product.name} style={{ width: 80, height: 60, objectFit: 'contain' }} />
      </div>
      <div className="product-body" style={{ flex: 1, textAlign: 'left' }}>
        <p className="product-category">{product.category?.name || 'Category'}</p>
        <h3
          className="product-name product-name-hover"
          style={{ cursor: 'pointer', transition: 'color 0.2s', marginBottom: 2 }}
          onClick={async () => await handleOpenQuickView(product)}
        >
          {product.name}
        </h3>
        <h4 className="product-price">{formatPrice(product.price)}</h4>
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
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
      {addToCartStatus && (
        <div 
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px',
            borderRadius: '5px',
            backgroundColor: addToCartStatus.type === 'success' ? '#4CAF50' : '#f44336',
            color: 'white',
            zIndex: 1000,
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}
        >
          {addToCartStatus.message}
        </div>
      )}
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
                    <li className={selectedTab === 'laptop' ? 'active' : ''}>
                      <a data-toggle="tab" href="#tab1" onClick={e => { e.preventDefault(); setSelectedTab('laptop'); }}>Laptop</a>
                    </li>
                    <li className={selectedTab === 'pc' ? 'active' : ''}>
                      <a data-toggle="tab" href="#tab2" onClick={e => { e.preventDefault(); setSelectedTab('pc'); }}>PC</a>
                    </li>
                    <li className={selectedTab === 'accessories' ? 'active' : ''}>
                      <a data-toggle="tab" href="#tab3" onClick={e => { e.preventDefault(); setSelectedTab('accessories'); }}>Accessories</a>
                    </li>
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
                    <Slider {...sliderSettings}>
                      {getFilteredProducts().map(renderProduct)}
                    </Slider>
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
      <div className="section" style={{ background: '#fff' }}>
        <div className="container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div className="row" style={{ justifyContent: 'center' }}>
            {[0, 1, 2].map(index => (
              <div key={index} className="col-md-4 col-xs-12" style={{ marginBottom: 24 }}>
                <div className="section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 className="title" style={{ fontWeight: 700, fontSize: 28, letterSpacing: 1, color: '#222', marginBottom: 24, marginTop: 0 }}>TOP SELLING</h4>
                  <div className="section-nav">
                    <div id={`slick-nav-${index + 3}`} className="products-slick-nav"></div>
                  </div>
                </div>
                <div>
                  {topSellingProducts && topSellingProducts.length > 0 && topSellingProducts.slice(index * 2, (index + 1) * 2).map(product => (
                    renderTopSellingProduct(product)
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* /SECTION */}
      {/* Quick View Modal */}
      <ProductDetailModal isOpen={isQuickViewOpen} onClose={handleCloseQuickView} product={quickViewProduct} />
      <Footer />
    </>
  );
};

export default HomePage; 