/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import type { Product } from '../../types/product';
import './ProductList.css'

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filterKeyword, setFilterKeyword] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await productService.getAllProducts();
        setProducts(products);
        setFilteredProducts(products);
      } catch (err: any) {
        setError("Đã có lỗi xảy ra khi gọi API: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = () => {
    const keyword = filterKeyword.toLowerCase().trim();
    const filtered = products.filter((product) => {
      const matchKeyword =
        product.name.toLowerCase().includes(keyword) ||
        (product.category?.name || '').toLowerCase().includes(keyword);
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "true" && product.isActive) ||
        (statusFilter === "false" && !product.isActive);
      return matchKeyword && matchStatus;
    });
    setFilteredProducts(filtered);
  };

  const handleDetail = (id: string) => {
    navigate(`/products/${id}`);
  };
  const handleAddNew = () => {
    navigate("/products/add");
  };
  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="product-list-container">
      <h2>Danh Sách Sản phẩm</h2>

      <div
        className="filter-section"
        style={{ display: "flex", gap: "10px", marginBottom: "20px" }}
      >
        <div className="filter-group">
          <label>Trạng thái:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ marginLeft: "5px" }}
          >
            <option value="all">Tất cả</option>
            <option value="true">Hoạt động</option>
            <option value="false">Không hoạt động</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Tên sản phẩm:</label>
          <input
            type="text"
            placeholder="Nhập tên sản phẩm"
            value={filterKeyword}
            onChange={(e) => setFilterKeyword(e.target.value)}
            style={{ marginLeft: "5px" }}
          />
        </div>

        <button className="search-button" onClick={handleSearch}>
          Tìm kiếm
        </button>
        <button className="add-button" onClick={handleAddNew}>
          Thêm mới
        </button>
      </div>

      <table className="product-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên</th>
            <th>Danh mục</th>
            <th>Ảnh</th>
            <th>Giá</th>
            <th>Hàng tồn kho</th>
            <th>Trạng thái</th>
            <th>Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <tr key={product.id}>
                <td>{index + 1}</td>
                <td>{product.name}</td>
                <td>{product.category?.name || 'N/A'}</td>
                <td>
                  <img
                    src={product.url}
                    alt={product.name}
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                    }}
                  />
                </td>
                <td>{product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                <td>{product.stock}</td>
                <td>{product.isActive ? "Hoạt động" : "Không hoạt động"}</td>
                <td>
                  <button onClick={() => handleDetail(product.id)}>
                    Chi tiết
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} style={{ textAlign: "center" }}>
                Không có dữ liệu hiển thị
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;
