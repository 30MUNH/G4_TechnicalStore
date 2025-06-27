import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import { productService } from '../../services/productService';
import ProductTable from './ProductTable';
import ProductModal from './ProductModal';
import './ManageProduct.css';

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

interface Category {
  id: string;
  name: string;
}

const ManageProduct: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await productService.getCategories();
      setCategories(response);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAllProducts();
      setProducts(response);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await productService.deleteProduct(productId);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Có lỗi xảy ra khi xóa sản phẩm');
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleModalSubmit = async (productData: Partial<Product>) => {
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, productData);
      } else {
        await productService.createProduct(productData);
      }
      handleModalClose();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Có lỗi xảy ra khi lưu sản phẩm');
    }
  };

  const filteredProducts = selectedCategory 
    ? products.filter(product => product.categoryId === selectedCategory)
    : products;

  if (!user || (user.role !== 'manager' && user.role !== 'admin')) {
    return (
      <div className="manage-product-container">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>Bạn không có quyền truy cập trang này.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-product-container">
      <div className="manage-product-header">
        <h1>Quản lý sản phẩm</h1>
        <button className="create-btn" onClick={handleCreateProduct}>
          <FontAwesomeIcon icon={faPlus} /> Tạo sản phẩm mới
        </button>
      </div>

      <div className="manage-product-content">
        <div className="category-sidebar">
          <h3>Danh mục sản phẩm</h3>
          <div className="category-list">
            <button
              className={`category-item ${!selectedCategory ? 'active' : ''}`}
              onClick={() => handleCategoryChange('')}
            >
              Tất cả sản phẩm
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="product-content">
          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : (
            <ProductTable
              products={filteredProducts}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          )}
        </div>
      </div>

      {isModalOpen && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
        />
      )}
    </div>
  );
};

export default ManageProduct; 