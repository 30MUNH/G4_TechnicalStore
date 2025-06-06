/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../product_manager/ProductList.css'
interface Product {
  id: string;
  name: string;
  code: string;
  categoryName: string;
  url: string;
  active: boolean;
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filterKeyword, setFilterKeyword] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/products');
        if (response.data.success) {
          const formattedProducts: Product[] = response.data.data.map((product: any) => ({
            id: product.id,
            name: product.name,
            code: product.code,
            categoryName: product.categoryName,
            url: product.url,
            active: product.active,
          }));
          setProducts(formattedProducts);
          setFilteredProducts(formattedProducts);
        } else {
          setError('Không thể lấy dữ liệu từ API');
        }
      } catch (err: any) {
        setError('Đã có lỗi xảy ra khi gọi API: ' + err.message);
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
        product.code.toLowerCase().includes(keyword);
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'true' && product.active) ||
        (statusFilter === 'false' && !product.active);
      return matchKeyword && matchStatus;
    });
    setFilteredProducts(filtered);
  };

  const handleDetail = (id: string) => {
    navigate(`/products/${id}`);
  };

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="product-list-container">
      <h2>Danh Sách Sản phẩm</h2>

      <div className="filter-section" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <div className="filter-group">
          <label>Trạng thái:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ marginLeft: '5px' }}
          >
            <option value="all">Tất cả</option>
            <option value="true">Hoạt động</option>
            <option value="false">Không hoạt động</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Tên/Mã sản phẩm:</label>
          <input
            type="text"
            placeholder="Nhập tên hoặc mã sp"
            value={filterKeyword}
            onChange={(e) => setFilterKeyword(e.target.value)}
            style={{ marginLeft: '5px' }}
          />
        </div>

        <button className="search-button" onClick={handleSearch}>
          Tìm kiếm
        </button>
      </div>

      <table className="product-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên</th>
            <th>Code</th>
            {/* <th>Danh mục</th> */}
            <th>Ảnh</th>
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
                <td>{product.code}</td>
                {/* <td>{product.categoryName}</td> */}
                <td>
                  <img src={product.url} alt={product.name} style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                </td>
                <td>{product.active ? 'Hoạt động' : 'Không hoạt động'}</td>
                <td>
                  <button onClick={() => handleDetail(product.id)}>Chi tiết</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center' }}>
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
