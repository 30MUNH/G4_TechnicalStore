/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../product_manager/ProductList.css'
interface Product {
  id: string;
  name: string;
  url: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  slug: string;
  price: number;
  description: string;
  stock: number;
  category: string;
}

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
        const response = await axios.get("http://localhost:4000/api/products");
        if (response.data.success) {
          const formattedProducts: Product[] = response.data.data.map(
            (product: any) => ({
              id: product.id,
              name: product.name,
              url: product.url,
              active: product.active,
              createdAt: product.createdAt,
              updatedAt: product.updatedAt,
              deletedAt: product.deletedAt,
              slug: product.slug,
              price: product.price,
              description: product.description,
              stock: product.stock,
              category: product.category,
            })
          );
          setProducts(formattedProducts);
          setFilteredProducts(formattedProducts);
        } else {
          setError("Không thể lấy dữ liệu từ API");
        }
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
        product.category.toLowerCase().includes(keyword);
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "true" && product.active) ||
        (statusFilter === "false" && !product.active);
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
                <td>{product.category}</td>
                {/* <td>{product.categoryName}</td> */}
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
                <td>{product.price}</td>
                <td>{product.stock}</td>
                <td>{product.active ? "Hoạt động" : "Không hoạt động"}</td>
                <td>
                  <button onClick={() => handleDetail(product.id)}>
                    Chi tiết
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} style={{ textAlign: "center" }}>
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
