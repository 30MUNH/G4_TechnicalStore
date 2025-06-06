/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './productDetail.css';

interface Product {
  // id: string;
  name: string;
  code: string;
  categoryName: string;
  url: string;
  active: boolean;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/products/${id}`);
        if (response.data.success) {
          const productData: Product = {
            // id: response.data.data.id,
            name: response.data.data.name,
            code: response.data.data.code,
            categoryName: response.data.data.categoryName,
            url: response.data.data.url,
            active: response.data.data.active,
          };
          setProduct(productData);
          setFormData(productData);
        } else {
          setError('Không thể lấy dữ liệu sản phẩm');
        }
      } catch (err: any) {
        setError('Đã có lỗi xảy ra khi gọi API: ' + err.message);
      }
    };

    fetchProduct();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => (prev ? {
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    } : prev));
  };

  const handleSave = async () => {
    if (!formData) return;
    try {
      await axios.put(`http://localhost:4000/api/products/${id}`, formData);
      setProduct(formData);
      setIsEditing(false);
    } catch (err: any) {
      setError('Lỗi khi cập nhật sản phẩm: ' + err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:4000/api/products/${id}`);
      navigate('/products');
    } catch (err: any) {
      setError('Lỗi khi xóa sản phẩm: ' + err.message);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing && product) {
      setFormData(product);
    }
    setIsEditing(!isEditing);
  };

  const handleBack = () => navigate('/products');

  const openDeleteModal = () => setShowDeleteModal(true);
  const closeDeleteModal = () => setShowDeleteModal(false);

  if (error) return <div>{error}</div>;
  if (!formData || !product) return <p>Đang tải dữ liệu sản phẩm...</p>;

  return (
    <div className="product-detail-container">
      <h2>Chi Tiết Sản Phẩm</h2>
      <div className="product-detail-card">
        <div className="product-detail-image-wrapper">
          {isEditing ? (
            <div className="form-group">
              <label>URL Hình ảnh:</label>
              <input
                type="text"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          ) : (
            <img
              src={formData.url}
              alt={formData.name}
              className="product-detail-image"
              onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')}
            />
          )}
        </div>

        <div className="product-detail-info">
          {isEditing ? (
            <>
              <div className="form-group">
                <label>Tên sản phẩm:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Mã sản phẩm:</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Danh mục:</label>
                <input
                  type="text"
                  name="categoryName"
                  value={formData.categoryName}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                  />
                  Trạng thái: {formData.active ? 'Hoạt động' : 'Không hoạt động'}
                </label>
              </div>
            </>
          ) : (
            <>
              <h3>{product.name}</h3>
              <p><strong>Mã sản phẩm:</strong> {product.code}</p>
              <p><strong>Danh mục:</strong> {product.categoryName}</p>
              <p><strong>Trạng thái:</strong> {product.active ? 'Hoạt động' : 'Không hoạt động'}</p>
            </>
          )}
        </div>
      </div>

      <div className="product-detail-actions">
        <button onClick={handleBack}>Quay lại</button>
        {isEditing ? (
          <>
            <button onClick={handleSave}>Lưu</button>
            <button onClick={handleEditToggle}>Hủy</button>
          </>
        ) : (
          <>
            <button onClick={handleEditToggle}>Chỉnh sửa</button>
            <button onClick={openDeleteModal}>Xóa</button>
          </>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Xác nhận xóa</h3>
            <p className="mb-6">Bạn có chắc chắn muốn xóa sản phẩm <strong>{product.name}</strong>?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;