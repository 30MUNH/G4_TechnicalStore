import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faTimes, faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import { productService } from '../../services/productService';
import ProductTable from './ProductTable';
import ProductModal from './ProductModal';
import './ManageProduct.css';

import type { Product } from '../../types/product';

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
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter states
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Debug logging
  console.log('ManageProduct component rendered with user:', user);

  useEffect(() => {
    console.log('ManageProduct useEffect triggered');
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      const response = await productService.getCategories();
      console.log('Categories fetched:', response);
      setCategories(response);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Không thể tải danh mục sản phẩm');
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching products for admin/manager...');
      // Sử dụng getAllProductsIncludingOutOfStock cho admin/manager
      const response = await productService.getAllProductsIncludingOutOfStock();
      console.log('Products fetched:', response);
      setProducts(response);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Không thể tải danh sách sản phẩm');
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
        await fetchProducts(); // Refresh danh sách
        alert('Xóa sản phẩm thành công');
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
        alert('Cập nhật sản phẩm thành công');
      } else {
        await productService.createProduct(productData);
        alert('Tạo sản phẩm thành công');
      }
      handleModalClose();
      await fetchProducts(); // Refresh danh sách
    } catch (error: unknown) {
      console.error('Error saving product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi lưu sản phẩm';
      alert(errorMessage);
    }
  };

  // Filter products based on all criteria
  const getFilteredProducts = () => {
    let filtered = products;

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.categoryId === selectedCategory);
    }

    // Search keyword filter
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase().trim();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(keyword) ||
        (product.description || '').toLowerCase().includes(keyword) ||
        (product.category?.name || '').toLowerCase().includes(keyword)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(product => product.isActive === isActive);
    }

    // Stock filter
    if (stockFilter !== 'all') {
      switch (stockFilter) {
        case 'in-stock':
          filtered = filtered.filter(product => product.stock > 0);
          break;
        case 'out-of-stock':
          filtered = filtered.filter(product => product.stock === 0);
          break;
        case 'low-stock':
          filtered = filtered.filter(product => product.stock > 0 && product.stock <= 10);
          break;
      }
    }

    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  const clearFilters = () => {
    setSearchKeyword('');
    setStatusFilter('all');
    setStockFilter('all');
    setSelectedCategory('');
  };

  const hasActiveFilters = searchKeyword || statusFilter !== 'all' || stockFilter !== 'all' || selectedCategory;

  // Temporarily disabled authentication check for testing
  // if (!user || (user.role !== 'manager' && user.role !== 'admin')) {
  //   return (
  //     <div className="manage-product-container">
  //       <div className="access-denied">
  //         <h2>Access Denied</h2>
  //         <p>Bạn không có quyền truy cập trang này.</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="manage-product-container">
      <div className="manage-product-header">
        <h1>Quản lý sản phẩm</h1>
        <button className="create-btn" onClick={handleCreateProduct}>
          <FontAwesomeIcon icon={faPlus} /> Tạo sản phẩm mới
        </button>
      </div>

      {error && (
        <div className="error-message" style={{ 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: '12px', 
          borderRadius: '4px', 
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="search-filter-section" style={{
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #e9ecef'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, color: '#333' }}>
            <FontAwesomeIcon icon={faSearch} style={{ marginRight: '8px' }} />
            Tìm kiếm & Lọc
          </h3>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            style={{
              background: 'none',
              border: '1px solid #007bff',
              color: '#007bff',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FontAwesomeIcon icon={faFilter} />
            {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên sản phẩm, mô tả hoặc danh mục..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Trạng thái:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              >
                <option value="all">Tất cả</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Tình trạng kho:</label>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              >
                <option value="all">Tất cả</option>
                <option value="in-stock">Còn hàng</option>
                <option value="out-of-stock">Hết hàng</option>
                <option value="low-stock">Sắp hết hàng (≤10)</option>
              </select>
            </div>
          </div>
        )}

        {/* Filter Summary */}
        {hasActiveFilters && (
          <div style={{
            marginTop: '15px',
            padding: '10px',
            background: '#e3f2fd',
            borderRadius: '4px',
            border: '1px solid #bbdefb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <strong>Kết quả lọc:</strong> {filteredProducts.length} sản phẩm
              <span style={{ marginLeft: '10px', fontSize: '0.9em', color: '#666' }}>
                (Từ tổng số {products.length} sản phẩm)
              </span>
            </div>
            <button
              onClick={clearFilters}
              style={{
                background: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      <div className="manage-product-content">
        <div className="category-sidebar">
          <h3>Danh mục sản phẩm</h3>
          <div className="category-list">
            <button
              className={`category-item ${!selectedCategory ? 'active' : ''}`}
              onClick={() => handleCategoryChange('')}
            >
              Tất cả sản phẩm ({products.length})
            </button>
            {categories.map(category => {
              const categoryProductCount = products.filter(product => product.categoryId === category.id).length;
              return (
                <button
                  key={category.id}
                  className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  {category.name} ({categoryProductCount})
                </button>
              );
            })}
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