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
    if (catId === CATEGORY_MAP.laptop) {
      return <>
        <div><b>Brand:</b> {product.brand || '-'}</div>
        <div><b>Model:</b> {product.model || '-'}</div>
        <div><b>Screen size:</b> {product.screenSize ? `${product.screenSize}"` : '-'}</div>
        <div><b>Resolution:</b> {product.resolution || '-'}</div>
        <div><b>Processor:</b> {product.cpu || '-'}</div>
        <div><b>RAM:</b> {product.ramGb ? `${product.ramGb} GB` : '-'}</div>
        <div><b>Storage:</b> {product.storageGb ? `${product.storageGb} GB` : '-'}</div>
        <div><b>Storage type:</b> {product.storageType || '-'}</div>
        <div><b>Graphics:</b> {product.graphics || '-'}</div>
        <div><b>Battery life:</b> {product.batteryLifeHours ? `${product.batteryLifeHours} h` : '-'}</div>
        <div><b>Weight:</b> {product.weightKg ? `${product.weightKg} kg` : '-'}</div>
        <div><b>OS:</b> {product.operatingSystem || '-'}</div>
      </>;
    }
    if (catId === CATEGORY_MAP.pc) {
      return <>
        <div><b>Brand:</b> {product.brand || '-'}</div>
        <div><b>Model:</b> {product.model || '-'}</div>
        <div><b>Processor:</b> {product.processor || '-'}</div>
        <div><b>RAM:</b> {product.ramGb ? `${product.ramGb} GB` : '-'}</div>
        <div><b>Storage:</b> {product.storageGb ? `${product.storageGb} GB` : '-'}</div>
        <div><b>Storage type:</b> {product.storageType || '-'}</div>
        <div><b>Graphics:</b> {product.graphics || '-'}</div>
        <div><b>Form factor:</b> {product.formFactor || '-'}</div>
        <div><b>Power supply:</b> {product.powerSupplyWattage ? `${product.powerSupplyWattage} W` : '-'}</div>
        <div><b>OS:</b> {product.operatingSystem || '-'}</div>
      </>;
    }
    if (catId === CATEGORY_MAP.drive) {
      return <>
        <div><b>Brand:</b> {product.brand || '-'}</div>
        <div><b>Model:</b> {product.model || '-'}</div>
        <div><b>Type:</b> {product.type || '-'}</div>
        <div><b>Capacity:</b> {product.capacityGb ? `${product.capacityGb} GB` : '-'}</div>
        <div><b>Interface:</b> {product.interface || '-'}</div>
      </>;
    }
    if (catId === CATEGORY_MAP.monitor) {
      return <>
        <div><b>Brand:</b> {product.brand || '-'}</div>
        <div><b>Model:</b> {product.model || '-'}</div>
        <div><b>Size:</b> {product.sizeInch ? `${product.sizeInch}"` : '-'}</div>
        <div><b>Resolution:</b> {product.resolution || '-'}</div>
        <div><b>Refresh rate:</b> {product.refreshRate ? `${product.refreshRate} Hz` : '-'}</div>
        <div><b>Panel type:</b> {product.panelType || '-'}</div>
      </>;
    }
    if (catId === CATEGORY_MAP.cpu) {
      return <>
        <div><b>Cores:</b> {product.cores || '-'}</div>
        <div><b>Threads:</b> {product.threads || '-'}</div>
        <div><b>Base Clock:</b> {product.baseClock || '-'}</div>
        <div><b>Boost Clock:</b> {product.boostClock || '-'}</div>
        <div><b>Socket:</b> {product.socket || '-'}</div>
        <div><b>Architecture:</b> {product.architecture || '-'}</div>
        <div><b>TDP:</b> {product.tdp ? `${product.tdp}W` : '-'}</div>
        <div><b>Integrated Graphics:</b> {product.integratedGraphics || '-'}</div>
      </>;
    }
    if (catId === CATEGORY_MAP.cooler) {
      return <>
        <div><b>Brand:</b> {product.brand || '-'}</div>
        <div><b>Model:</b> {product.model || '-'}</div>
        <div><b>Type:</b> {product.type || '-'}</div>
        <div><b>Supported sockets:</b> {product.supportedSockets || '-'}</div>
        <div><b>Fan size:</b> {product.fanSizeMm ? `${product.fanSizeMm} mm` : '-'}</div>
      </>;
    }
    if (catId === CATEGORY_MAP.ram) {
      return <>
        <div><b>Brand:</b> {product.brand || '-'}</div>
        <div><b>Model:</b> {product.model || '-'}</div>
        <div><b>Capacity:</b> {product.capacityGb ? `${product.capacityGb} GB` : '-'}</div>
        <div><b>Speed:</b> {product.speedMhz ? `${product.speedMhz} MHz` : '-'}</div>
        <div><b>Type:</b> {product.type || '-'}</div>
      </>;
    }
    if (catId === CATEGORY_MAP.psu) {
      return <>
        <div><b>Brand:</b> {product.brand || '-'}</div>
        <div><b>Model:</b> {product.model || '-'}</div>
        <div><b>Wattage:</b> {product.wattage ? `${product.wattage} W` : '-'}</div>
        <div><b>Efficiency rating:</b> {product.efficiencyRating || '-'}</div>
        <div><b>Modular:</b> {product.modular || '-'}</div>
      </>;
    }
    if (catId === CATEGORY_MAP.case) {
      return <>
        <div><b>Brand:</b> {product.brand || '-'}</div>
        <div><b>Model:</b> {product.model || '-'}</div>
        <div><b>Form factor support:</b> {product.formFactorSupport || '-'}</div>
        <div><b>Has RGB:</b> {product.hasRgb !== undefined ? (product.hasRgb ? 'Có' : 'Không') : '-'}</div>
        <div><b>Side panel type:</b> {product.sidePanelType || '-'}</div>
      </>;
    }
    if (catId === CATEGORY_MAP.headset) {
      return <>
        <div><b>Has microphone:</b> {product.hasMicrophone !== undefined ? (product.hasMicrophone ? 'Có' : 'Không') : '-'}</div>
        <div><b>Connectivity:</b> {product.connectivity || '-'}</div>
        <div><b>Surround sound:</b> {product.surroundSound !== undefined ? (product.surroundSound ? 'Có' : 'Không') : '-'}</div>
      </>;
    }
    if (catId === CATEGORY_MAP.motherboard) {
      return <>
        <div><b>Brand:</b> {product.brand || '-'}</div>
        <div><b>Model:</b> {product.model || '-'}</div>
        <div><b>Chipset:</b> {product.chipset || '-'}</div>
        <div><b>Socket:</b> {product.socket || '-'}</div>
        <div><b>Form factor:</b> {product.formFactor || '-'}</div>
        <div><b>RAM slots:</b> {product.ramSlots || '-'}</div>
        <div><b>Max RAM:</b> {product.maxRam ? `${product.maxRam} GB` : '-'}</div>
      </>;
    }
    if (catId === CATEGORY_MAP.keyboard) {
      return <>
        <div><b>Type:</b> {product.type || '-'}</div>
        <div><b>Switch type:</b> {product.switchType || '-'}</div>
        <div><b>Connectivity:</b> {product.connectivity || '-'}</div>
        <div><b>Layout:</b> {product.layout || '-'}</div>
        <div><b>Has RGB:</b> {product.hasRgb !== undefined ? (product.hasRgb ? 'Có' : 'Không') : '-'}</div>
      </>;
    }
    if (catId === CATEGORY_MAP.gpu) {
      return <>
        <div><b>Brand:</b> {product.brand || '-'}</div>
        <div><b>Model:</b> {product.model || '-'}</div>
        <div><b>VRAM:</b> {product.vram ? `${product.vram} GB` : '-'}</div>
        <div><b>Chipset:</b> {product.chipset || '-'}</div>
        <div><b>Memory type:</b> {product.memoryType || '-'}</div>
        <div><b>Length:</b> {product.lengthMm ? `${product.lengthMm} mm` : '-'}</div>
      </>;
    }
    if (catId === CATEGORY_MAP.mouse) {
      return <>
        <div><b>Type:</b> {product.type || '-'}</div>
        <div><b>DPI:</b> {product.dpi || '-'}</div>
        <div><b>Connectivity:</b> {product.connectivity || '-'}</div>
        <div><b>Has RGB:</b> {product.hasRgb !== undefined ? (product.hasRgb ? 'Có' : 'Không') : '-'}</div>
      </>;
    }
    if (catId === CATEGORY_MAP['network-card']) {
      return <>
        <div><b>Type:</b> {product.type || '-'}</div>
        <div><b>Interface:</b> {product.interface || '-'}</div>
        <div><b>Speed:</b> {product.speedMbps ? `${product.speedMbps} Mbps` : '-'}</div>
      </>;
    }
    // Trường hợp mặc định (sản phẩm chung)
    return <>
      <div><b>Mô tả:</b> {product.description}</div>
      <div><b>Tồn kho:</b> {product.stock}</div>
      <div><b>Trạng thái:</b> {product.isActive ? 'Hoạt động' : 'Không hoạt động'}</div>
      <div><b>Ngày tạo:</b> {formatDate(product.createdAt)}</div>
      <div><b>Ngày cập nhật:</b> {formatDate(product.updatedAt)}</div>
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