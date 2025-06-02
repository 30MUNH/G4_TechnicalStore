import React from 'react';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card" style={{background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #eee', padding: 20, textAlign: 'center', position: 'relative'}}>
      <div className="product-image" style={{marginBottom: 16}}>
        <img src={product.image} alt={product.name} style={{width: 120, height: 120, objectFit: 'contain', margin: '0 auto', display: 'block'}} />
      </div>
      <div className="product-info">
        <h3 style={{fontSize: '1rem', fontWeight: 600, marginBottom: 8}}>{product.name}</h3>
        <div style={{marginBottom: 8}}>
          {[1,2,3,4,5].map(i => (
            <span key={i} style={{color: i <= (product.rating || 4) ? '#ffc107' : '#ddd', fontSize: 16}}>&#9733;</span>
          ))}
        </div>
        <div style={{marginBottom: 8}}>
          <span style={{color: '#7ac142', fontWeight: 700, fontSize: 18}}>${product.price.toFixed(2)}</span>
          {product.oldPrice && <span style={{color: '#aaa', textDecoration: 'line-through', marginLeft: 8, fontSize: 14}}>${product.oldPrice.toFixed(2)}</span>}
        </div>
        <button className="add-to-cart-btn" style={{background: '#7ac142', color: '#fff', border: 'none', padding: '0.5rem 1.5rem', borderRadius: 6, fontWeight: 600, cursor: 'pointer'}}>Add to Cart</button>
      </div>
    </div>
  );
};

export default ProductCard; 