/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserList.css';

interface User {
  id: number;
  name: string;
  username: string;
  createdAt: string;
  role: string;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filterRole, setFilterRole] = useState<string>('');
  const [filterKeyword, setFilterKeyword] = useState<string>('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/userManagement');
        if (response.data.success) {
          const formattedUsers: User[] = response.data.data.map((user: any) => ({
            id: user.id,
            name: user.name,
            username: user.username,
            createdAt: user.createdAt,
            role: user.role.name.toLowerCase(),
          }));
          setUsers(formattedUsers);
          setFilteredUsers(formattedUsers);
        } else {
          setError('Không thể lấy dữ liệu từ API');
        }
      } catch (err: any) {
        setError('Đã có lỗi xảy ra khi gọi API: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleFilter = () => {
    const keyword = filterKeyword.toLowerCase().trim();
    const filtered = users.filter((user) => {
      const matchesRole = filterRole === '' || user.role === filterRole;
      const matchesKeyword =
        keyword === '' ||
        user.name.toLowerCase().includes(keyword) ||
        user.username.toLowerCase().includes(keyword);
      return matchesRole && matchesKeyword;
    });
    setFilteredUsers(filtered);
  };

  const handleRoleChange = (id: number, newRole: string) => {
    setFilteredUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === id ? { ...user, role: newRole } : user
      )
    );
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString('vi-VN');
  };

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="user-list-container">
      <h2>Danh Sách Người Dùng</h2>
      <div className="filter-section">
        <div className="filter-group">
          <label htmlFor="filter-role">Role:</label>
          <select
            id="filter-role"
            className="filter-select"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="">Tất cả</option>
            <option value="admin">Admin</option>
            <option value="user">Người dùng</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-search">Tên/Tên đăng nhập:</label>
          <input
            id="filter-search"
            type="text"
            placeholder="Nhập tên hoặc tên đăng nhập"
            className="filter-input"
            value={filterKeyword}
            onChange={(e) => setFilterKeyword(e.target.value)}
          />
        </div>

        <button className="search-button" onClick={handleFilter}>
          Tìm kiếm
        </button>
      </div>

      <table className="user-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên</th>
            <th>Tên đăng nhập</th>
            <th>Thời gian tạo</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user, index) => (
              <tr key={user.id}>
                <td>{index + 1}</td>
                <td>{user.name}</td>
                <td>{user.username}</td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="role-select"
                  >
                    <option value="admin">Admin</option>
                    <option value="user">Người dùng</option>
                  </select>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center' }}>
                Không có dữ liệu hiển thị
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
