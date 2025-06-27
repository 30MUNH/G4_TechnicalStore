import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  stock: number;
  categoryId: string;
  isActive: boolean;
  url?: string;
}

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
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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
            <th>Giá</th>
            <th>Tồn kho</th>
            <th>Mô tả</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
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
              <td className="product-name">{product.name}</td>
              <td className="product-price">{formatCurrency(product.price)}</td>
              <td className="product-stock">{product.stock}</td>
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable; 