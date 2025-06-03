import React from 'react';

const Navigation = () => {
  return (
    <nav className="navigation" style={{background: '#fff', borderBottom: '1px solid #eee', fontWeight: 600, boxShadow: 'none'}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: 1200, margin: '0 auto', padding: '0.7rem 0', gap: 32}}>
        <ul className="nav-list" style={{display: 'flex', justifyContent: 'center', gap: 36, listStyle: 'none', margin: 0, padding: 0}}>
          <li><a href="#home" style={{color: '#222', textDecoration: 'none', fontWeight: 600, fontSize: 16, padding: '2px 8px', borderRadius: 4, transition: '0.2s'}} onMouseOver={e => e.target.style.color='#1976d2'} onMouseOut={e => e.target.style.color='#222'}>Home</a></li>
          <li><a href="#pc" style={{color: '#222', textDecoration: 'none', fontWeight: 600, fontSize: 16, padding: '2px 8px', borderRadius: 4, transition: '0.2s'}} onMouseOver={e => e.target.style.color='#1976d2'} onMouseOut={e => e.target.style.color='#222'}>PC & Laptop</a></li>
          <li><a href="#accessories" style={{color: '#222', textDecoration: 'none', fontWeight: 600, fontSize: 16, padding: '2px 8px', borderRadius: 4, transition: '0.2s'}} onMouseOver={e => e.target.style.color='#1976d2'} onMouseOut={e => e.target.style.color='#222'}>Accessories</a></li>
          <li><a href="#phones" style={{color: '#222', textDecoration: 'none', fontWeight: 600, fontSize: 16, padding: '2px 8px', borderRadius: 4, transition: '0.2s'}} onMouseOver={e => e.target.style.color='#1976d2'} onMouseOut={e => e.target.style.color='#222'}>Phones & Tablet</a></li>
          <li><a href="#game" style={{color: '#222', textDecoration: 'none', fontWeight: 600, fontSize: 16, padding: '2px 8px', borderRadius: 4, transition: '0.2s'}} onMouseOver={e => e.target.style.color='#1976d2'} onMouseOut={e => e.target.style.color='#222'}>Game Console</a></li>
          <li><a href="#contact" style={{color: '#222', textDecoration: 'none', fontWeight: 600, fontSize: 16, padding: '2px 8px', borderRadius: 4, transition: '0.2s'}} onMouseOver={e => e.target.style.color='#1976d2'} onMouseOut={e => e.target.style.color='#222'}>Contact Us</a></li>
        </ul>
        <div className="search-bar" style={{marginLeft: 32, minWidth: 260}}>
          <input type="text" placeholder="Search products..." style={{width: '100%', padding: '0.45rem 1rem', border: '1px solid #ddd', borderRadius: 4, fontSize: 15}} />
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 