import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header" style={{background: '#fff', borderBottom: '1px solid #eee', position: 'relative', zIndex: 10}}>
      {/* Top bar xanh lá - bỏ luôn nếu không cần */}
      {/* <div style={{background: '#7ac142', color: '#fff', fontSize: 13, padding: '0.3rem 0', textAlign: 'center'}}>
        Open Doors To A World Of Fashion! <a href="#" style={{color: '#fff', textDecoration: 'underline'}}>Discover More</a>
      </div> */}
      {/* Main header */}
      <div className="header-container" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 0 1.2rem 0', maxWidth: 1200, margin: '0 auto'}}>
        {/* Logo căn giữa */}
        <div className="logo" style={{display: 'flex', justifyContent: 'flex-start', alignItems: 'center', flex: 1}}>
          <img src="https://i.imgur.com/1X4hQ7k.png" alt="logo" style={{height: 38, marginRight: 8}} />
          <span style={{fontWeight: 700, fontSize: 28, color: '#222', fontFamily: 'serif', letterSpacing: 1}}>Cleopatra</span>
        </div>
        {/* Icon và menu bên phải */}
        <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 18, flex: 1}}>
          <a href="#login" style={{color: '#222', fontSize: 15}}>Login / Signup</a>
          <button className="cart-btn" style={{background: 'none', border: 'none', color: '#222', fontSize: 22, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer'}}>
            <span role="img" aria-label="cart">&#128722;</span> <span style={{fontWeight: 600, fontSize: 15}}>0</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 