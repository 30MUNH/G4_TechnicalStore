import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faEye, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import type { Product } from '../../types/product';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({ products, onEdit, onDelete }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(amount)
      .replace('₫', 'đ');
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text) return 'Không có mô tả';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Hết hàng', class: 'out-of-stock' };
    if (stock <= 10) return { text: 'Sắp hết', class: 'low-stock' };
    return { text: 'Còn hàng', class: 'in-stock' };
  };

  const getStockStatusIcon = (stock: number) => {
    if (stock === 0) return <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: '#dc3545' }} />;
    if (stock <= 10) return <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: '#ffc107' }} />;
    return null;
  };

  if (products.length === 0) {
    return (
      <div className="no-products">
        <p>Không có sản phẩm nào trong danh mục này.</p>
      </div>
    );
  }

  return (
    <div className="product-table-container">
      <table className="product-table">
        <thead>
          <tr>
            <th>Hình ảnh</th>
            <th>Tên sản phẩm</th>
            <th>Danh mục</th>
            <th>Giá</th>
            <th>Tồn kho</th>
            <th>Mô tả</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => {
            const stockStatus = getStockStatus(product.stock);
            return (
              <tr key={product.id} className={!product.isActive ? 'inactive-product' : ''}>
                <td>
                  <div className="product-image">
                    <img 
                      src={product.url || '/img/product01.png'} 
                      alt={product.name}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/img/product01.png';
                      }}
                    />
                  </div>
                </td>
                <td className="product-name">
                  <div>
                    <strong>{product.name}</strong>
                    {!product.isActive && (
                      <span style={{ 
                        display: 'block', 
                        fontSize: '12px', 
                        color: '#dc3545',
                        marginTop: '4px'
                      }}>
                        (Đã ẩn)
                      </span>
                    )}
                  </div>
                </td>
                <td className="product-category">
                  {product.category?.name || 'Không có danh mục'}
                </td>
                <td className="product-price">{formatCurrency(product.price)}</td>
                <td className="product-stock">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getStockStatusIcon(product.stock)}
                    <span className={`stock-status ${stockStatus.class}`}>
                      {product.stock} ({stockStatus.text})
                    </span>
                  </div>
                </td>
                <td className="product-description">
                  {truncateText(product.description)}
                </td>
                <td>
                  <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                    {product.isActive ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </td>
                <td className="action-buttons">
                  <button 
                    className="view-btn"
                    title="Xem chi tiết"
                    onClick={() => window.open(`/products/${product.id}`, '_blank')}
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  <button 
                    className="edit-btn"
                    onClick={() => onEdit(product)}
                    title="Chỉnh sửa"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => onDelete(product.id)}
                    title="Xóa"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable; 