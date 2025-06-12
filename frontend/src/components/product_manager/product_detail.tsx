/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './productDetail.css';

interface Product {
  id?: string;
  name: string;
  category: string;
  url: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  slug?: string;
  price: number;
  description: string;
  stock: number;
}
// const formatVND = (value: number | string) => {
//   if (!value && value !== 0) return '';
//   return new Intl.NumberFormat('vi-VN', {
//     style: 'currency',
//     currency: 'VND',
//     minimumFractionDigits: 0,
//   }).format(Number(value));
// };
const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
const [validationErrors, setValidationErrors] = useState<Partial<Product>>({});
  const navigate = useNavigate();

  const isAddMode = !id; // Kiểm tra nếu không có id thì là chế độ thêm mới

  useEffect(() => {
    if (isAddMode) {
      // Chế độ thêm mới: Khởi tạo form rỗng
      const initialFormData: Product = {
        name: "",
        category: "",
        url: "",
        active: true,
        price: 0,
        description: "",
        stock: 0,
      };
      setFormData(initialFormData);
    } else {
      // Chế độ chỉnh sửa: Lấy dữ liệu sản phẩm
      const fetchProduct = async () => {
        try {
          const response = await axios.get(
            `http://localhost:4000/api/products/${id}`
          );
          if (response.data.success) {
            const productData: Product = {
              id: response.data.data.id,
              name: response.data.data.name,
              category: response.data.data.category,
              url: response.data.data.url,
              active: response.data.data.active,
              createdAt: response.data.data.createdAt,
              updatedAt: response.data.data.updatedAt,
              deletedAt: response.data.data.deletedAt,
              slug: response.data.data.slug,
              price: response.data.data.price,
              description: response.data.data.description,
              stock: response.data.data.stock,
            };
            setProduct(productData);
            setFormData(productData);
          } else {
            setError("Không thể lấy dữ liệu sản phẩm");
          }
        } catch (err: any) {
          setError("Đã có lỗi xảy ra khi gọi API: " + err.message);
        }
      };

      fetchProduct();
    }
  }, [id, isAddMode]);
const validateForm = (data: Product): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!data.name.trim()) errors.name = "Tên sản phẩm là bắt buộc";
  if (!data.category.trim()) errors.category = "Danh mục là bắt buộc";
  if (!data.url.trim()) errors.url = "URL hình ảnh là bắt buộc";
  if (!data.description.trim()) errors.description = "Mô tả là bắt buộc";
  if (data.price <= 0) errors.price = "Giá phải lớn hơn 0";
  if (data.stock < 0) errors.stock = "Số lượng tồn kho không được âm";
  return errors;
};
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === 'price') {
      // Loại bỏ ký tự không phải số để lưu giá trị dạng số
      const rawValue = value.replace(/[^0-9]/g, '');
      setFormData((prev) =>
        prev
          ? {
              ...prev,
              [name]: rawValue ? Number(rawValue) : 0,
            }
          : prev
      );
    } else {
      setFormData((prev) =>
        prev
          ? {
              ...prev,
              [name]: type === 'checkbox' ? checked : value,
            }
          : prev
      );
    }
        setValidationErrors((prev) => ({ ...prev, [name]: undefined }));

  };

  const handleSave = async () => {
    if (!formData) return;
     const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    try {
      // Tạo đối tượng chỉ chứa các trường cần thiết
      const payload = {
        name: formData.name,
        category: formData.category,
        price: formData.price,
        stock: formData.stock,
        url: formData.url,
        description: formData.description,
        active: formData.active,
      };

      if (isAddMode) {
        // Chế độ thêm mới: Gửi POST request
        const response = await axios.post(
          "http://localhost:4000/api/products",
          payload
        );
        if (response.data.success) {
           setSuccessMessage("Tạo sản phẩm thành công!");
          setTimeout(() => {
            navigate("/products");
          }, 3000);
        } else {
          setError("Không thể tạo sản phẩm");
        }
      } else {
        // Chế độ chỉnh sửa: Gửi PUT request với payload
        const response = await axios.put(
          `http://localhost:4000/api/products/${id}`,
          payload
        );
        if (response.data.success) {
          setProduct({ ...product, ...payload });
          setSuccessMessage("Cập nhật sản phẩm thành công!");
          setTimeout(() => {
            navigate("/products");
          }, 3000);
          // console.log("payload: ", payload);
        } else {
          setError("Không thể cập nhật sản phẩm");
        }
      }
    } catch (err: any) {
      setError(
        `Lỗi khi ${isAddMode ? "tạo" : "cập nhật"} sản phẩm: ${err.message}`
      );
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:4000/api/products/${id}`);
     setSuccessMessage("Xóa sản phẩm thành công!");
      setTimeout(() => {
        navigate("/products");
      }, 3000);
    } catch (err: any) {
      setError("Lỗi khi xóa sản phẩm: " + err.message);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleBack = () => navigate("/products");

  const openDeleteModal = () => setShowDeleteModal(true);
  const closeDeleteModal = () => setShowDeleteModal(false);

  if (error) return <div>{error}</div>;
  if (!formData) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="product-detail-container">
      <h2>{isAddMode ? "Thêm Sản Phẩm Mới" : "Chi Tiết Sản Phẩm"}</h2>
       {successMessage && (
        <div className="success-notification">
          {successMessage}
        </div>
      )}
        <div className="product-detail-card">
        <div className="product-detail-image-wrapper">
          <div className="form-group">
            <label>URL Hình ảnh:</label>
            <input
              type="text"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.url ? 'border-red-500' : ''}`}
            />
            {validationErrors.url && (
              <p className="text-red-500 text-sm">{validationErrors.url}</p>
            )}
          </div>
          {formData.url && (
            <img
              src={formData.url}
              alt={formData.name}
              className="product-detail-image"
              onError={(e) =>
                (e.currentTarget.src = "https://via.placeholder.com/150")
              }
            />
          )}
        </div>

        <div className="product-detail-info">
          <div className="form-group">
            <label>Tên sản phẩm:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.name ? 'border-red-500' : ''}`}
            />
            {validationErrors.name && (
              <p className="text-red-500 text-sm">{validationErrors.name}</p>
            )}
          </div>
          <div className="form-group">
            <label>Danh mục:</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.category ? 'border-red-500' : ''}`}
            />
            {validationErrors.category && (
              <p className="text-red-500 text-sm">{validationErrors.category}</p>
            )}
          </div>
          <div className="form-group">
            <label>Giá:</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.price ? 'border-red-500' : ''}`}
            />
            {validationErrors.price && (
              <p className="text-red-500 text-sm">{validationErrors.price}</p>
            )}
          </div>
          <div className="form-group">
            <label>Mô tả:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.description ? 'border-red-500' : ''}`}
            />
            {validationErrors.description && (
              <p className="text-red-500 text-sm">{validationErrors.description}</p>
            )}
          </div>
          <div className="form-group">
            <label>Hàng tồn kho:</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              className={`form-input ${validationErrors.stock ? 'border-red-500' : ''}`}
            />
            {validationErrors.stock && (
              <p className="text-red-500 text-sm">{validationErrors.stock}</p>
            )}
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleInputChange}
              />
              Trạng thái: {formData.active ? "Hoạt động" : "Không hoạt động"}
            </label>
          </div>
        </div>
      </div>

      <div className="product-detail-actions">
        <button onClick={handleBack}>Quay lại</button>
        <button onClick={handleSave}>{isAddMode ? "Lưu" : "Chỉnh sửa"}</button>
        {!isAddMode && <button onClick={openDeleteModal}>Xóa</button>}
      </div>

      {showDeleteModal && !isAddMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Xác nhận xóa</h3>
            <p className="mb-6">
              Bạn có chắc chắn muốn xóa sản phẩm{" "}
              <strong>{product?.name}</strong>?
            </p>
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