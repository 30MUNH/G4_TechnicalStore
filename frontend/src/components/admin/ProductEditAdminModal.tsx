import React, { useState } from 'react';
import type { Product } from '../../types/product';

interface ProductEditAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onSubmit: (product: Product) => void;
}

const ProductEditAdminModal: React.FC<ProductEditAdminModalProps> = ({ isOpen, onClose, product, onSubmit }) => {
  const [form, setForm] = useState<Product>({ ...product });

  if (!isOpen) return null;

  const categoryName = product.category?.name;

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  // Render các trường tuỳ loại sản phẩm
  const renderFields = () => {
    const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 6, fontWeight: 400, fontSize: 16, marginTop: 4 };
    const labelStyle = { textAlign: 'left', fontWeight: 500, marginBottom: 4, display: 'block' };
    if (categoryName === 'Laptop') {
      return <>
        <label style={labelStyle}>Brand:<input style={inputStyle} value={form.brand || ''} onChange={e => handleChange('brand', e.target.value)} /></label>
        <label style={labelStyle}>Model:<input style={inputStyle} value={form.model || ''} onChange={e => handleChange('model', e.target.value)} /></label>
        <label style={labelStyle}>Screen size:<input style={inputStyle} value={form.screenSize || ''} onChange={e => handleChange('screenSize', e.target.value)} /></label>
        <label style={labelStyle}>Screen type:<input style={inputStyle} value={form.screenType || ''} onChange={e => handleChange('screenType', e.target.value)} /></label>
        <label style={labelStyle}>Resolution:<input style={inputStyle} value={form.resolution || ''} onChange={e => handleChange('resolution', e.target.value)} /></label>
        <label style={labelStyle}>Battery life:<input style={inputStyle} value={form.batteryLifeHours || ''} onChange={e => handleChange('batteryLifeHours', e.target.value)} /></label>
        <label style={labelStyle}>Weight:<input style={inputStyle} value={form.weightKg || ''} onChange={e => handleChange('weightKg', e.target.value)} /></label>
        <label style={labelStyle}>OS:<input style={inputStyle} value={form.os || ''} onChange={e => handleChange('os', e.target.value)} /></label>
        <label style={labelStyle}>RAM count:<input style={inputStyle} value={form.ramCount || ''} onChange={e => handleChange('ramCount', e.target.value)} /></label>
        <label style={labelStyle}>Stock:<input style={inputStyle} value={form.stock || ''} onChange={e => handleChange('stock', e.target.value)} /></label>
      </>;
    }
    if (categoryName === 'RAM') {
      return <>
        <label style={labelStyle}>Brand:<input style={inputStyle} value={form.brand || ''} onChange={e => handleChange('brand', e.target.value)} /></label>
        <label style={labelStyle}>Model:<input style={inputStyle} value={form.model || ''} onChange={e => handleChange('model', e.target.value)} /></label>
        <label style={labelStyle}>Capacity:<input style={inputStyle} value={form.capacityGb || ''} onChange={e => handleChange('capacityGb', e.target.value)} /></label>
        <label style={labelStyle}>Speed:<input style={inputStyle} value={form.speedMhz || ''} onChange={e => handleChange('speedMhz', e.target.value)} /></label>
        <label style={labelStyle}>Type:<input style={inputStyle} value={form.type || ''} onChange={e => handleChange('type', e.target.value)} /></label>
        <label style={labelStyle}>Stock:<input style={inputStyle} value={form.stock || ''} onChange={e => handleChange('stock', e.target.value)} /></label>
      </>;
    }
    // ... Thêm các loại sản phẩm khác tương tự như logic view detail ...
    // Mặc định
    return <>
      <label style={labelStyle}>Name:<input style={inputStyle} value={form.name || ''} onChange={e => handleChange('name', e.target.value)} /></label>
      <label style={labelStyle}>Description:<input style={inputStyle} value={form.description || ''} onChange={e => handleChange('description', e.target.value)} /></label>
      <label style={labelStyle}>Price:<input style={inputStyle} value={form.price || ''} onChange={e => handleChange('price', e.target.value)} /></label>
      <label style={labelStyle}>Stock:<input style={inputStyle} value={form.stock || ''} onChange={e => handleChange('stock', e.target.value)} /></label>
    </>;
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <form style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 400, position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }}>
          <button type="button" style={{ fontSize: 28, background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0, lineHeight: 1 }} onClick={onClose}>×</button>
        </div>
        <h2 style={{ textAlign: 'left', fontWeight: 700, fontSize: 28, marginBottom: 24, marginTop: 0 }}>Edit Product</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {renderFields()}
        </div>
        <div style={{ marginTop: 32, textAlign: 'right' }}>
          <button type="submit" style={{ background: '#ffb300', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 32px', fontWeight: 700, fontSize: 18, cursor: 'pointer', letterSpacing: 1 }}>SAVE</button>
        </div>
      </form>
    </div>
  );
};

export default ProductEditAdminModal; 