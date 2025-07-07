import React, { useState, useEffect } from 'react';
import type { Product, Category } from '../../types/product';

interface ProductAddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: Partial<Product>) => void;
  categories: Category[];
}

const ProductAddAdminModal: React.FC<ProductAddAdminModalProps> = ({ isOpen, onClose, onSubmit, categories }) => {
  const [step, setStep] = useState(1);
  const [categoryId, setCategoryId] = useState<string>('');
  const [form, setForm] = useState<Partial<Product>>({});

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setCategoryId('');
      setForm({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCategorySelect = (catId: string) => {
    setCategoryId(catId);
    setForm({});
    setStep(2);
  };

  const handleChange = (field: string, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ép kiểu price, stock, capacityGb, speedMhz về number nếu có
    const payload = {
      ...form,
      name: form.name || '',
      price: Number(form.price),
      stock: Number(form.stock),
      categoryId,
      capacityGb: form.capacityGb !== undefined ? Number(form.capacityGb) : undefined,
      speedMhz: form.speedMhz !== undefined ? Number(form.speedMhz) : undefined,
    };
    console.log('Payload gửi lên backend:', payload);
    onSubmit(payload);
  };

  const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: 6, fontWeight: 400, fontSize: 16, marginTop: 4 };
  const labelStyle = { textAlign: 'left' as const, fontWeight: 500, marginBottom: 4, display: 'block' };

  const renderFields = () => {
    if (!categoryId) return null;
    const catObj = categories.find(c => c.id === categoryId);
    const cat = catObj ? catObj.name.trim().toLowerCase() : '';
    const nameInput = <label style={labelStyle}>Product Name:<input style={inputStyle} value={form.name || ''} onChange={e => handleChange('name', e.target.value)} required /></label>;
    const priceInput = <label style={labelStyle}>Price:<input style={inputStyle} type="number" value={form.price || ''} onChange={e => handleChange('price', e.target.value)} required min={0} /></label>;
    const descInput = <label style={labelStyle}>Description:<textarea style={{...inputStyle, minHeight: 80, resize: 'vertical'}} value={form.description || ''} onChange={e => handleChange('description', e.target.value)} /></label>;
    const stockInput = <label style={labelStyle}>Stock:<input style={inputStyle} type="number" value={form.stock || ''} onChange={e => handleChange('stock', e.target.value)} required min={0} /></label>;
    if (cat === 'laptop') {
      return <>
        {nameInput}
        {descInput}
        <label style={labelStyle}>Brand:<input style={inputStyle} value={form.brand || ''} onChange={e => handleChange('brand', e.target.value)} /></label>
        <label style={labelStyle}>Model:<input style={inputStyle} value={form.model || ''} onChange={e => handleChange('model', e.target.value)} /></label>
        <label style={labelStyle}>Screen size:<input style={inputStyle} value={form.screenSize || ''} onChange={e => handleChange('screenSize', e.target.value)} /></label>
        <label style={labelStyle}>Screen type:<input style={inputStyle} value={form.screenType || ''} onChange={e => handleChange('screenType', e.target.value)} /></label>
        <label style={labelStyle}>Resolution:<input style={inputStyle} value={form.resolution || ''} onChange={e => handleChange('resolution', e.target.value)} /></label>
        <label style={labelStyle}>Battery life:<input style={inputStyle} value={form.batteryLifeHours || ''} onChange={e => handleChange('batteryLifeHours', e.target.value)} /></label>
        <label style={labelStyle}>Weight:<input style={inputStyle} value={form.weightKg || ''} onChange={e => handleChange('weightKg', e.target.value)} /></label>
        <label style={labelStyle}>OS:<input style={inputStyle} value={form.os || ''} onChange={e => handleChange('os', e.target.value)} /></label>
        <label style={labelStyle}>RAM count:<input style={inputStyle} value={form.ramCount || ''} onChange={e => handleChange('ramCount', e.target.value)} /></label>
        {priceInput}
        {stockInput}
      </>;
    }
    if (cat === 'ram') {
      return <>
        {nameInput}
        {descInput}
        <label style={labelStyle}>Brand:<input style={inputStyle} value={form.brand || ''} onChange={e => handleChange('brand', e.target.value)} /></label>
        <label style={labelStyle}>Model:<input style={inputStyle} value={form.model || ''} onChange={e => handleChange('model', e.target.value)} /></label>
        <label style={labelStyle}>Capacity:<input style={inputStyle} value={form.capacityGb || ''} onChange={e => handleChange('capacityGb', e.target.value)} /></label>
        <label style={labelStyle}>Speed:<input style={inputStyle} value={form.speedMhz || ''} onChange={e => handleChange('speedMhz', e.target.value)} /></label>
        <label style={labelStyle}>Type:<input style={inputStyle} value={form.type || ''} onChange={e => handleChange('type', e.target.value)} /></label>
        {priceInput}
        {stockInput}
      </>;
    }
    if (cat === 'cpu') {
      return <>
        {nameInput}
        {descInput}
        <label style={labelStyle}>Cores:<input style={inputStyle} value={form.cores || ''} onChange={e => handleChange('cores', e.target.value)} /></label>
        <label style={labelStyle}>Threads:<input style={inputStyle} value={form.threads || ''} onChange={e => handleChange('threads', e.target.value)} /></label>
        <label style={labelStyle}>Base Clock:<input style={inputStyle} value={form.baseClock || ''} onChange={e => handleChange('baseClock', e.target.value)} /></label>
        <label style={labelStyle}>Boost Clock:<input style={inputStyle} value={form.boostClock || ''} onChange={e => handleChange('boostClock', e.target.value)} /></label>
        <label style={labelStyle}>Socket:<input style={inputStyle} value={form.socket || ''} onChange={e => handleChange('socket', e.target.value)} /></label>
        <label style={labelStyle}>Architecture:<input style={inputStyle} value={form.architecture || ''} onChange={e => handleChange('architecture', e.target.value)} /></label>
        <label style={labelStyle}>TDP:<input style={inputStyle} value={form.tdp || ''} onChange={e => handleChange('tdp', e.target.value)} /></label>
        <label style={labelStyle}>Integrated Graphics:<input style={inputStyle} value={form.integratedGraphics || ''} onChange={e => handleChange('integratedGraphics', e.target.value)} /></label>
        {priceInput}
        {stockInput}
      </>;
    }
    if (cat === 'gpu') {
      return <>
        {nameInput}
        {descInput}
        <label style={labelStyle}>Brand:<input style={inputStyle} value={form.brand || ''} onChange={e => handleChange('brand', e.target.value)} /></label>
        <label style={labelStyle}>Model:<input style={inputStyle} value={form.model || ''} onChange={e => handleChange('model', e.target.value)} /></label>
        <label style={labelStyle}>VRAM:<input style={inputStyle} value={form.vram || ''} onChange={e => handleChange('vram', e.target.value)} /></label>
        <label style={labelStyle}>Chipset:<input style={inputStyle} value={form.chipset || ''} onChange={e => handleChange('chipset', e.target.value)} /></label>
        <label style={labelStyle}>Memory Type:<input style={inputStyle} value={form.memoryType || ''} onChange={e => handleChange('memoryType', e.target.value)} /></label>
        <label style={labelStyle}>Length (mm):<input style={inputStyle} value={form.lengthMm || ''} onChange={e => handleChange('lengthMm', e.target.value)} /></label>
        {priceInput}
        {stockInput}
      </>;
    }
    if (cat === 'monitor') {
      return <>
        {nameInput}
        {descInput}
        <label style={labelStyle}>Brand:<input style={inputStyle} value={form.brand || ''} onChange={e => handleChange('brand', e.target.value)} /></label>
        <label style={labelStyle}>Model:<input style={inputStyle} value={form.model || ''} onChange={e => handleChange('model', e.target.value)} /></label>
        <label style={labelStyle}>Size (inch):<input style={inputStyle} value={form.sizeInch || ''} onChange={e => handleChange('sizeInch', e.target.value)} /></label>
        <label style={labelStyle}>Resolution:<input style={inputStyle} value={form.resolution || ''} onChange={e => handleChange('resolution', e.target.value)} /></label>
        <label style={labelStyle}>Panel Type:<input style={inputStyle} value={form.panelType || ''} onChange={e => handleChange('panelType', e.target.value)} /></label>
        <label style={labelStyle}>Refresh Rate:<input style={inputStyle} value={form.refreshRate || ''} onChange={e => handleChange('refreshRate', e.target.value)} /></label>
        {priceInput}
        {stockInput}
      </>;
    }
    if (cat === 'motherboard') {
      return <>
        {nameInput}
        {descInput}
        <label style={labelStyle}>Brand:<input style={inputStyle} value={form.brand || ''} onChange={e => handleChange('brand', e.target.value)} /></label>
        <label style={labelStyle}>Model:<input style={inputStyle} value={form.model || ''} onChange={e => handleChange('model', e.target.value)} /></label>
        <label style={labelStyle}>Chipset:<input style={inputStyle} value={form.chipset || ''} onChange={e => handleChange('chipset', e.target.value)} /></label>
        <label style={labelStyle}>Socket:<input style={inputStyle} value={form.socket || ''} onChange={e => handleChange('socket', e.target.value)} /></label>
        <label style={labelStyle}>Form Factor:<input style={inputStyle} value={form.formFactor || ''} onChange={e => handleChange('formFactor', e.target.value)} /></label>
        <label style={labelStyle}>RAM Slots:<input style={inputStyle} value={form.ramSlots || ''} onChange={e => handleChange('ramSlots', e.target.value)} /></label>
        <label style={labelStyle}>Max RAM:<input style={inputStyle} value={form.maxRam || ''} onChange={e => handleChange('maxRam', e.target.value)} /></label>
        {priceInput}
        {stockInput}
      </>;
    }
    if (cat === 'headset') {
      return <>
        {nameInput}
        {descInput}
        <label style={labelStyle}>Has Microphone:<input type="checkbox" checked={!!form.hasMicrophone} onChange={e => handleChange('hasMicrophone', e.target.checked)} /></label>
        <label style={labelStyle}>Connectivity:<input style={inputStyle} value={form.connectivity || ''} onChange={e => handleChange('connectivity', e.target.value)} /></label>
        <label style={labelStyle}>Surround Sound:<input type="checkbox" checked={!!form.surroundSound} onChange={e => handleChange('surroundSound', e.target.checked)} /></label>
        {priceInput}
        {stockInput}
      </>;
    }
    if (cat === 'keyboard') {
      return <>
        {nameInput}
        {descInput}
        <label style={labelStyle}>Type:<input style={inputStyle} value={form.type || ''} onChange={e => handleChange('type', e.target.value)} /></label>
        <label style={labelStyle}>Switch Type:<input style={inputStyle} value={form.switchType || ''} onChange={e => handleChange('switchType', e.target.value)} /></label>
        <label style={labelStyle}>Connectivity:<input style={inputStyle} value={form.connectivity || ''} onChange={e => handleChange('connectivity', e.target.value)} /></label>
        <label style={labelStyle}>Layout:<input style={inputStyle} value={form.layout || ''} onChange={e => handleChange('layout', e.target.value)} /></label>
        <label style={labelStyle}>Has RGB:<input type="checkbox" checked={!!form.hasRgb} onChange={e => handleChange('hasRgb', e.target.checked)} /></label>
        {priceInput}
        {stockInput}
      </>;
    }
    if (cat === 'network card') {
      return <>
        {nameInput}
        {descInput}
        <label style={labelStyle}>Type:<input style={inputStyle} value={form.type || ''} onChange={e => handleChange('type', e.target.value)} /></label>
        <label style={labelStyle}>Interface:<input style={inputStyle} value={form.interface || ''} onChange={e => handleChange('interface', e.target.value)} /></label>
        <label style={labelStyle}>Speed (Mbps):<input style={inputStyle} type="number" value={form.speedMbps || ''} onChange={e => handleChange('speedMbps', e.target.value)} /></label>
        {priceInput}
        {stockInput}
      </>;
    }
    if (cat === 'case') {
      return <>
        {nameInput}
        {descInput}
        <label style={labelStyle}>Brand:<input style={inputStyle} value={form.brand || ''} onChange={e => handleChange('brand', e.target.value)} /></label>
        <label style={labelStyle}>Model:<input style={inputStyle} value={form.model || ''} onChange={e => handleChange('model', e.target.value)} /></label>
        <label style={labelStyle}>Form Factor Support:<input style={inputStyle} value={form.formFactorSupport || ''} onChange={e => handleChange('formFactorSupport', e.target.value)} /></label>
        <label style={labelStyle}>Has RGB:<input type="checkbox" checked={!!form.hasRgb} onChange={e => handleChange('hasRgb', e.target.checked)} /></label>
        <label style={labelStyle}>Side Panel Type:<input style={inputStyle} value={form.sidePanelType || ''} onChange={e => handleChange('sidePanelType', e.target.value)} /></label>
        {priceInput}
        {stockInput}
      </>;
    }
    if (cat === 'psu') {
      return <>
        {nameInput}
        {descInput}
        <label style={labelStyle}>Brand:<input style={inputStyle} value={form.brand || ''} onChange={e => handleChange('brand', e.target.value)} /></label>
        <label style={labelStyle}>Model:<input style={inputStyle} value={form.model || ''} onChange={e => handleChange('model', e.target.value)} /></label>
        <label style={labelStyle}>Wattage:<input style={inputStyle} type="number" value={form.wattage || ''} onChange={e => handleChange('wattage', e.target.value)} /></label>
        <label style={labelStyle}>Efficiency Rating:<input style={inputStyle} value={form.efficiencyRating || ''} onChange={e => handleChange('efficiencyRating', e.target.value)} /></label>
        <label style={labelStyle}>Modular:<input style={inputStyle} value={form.modular || ''} onChange={e => handleChange('modular', e.target.value)} /></label>
        {priceInput}
        {stockInput}
      </>;
    }
    if (cat === 'pc') {
      return <>
        {nameInput}
        {descInput}
        <label style={labelStyle}>Brand:<input style={inputStyle} value={form.brand || ''} onChange={e => handleChange('brand', e.target.value)} /></label>
        <label style={labelStyle}>Model:<input style={inputStyle} value={form.model || ''} onChange={e => handleChange('model', e.target.value)} /></label>
        <label style={labelStyle}>Processor:<input style={inputStyle} value={form.processor || ''} onChange={e => handleChange('processor', e.target.value)} /></label>
        <label style={labelStyle}>RAM (GB):<input style={inputStyle} type="number" value={form.ramGb || ''} onChange={e => handleChange('ramGb', e.target.value)} /></label>
        <label style={labelStyle}>Storage (GB):<input style={inputStyle} type="number" value={form.storageGb || ''} onChange={e => handleChange('storageGb', e.target.value)} /></label>
        <label style={labelStyle}>Storage type:<input style={inputStyle} value={form.storageType || ''} onChange={e => handleChange('storageType', e.target.value)} /></label>
        <label style={labelStyle}>Graphics:<input style={inputStyle} value={form.graphics || ''} onChange={e => handleChange('graphics', e.target.value)} /></label>
        <label style={labelStyle}>Form factor:<input style={inputStyle} value={form.formFactor || ''} onChange={e => handleChange('formFactor', e.target.value)} /></label>
        <label style={labelStyle}>Power supply (W):<input style={inputStyle} type="number" value={form.powerSupplyWattage || ''} onChange={e => handleChange('powerSupplyWattage', e.target.value)} /></label>
        <label style={labelStyle}>OS:<input style={inputStyle} value={form.operatingSystem || ''} onChange={e => handleChange('operatingSystem', e.target.value)} /></label>
        {priceInput}
        {stockInput}
      </>;
    }
    if (cat === 'cooler') {
      return <>
        {nameInput}
        {descInput}
        <label style={labelStyle}>Brand:<input style={inputStyle} value={form.brand || ''} onChange={e => handleChange('brand', e.target.value)} /></label>
        <label style={labelStyle}>Model:<input style={inputStyle} value={form.model || ''} onChange={e => handleChange('model', e.target.value)} /></label>
        <label style={labelStyle}>Type:<input style={inputStyle} value={form.type || ''} onChange={e => handleChange('type', e.target.value)} /></label>
        <label style={labelStyle}>Supported sockets:<input style={inputStyle} value={form.supportedSockets || ''} onChange={e => handleChange('supportedSockets', e.target.value)} /></label>
        <label style={labelStyle}>Fan size (mm):<input style={inputStyle} type="number" value={form.fanSizeMm || ''} onChange={e => handleChange('fanSizeMm', e.target.value)} /></label>
        {priceInput}
        {stockInput}
      </>;
    }
    if (cat === 'drive') {
      return <>
        {nameInput}
        {descInput}
        <label style={labelStyle}>Brand:<input style={inputStyle} value={form.brand || ''} onChange={e => handleChange('brand', e.target.value)} /></label>
        <label style={labelStyle}>Model:<input style={inputStyle} value={form.model || ''} onChange={e => handleChange('model', e.target.value)} /></label>
        <label style={labelStyle}>Type:<input style={inputStyle} value={form.type || ''} onChange={e => handleChange('type', e.target.value)} /></label>
        <label style={labelStyle}>Capacity (GB):<input style={inputStyle} type="number" value={form.capacityGb || ''} onChange={e => handleChange('capacityGb', e.target.value)} /></label>
        <label style={labelStyle}>Interface:<input style={inputStyle} value={form.interface || ''} onChange={e => handleChange('interface', e.target.value)} /></label>
        {priceInput}
        {stockInput}
      </>;
    }
    if (cat === 'mouse') {
      return <>
        {nameInput}
        {descInput}
        <label style={labelStyle}>Type:<input style={inputStyle} value={form.type || ''} onChange={e => handleChange('type', e.target.value)} /></label>
        <label style={labelStyle}>DPI:<input style={inputStyle} type="number" value={form.dpi || ''} onChange={e => handleChange('dpi', e.target.value)} /></label>
        <label style={labelStyle}>Connectivity:<input style={inputStyle} value={form.connectivity || ''} onChange={e => handleChange('connectivity', e.target.value)} /></label>
        <label style={labelStyle}>Has RGB:<input type="checkbox" checked={!!form.hasRgb} onChange={e => handleChange('hasRgb', e.target.checked)} /></label>
        {priceInput}
        {stockInput}
      </>;
    }
    // Mặc định
    return <>
      {nameInput}
      {descInput}
      {priceInput}
      {stockInput}
    </>;
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <form style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 400, maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }}>
          <button type="button" style={{ fontSize: 28, background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0, lineHeight: 1 }} onClick={onClose}>×</button>
        </div>
        <h2 style={{ textAlign: 'left', fontWeight: 700, fontSize: 28, marginBottom: 24, marginTop: 0 }}>Add Product</h2>
        {step === 1 && (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Select product category:</label>
              <select style={inputStyle} value={categoryId} onChange={e => handleCategorySelect(e.target.value)}>
                <option value="">-- Select --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            {renderFields()}
            <div style={{ marginTop: 32, textAlign: 'right' }}>
              <button type="submit" style={{ background: '#ffb300', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 32px', fontWeight: 700, fontSize: 18, cursor: 'pointer', letterSpacing: 1 }}>ADD</button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default ProductAddAdminModal; 