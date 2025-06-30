import React, { useEffect } from 'react';
import type { Product } from '../../types/product';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any; // Để nhận các trường động cho từng loại
}

const CATEGORY_MAP = {
  cpu: '2cb16a49-e560-479f-9548-842b0bff9e27',
  gpu: 'c695708d-0fea-4dd9-8a31-1899fff608b7',
  ram: '434d93f0-4a3b-48f1-806c-3d692bf785ab',
  drive: '1a18778b-8908-4e22-86a8-878e19db8ce4',
  motherboard: 'c0ef0604-0349-441b-974f-1a672ed2be28',
  psu: '4f7b323c-4262-4197-bc50-001b3a95f49a',
  cooler: '336caedb-05ce-47c3-bf3c-17e6c905ea45',
  case: '7bb510df-3279-4fe4-a5d0-1bd73da26434',
  headset: 'bc077745-98fc-474a-a6b4-48d3cbf1b389',
  keyboard: 'c27be34a-dd0e-4364-af3d-0bb4ad23e65d',
  mouse: 'd9877734-7c1a-4ff9-a152-d565747ae51c',
  monitor: '1b24da29-8c53-452f-8f85-eab67745fce1',
  'network-card': 'fb41576b-7546-46d5-86ca-e4a5b84cffb3',
  laptop: '8d5e884c-150d-4302-9118-ae434778ca27',
  pc: '34d6f233-6782-48af-99fe-d485ccdfc618',
};

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

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleString('vi-VN');
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

  const catId = product.categoryId;

  const renderDetail = () => {
    // Helper lấy field: lấy trực tiếp từ product
    const get = (field: string) => {
      if (product && product[field] !== undefined && product[field] !== null) return product[field];
      return '-';
    };
    
    if (catId === CATEGORY_MAP.laptop) {
      return <>
        <div><b>Brand:</b> {get('brand')}</div>
        <div><b>Model:</b> {get('model')}</div>
        <div><b>Screen size:</b> {get('screenSize') !== '-' ? `${get('screenSize')}"` : '-'}</div>
        <div><b>Resolution:</b> {get('resolution')}</div>
        <div><b>Processor:</b> {get('cpu')}</div>
        <div><b>RAM:</b> {get('ramGb') !== '-' ? `${get('ramGb')} GB` : '-'}</div>
        <div><b>Storage:</b> {get('storageGb') !== '-' ? `${get('storageGb')} GB` : '-'}</div>
        <div><b>Storage type:</b> {get('storageType')}</div>
        <div><b>Graphics:</b> {get('graphics')}</div>
        <div><b>Battery life:</b> {get('batteryLifeHours') !== '-' ? `${get('batteryLifeHours')} h` : '-'}</div>
        <div><b>Weight:</b> {get('weightKg') !== '-' ? `${get('weightKg')} kg` : '-'}</div>
        <div><b>OS:</b> {get('os')}</div>
      </>;
    }
    if (catId === CATEGORY_MAP.pc) {
      return <>
        <div><b>Brand:</b> {get('brand')}</div>
        <div><b>Model:</b> {get('model')}</div>
        <div><b>Processor:</b> {get('processor')}</div>
        <div><b>RAM:</b> {get('ramGb') !== '-' ? `${get('ramGb')} GB` : '-'}</div>
        <div><b>Storage:</b> {get('storageGb') !== '-' ? `${get('storageGb')} GB` : '-'}</div>
        <div><b>Storage type:</b> {get('storageType')}</div>
        <div><b>Graphics:</b> {get('graphics')}</div>
        <div><b>Form factor:</b> {get('formFactor')}</div>
        <div><b>Power supply:</b> {get('powerSupplyWattage') !== '-' ? `${get('powerSupplyWattage')} W` : '-'}</div>
        <div><b>OS:</b> {get('operatingSystem')}</div>
      </>;
    }
    if (catId === CATEGORY_MAP.drive) {
      return <>
        <div><b>Brand:</b> {get('brand')}</div>
        <div><b>Model:</b> {get('model')}</div>
        <div><b>Type:</b> {get('type')}</div>
        <div><b>Capacity:</b> {get('capacityGb') !== '-' ? `${get('capacityGb')} GB` : '-'}</div>
        <div><b>Interface:</b> {get('interface')}</div>
      </>;
    }
    if (catId === CATEGORY_MAP.monitor) {
      return <>
        <div><b>Brand:</b> {get('brand')}</div>
        <div><b>Model:</b> {get('model')}</div>
        <div><b>Size:</b> {get('sizeInch') !== '-' ? `${get('sizeInch')}"` : '-'}</div>
        <div><b>Resolution:</b> {get('resolution')}</div>
        <div><b>Refresh rate:</b> {get('refreshRate') !== '-' ? `${get('refreshRate')} Hz` : '-'}</div>
        <div><b>Panel type:</b> {get('panelType')}</div>
      </>;
    }
    if (catId === CATEGORY_MAP.cpu) {
      return <>
        <div><b>Cores:</b> {get('cores')}</div>
        <div><b>Threads:</b> {get('threads')}</div>
        <div><b>Base Clock:</b> {get('baseClock')}</div>
        <div><b>Boost Clock:</b> {get('boostClock')}</div>
        <div><b>Socket:</b> {get('socket')}</div>
        <div><b>Architecture:</b> {get('architecture')}</div>
        <div><b>TDP:</b> {get('tdp') !== '-' ? `${get('tdp')}W` : '-'}</div>
        <div><b>Integrated Graphics:</b> {get('integratedGraphics')}</div>
      </>;
    }
    if (catId === CATEGORY_MAP.cooler) {
      return <>
        <div><b>Brand:</b> {get('brand')}</div>
        <div><b>Model:</b> {get('model')}</div>
        <div><b>Type:</b> {get('type')}</div>
        <div><b>Supported sockets:</b> {get('supportedSockets')}</div>
        <div><b>Fan size:</b> {get('fanSizeMm') !== '-' ? `${get('fanSizeMm')} mm` : '-'}</div>
      </>;
    }
    if (catId === CATEGORY_MAP.ram) {
      return <>
        <div><b>Brand:</b> {get('brand')}</div>
        <div><b>Model:</b> {get('model')}</div>
        <div><b>Capacity:</b> {get('capacityGb') !== '-' ? `${get('capacityGb')} GB` : '-'}</div>
        <div><b>Speed:</b> {get('speedMhz') !== '-' ? `${get('speedMhz')} MHz` : '-'}</div>
        <div><b>Type:</b> {get('type')}</div>
      </>;
    }
    if (catId === CATEGORY_MAP.psu) {
      return <>
        <div><b>Brand:</b> {get('brand')}</div>
        <div><b>Model:</b> {get('model')}</div>
        <div><b>Wattage:</b> {get('wattage') !== '-' ? `${get('wattage')} W` : '-'}</div>
        <div><b>Efficiency rating:</b> {get('efficiencyRating')}</div>
        <div><b>Modular:</b> {get('modular')}</div>
      </>;
    }
    if (catId === CATEGORY_MAP.case) {
      return <>
        <div><b>Brand:</b> {get('brand')}</div>
        <div><b>Model:</b> {get('model')}</div>
        <div><b>Form factor support:</b> {get('formFactorSupport')}</div>
        <div><b>Has RGB:</b> {get('hasRgb') !== undefined ? (get('hasRgb') ? 'Có' : 'Không') : '-'}</div>
        <div><b>Side panel type:</b> {get('sidePanelType')}</div>
      </>;
    }
    if (catId === CATEGORY_MAP.headset) {
      return <>
        <div><b>Has microphone:</b> {get('hasMicrophone') !== undefined ? (get('hasMicrophone') ? 'Có' : 'Không') : '-'}</div>
        <div><b>Connectivity:</b> {get('connectivity')}</div>
        <div><b>Surround sound:</b> {get('surroundSound') !== undefined ? (get('surroundSound') ? 'Có' : 'Không') : '-'}</div>
      </>;
    }
    if (catId === CATEGORY_MAP.motherboard) {
      return <>
        <div><b>Brand:</b> {get('brand')}</div>
        <div><b>Model:</b> {get('model')}</div>
        <div><b>Chipset:</b> {get('chipset')}</div>
        <div><b>Socket:</b> {get('socket')}</div>
        <div><b>Form factor:</b> {get('formFactor')}</div>
        <div><b>RAM slots:</b> {get('ramSlots')}</div>
        <div><b>Max RAM:</b> {get('maxRam') !== '-' ? `${get('maxRam')} GB` : '-'}</div>
      </>;
    }
    if (catId === CATEGORY_MAP.keyboard) {
      return <>
        <div><b>Type:</b> {get('type')}</div>
        <div><b>Switch type:</b> {get('switchType')}</div>
        <div><b>Connectivity:</b> {get('connectivity')}</div>
        <div><b>Layout:</b> {get('layout')}</div>
        <div><b>Has RGB:</b> {get('hasRgb') !== undefined ? (get('hasRgb') ? 'Có' : 'Không') : '-'}</div>
      </>;
    }
    if (catId === CATEGORY_MAP.gpu) {
      return <>
        <div><b>Brand:</b> {get('brand')}</div>
        <div><b>Model:</b> {get('model')}</div>
        <div><b>VRAM:</b> {get('vram') !== '-' ? `${get('vram')} GB` : '-'}</div>
        <div><b>Chipset:</b> {get('chipset')}</div>
        <div><b>Memory type:</b> {get('memoryType')}</div>
        <div><b>Length:</b> {get('lengthMm') !== '-' ? `${get('lengthMm')} mm` : '-'}</div>
      </>;
    }
    if (catId === CATEGORY_MAP.mouse) {
      return <>
        <div><b>Type:</b> {get('type')}</div>
        <div><b>DPI:</b> {get('dpi') !== '-' ? `${get('dpi')}` : '-'}</div>
        <div><b>Connectivity:</b> {get('connectivity')}</div>
        <div><b>Has RGB:</b> {get('hasRgb') !== undefined ? (get('hasRgb') ? 'Có' : 'Không') : '-'}</div>
      </>;
    }
    if (catId === CATEGORY_MAP['network-card']) {
      return <>
        <div><b>Type:</b> {get('type')}</div>
        <div><b>Interface:</b> {get('interface')}</div>
        <div><b>Speed:</b> {get('speedMbps') !== '-' ? `${get('speedMbps')} Mbps` : '-'}</div>
      </>;
    }
    // Trường hợp mặc định (sản phẩm chung)
    return <>
      <div><b>Mô tả:</b> {get('description')}</div>
      <div><b>Tồn kho:</b> {get('stock')}</div>
      <div><b>Trạng thái:</b> {get('isActive') ? 'Hoạt động' : 'Không hoạt động'}</div>
      <div><b>Ngày tạo:</b> {formatDate(get('createdAt'))}</div>
      <div><b>Ngày cập nhật:</b> {formatDate(get('updatedAt'))}</div>
    </>;
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={{ ...modalStyle, position: 'relative' }} onClick={e => e.stopPropagation()}>
        <button style={closeBtnStyle} onClick={onClose} title="Đóng">×</button>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 32, alignItems: 'flex-start' }}>
          <img src={product.url} alt={product.name} style={{ width: 200, height: 200, objectFit: 'contain', borderRadius: 12, background: '#f5f5f5' }} />
          <div style={{ flex: 1, textAlign: 'left' }}>
            <h3 style={{ margin: 0 }}>{product.name}</h3>
            <div style={{ color: '#ff2d55', fontWeight: 700, fontSize: 20, margin: '8px 0' }}>{product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</div>
            <div style={{ marginBottom: 8 }}><b>Danh mục:</b> {product.category?.name}</div>
            {renderDetail()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal; 