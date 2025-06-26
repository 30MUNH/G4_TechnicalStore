import React, { useEffect, useState } from 'react';
import { productService } from '../services/productService';
import type { Product } from '../types/product';
import './AllProductsPage.css';
import { useLocation } from 'react-router-dom';
import ProductDetailModal from '../components/product_manager/productDetailModal';

const CATEGORY_FILTERS = [
  { key: 'laptop', label: 'Laptop' },
  { key: 'pc', label: 'PC' },
  { key: 'drive', label: 'Drive' },
  { key: 'monitor', label: 'Monitor' },
  { key: 'cpu', label: 'CPU' },
  { key: 'cooler', label: 'Cooler' },
  { key: 'ram', label: 'RAM' },
  { key: 'psu', label: 'PSU' },
  { key: 'case', label: 'Case' },
  { key: 'headset', label: 'Headset' },
  { key: 'motherboard', label: 'Motherboard' },
  { key: 'keyboard', label: 'Keyboard' },
  { key: 'gpu', label: 'GPU' },
  { key: 'mouse', label: 'Mouse' },
  { key: 'networkCard', label: 'Network Card' },
];

const SORT_OPTIONS = [
  { value: 'asc', label: 'Giá tăng dần' },
  { value: 'desc', label: 'Giá giảm dần' },
];

const PRODUCTS_PER_PAGE = 16;

const AllProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<string>('asc');
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const location = useLocation();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Set filter theo state khi chuyển trang từ HomePage
  useEffect(() => {
    if (location.state && location.state.filter) {
      if (location.state.filter === 'accessories') {
        // Khi chọn accessories, tự động chọn tất cả category trừ laptop và pc
        const accessoryCategories = CATEGORY_FILTERS
          .filter(cat => cat.key !== 'laptop' && cat.key !== 'pc')
          .map(cat => cat.key);
        setSelectedCategories(accessoryCategories);
      } else {
        setSelectedCategories([location.state.filter]);
      }
    } else if (location.state && location.state.clearFilter) {
      // Khi click vào ALL PRODUCTS, clear tất cả filter
      setSelectedCategories([]);
    }
  }, [location.state]);

  useEffect(() => {
    if (location.state && location.state.searchResults) {
      setProducts(location.state.searchResults);
      setLoading(false);
    } else {
      const fetchProducts = async () => {
        setLoading(true);
        const res = await productService.getAllProducts();
        setProducts(res);
        setLoading(false);
      };
      fetchProducts();
    }
  }, [location.state]);

  useEffect(() => {
    let filtered = [...products];
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) => {
        const categorySlug = p.category?.slug?.toLowerCase();
        const categoryName = p.category?.name?.toLowerCase();
        return selectedCategories.some(selectedCat => 
          categorySlug === selectedCat.toLowerCase() ||
          categoryName === selectedCat.toLowerCase()
        );
      });
    }
    filtered = filtered.sort((a, b) =>
      sortOrder === 'asc' ? a.price - b.price : b.price - a.price
    );
    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset về trang 1 khi filter/sort
  }, [products, selectedCategories, sortOrder]);

  const handleCategoryToggle = (categoryKey: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryKey)) {
        return prev.filter(cat => cat !== categoryKey);
      } else {
        return [...prev, categoryKey];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedCategories([]);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIdx = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIdx = startIdx + PRODUCTS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIdx, endIdx);

  // Tạo mảng số trang hiển thị dạng rút gọn (2 số đầu, 2 số cuối, trang hiện tại, 1 số trước/sau, ...)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Luôn hiển thị 1, 2
      pages.push(1, 2);
      // ... nếu cần
      if (currentPage > 4) pages.push('...');
      // Các trang gần currentPage
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        if (i > 2 && i < totalPages - 1) pages.push(i);
      }
      // ... nếu cần
      if (currentPage < totalPages - 4) pages.push('...');
      // Luôn hiển thị cuối-1, cuối
      pages.push(totalPages - 1, totalPages);
    }
    // Loại bỏ số trùng và loại bỏ ... cạnh nhau hoặc cạnh số liên tiếp
    const result: (number | string)[] = [];
    let prev: number | string | null = null;
    for (const p of pages) {
      if (typeof p === 'string' && (prev === '...' || typeof prev === 'number' && Math.abs((prev as number) - (pages[pages.indexOf(p) + 1] as number)) === 1)) {
        continue;
      }
      if (result.length && result[result.length - 1] === p) continue;
      result.push(p);
      prev = p;
    }
    return result.filter((p, i, arr) => !(p === '...' && (i === 0 || i === arr.length - 1)));
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleOpenQuickView = async (product: Product) => {
    // Gọi API lấy chi tiết sản phẩm
    const detail = await productService.getProductById(product.id);
    setQuickViewProduct(detail || product);
    setIsQuickViewOpen(true);
  };
  const handleCloseQuickView = () => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
  };

  return (
    <div className="all-products-page">
      <aside className="sidebar">
        <h3>Lọc theo loại</h3>
        <ul>
          {CATEGORY_FILTERS.map((cat) => (
            <li
              key={cat.key}
              className={selectedCategories.includes(cat.key) ? 'active' : ''}
              onClick={() => handleCategoryToggle(cat.key)}
            >
              {cat.label}
            </li>
          ))}
          <li
            className={selectedCategories.length === 0 ? 'active' : ''}
            onClick={handleSelectAll}
          >
            Tất cả
          </li>
        </ul>
      </aside>
      <main className="products-main">
        <div className="sort-bar">
          <span>Sắp xếp theo giá:</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {loading ? (
          <div>Đang tải sản phẩm...</div>
        ) : (
          <>
            <div className="products-grid">
              {paginatedProducts.length === 0 ? (
                <div>Không có sản phẩm nào.</div>
              ) : (
                paginatedProducts.map((product) => (
                  <div
                    className="product-card"
                    key={product.id}
                    onClick={async () => await handleOpenQuickView(product)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img src={product.url} alt={product.name} />
                    <h4>{product.name}</h4>
                    <div className="product-price">
                      {product.price.toLocaleString('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      })}
                    </div>
                    <div className="product-category">
                      {product.category?.name}
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-bar">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                  Previous
                </button>
                {getPageNumbers().map((page, idx) =>
                  typeof page === 'number' ? (
                    <button
                      key={page}
                      className={page === currentPage ? 'active' : ''}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ) : (
                    <span key={"ellipsis-" + idx} style={{ padding: '0 8px', color: '#888', fontWeight: 700 }}>...</span>
                  )
                )}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                  Next
                </button>
              </div>
            )}
            <ProductDetailModal isOpen={isQuickViewOpen} onClose={handleCloseQuickView} product={quickViewProduct} />
          </>
        )}
      </main>
    </div>
  );
};

export default AllProductsPage; 