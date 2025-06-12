import React from 'react';
import Navigation from '../components/Navigation';
import ProductCard from '../components/ProductCard';

interface Category {
  name: string;
  icon: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice: number;
  image: string;
  rating: number;
}

// Future interfaces for upcoming features
// interface Blog {
//   id: number;
//   title: string;
//   image: string;
//   desc: string;
//   link: string;
// }

// interface Testimonial {
//   id: number;
//   name: string;
//   role: string;
//   content: string;
//   avatar: string;
// }

const categories: Category[] = [
  { name: 'Phones', icon: '📱' },
  { name: 'Computers', icon: '💻' },
  { name: 'Accessories', icon: '🎧' },
  { name: 'Laptop', icon: '🖥️' },
  { name: 'Networking', icon: '🌐' },
  { name: 'Video Games', icon: '🎮' },
];

const products: Product[] = [
  { id: 1, name: 'Logitech Streamcam Headphone', price: 35, oldPrice: 66, image: 'https://via.placeholder.com/200', rating: 4 },
  { id: 2, name: 'Logitech Streamcam Headphone', price: 35, oldPrice: 66, image: 'https://via.placeholder.com/200', rating: 4 },
  { id: 3, name: 'Logitech Streamcam Headphone', price: 35, oldPrice: 66, image: 'https://via.placeholder.com/200', rating: 4 },
  { id: 4, name: 'Logitech Streamcam Headphone', price: 35, oldPrice: 66, image: 'https://via.placeholder.com/200', rating: 4 },
  { id: 5, name: 'Logitech Streamcam Headphone', price: 35, oldPrice: 66, image: 'https://via.placeholder.com/200', rating: 4 },
  { id: 6, name: 'Logitech Streamcam Headphone', price: 35, oldPrice: 66, image: 'https://via.placeholder.com/200', rating: 4 },
];

// Future implementation: blogs and testimonials sections
// const blogs: Blog[] = [
//   { id: 1, title: 'Well illum qui dolorem eum fugiat?', image: 'https://via.placeholder.com/200', desc: 'Quis autem vel eum iure reprehenderit...', link: '#' },
//   { id: 2, title: 'Well illum qui dolorem eum fugiat?', image: 'https://via.placeholder.com/200', desc: 'Quis autem vel eum iure reprehenderit...', link: '#' },
//   { id: 3, title: 'Well illum qui dolorem eum fugiat?', image: 'https://via.placeholder.com/200', desc: 'Quis autem vel eum iure reprehenderit...', link: '#' },
// ];

// const testimonials: Testimonial[] = [
//   { id: 1, name: 'Jack Johan', role: 'Designer', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', avatar: '' },
//   { id: 2, name: 'Jack Johan', role: 'Designer', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', avatar: '' },
// ];

const HomePage: React.FC = () => {
  return (
    <div className="home-page" style={{width: '100%'}}>
      <div style={{background: '#1976d2', color: 'white', textAlign: 'center', padding: '0.5rem 0', fontSize: '0.95rem', width: '100%'}}>Open Doors To A World Of Tech! <a href="#" style={{color: '#fff', textDecoration: 'underline'}}>Discover More</a></div>
      <Navigation />
      <main className="main-content" style={{width: '100%', padding: '2rem 0'}}>
        {/* Banner Section */}
        <section className="hero-section" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(90deg, #e3e8ee 60%, #fff 100%)', padding: '2.5rem 2rem', borderRadius: '0px', marginBottom: '2.5rem', minHeight: 340, width: '100%'}}>
          <div style={{maxWidth: '44%'}}>
            <div style={{color: '#1976d2', fontWeight: 600, marginBottom: 10, fontSize: 18}}>Up To 20% Off</div>
            <h1 style={{fontSize: '2.7rem', fontWeight: 700, marginBottom: 12, lineHeight: 1.15, color: '#1a237e'}}>Smart And <br/> <span style={{color: '#1976d2'}}>Digital Speakers</span></h1>
            <p style={{marginBottom: 22, fontSize: 17, color: '#555'}}>Seek Adventure With Bluetooth Speakers</p>
            <button style={{background: '#1976d2', color: '#fff', border: 'none', padding: '0.85rem 2.2rem', borderRadius: 8, fontWeight: 600, fontSize: 17, boxShadow: '0 2px 8px #b3c6e6'}}>Shop Now</button>
          </div>
          <div style={{flex: 1, display: 'flex', justifyContent: 'flex-end'}}>
            <img src="https://i.imgur.com/8Km9tLL.png" alt="banner" style={{width: 370, borderRadius: 20, objectFit: 'cover', boxShadow: '0 4px 24px #b3c6e6'}} />
          </div>
        </section>

        {/* Category Section */}
        <section style={{margin: '2.5rem 0', width: '100%'}}>
          <h2 style={{fontSize: '1.25rem', fontWeight: 700, marginBottom: 18, color: '#1a237e'}}>Browse By Category</h2>
          <div style={{display: 'flex', gap: 28, flexWrap: 'wrap', background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px #e3e8ee', padding: '1.2rem 1.5rem', justifyContent: 'center', width: '100%'}}>
            {categories.map((cat, idx) => (
              <div key={idx} style={{flex: '1 0 120px', background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #e3e8ee', padding: 18, textAlign: 'center', minWidth: 110, margin: '0 8px', border: '1.5px solid #e3e8ee'}}>
                <div style={{fontSize: 38, marginBottom: 10, color: '#1976d2'}}>{cat.icon}</div>
                <div style={{fontWeight: 600, fontSize: 15, color: '#1a237e'}}>{cat.name}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Latest Products Section */}
        <section style={{margin: '2.5rem 0', width: '100%'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18}}>
            <h2 style={{fontSize: '1.25rem', fontWeight: 700, color: '#1a237e', margin: 0}}>Latest Products</h2>
            <div style={{display: 'flex', gap: 18, fontSize: 15, color: '#888'}}>
              <span style={{color: '#1976d2', fontWeight: 600, cursor: 'pointer'}}>All</span>
              <span style={{cursor: 'pointer'}}>Audio/Video</span>
              <span style={{cursor: 'pointer'}}>Gaming</span>
              <span style={{cursor: 'pointer'}}>Headphone</span>
            </div>
          </div>
          <div className="products-grid" style={{gap: '2.2rem', width: '100%'}}>
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage; 