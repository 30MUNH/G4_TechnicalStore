import React, { useEffect } from 'react';
import type { Product } from '../../types/product';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: 20,
};

const modalStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
  maxWidth: 600,
  width: '100%',
  maxHeight: '90vh',
  overflow: 'auto',
  padding: 32,
  animation: 'modalEnter 0.2s ease-out',
};

const closeBtnStyle: React.CSSProperties = {
  position: 'absolute',
  top: 16,
  right: 16,
  background: 'none',
  border: 'none',
  fontSize: 24,
  cursor: 'pointer',
  color: '#888',
};

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ isOpen, onClose, product }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={{ ...modalStyle, position: 'relative' }} onClick={e => e.stopPropagation()}>
        <button style={closeBtnStyle} onClick={onClose} title="Đóng">×</button>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 32, alignItems: 'flex-start' }}>
          <img src={product.url} alt={product.name} style={{ width: 200, height: 200, objectFit: 'contain', borderRadius: 12, background: '#f5f5f5' }} />
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0 }}>{product.name}</h3>
            <div style={{ color: '#ff2d55', fontWeight: 700, fontSize: 20, margin: '8px 0' }}>{product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</div>
            <div style={{ marginBottom: 8 }}><b>Danh mục:</b> {product.category?.name}</div>
            <div style={{ marginBottom: 8 }}><b>Mô tả:</b> {product.description}</div>
            <div style={{ marginBottom: 8 }}><b>Tồn kho:</b> {product.stock}</div>
            <div style={{ marginBottom: 8 }}><b>Trạng thái:</b> {product.isActive ? 'Hoạt động' : 'Không hoạt động'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal; 