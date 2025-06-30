import React, { useState, useEffect } from "react";
import { Eye, Pencil, Trash2, Search, ArrowLeft, FileDown, FileUp, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import CustomerDetail from "./CustomerDetail";
import CustomerEdit from "./CustomerEdit";
import DeleteConfirmation from "./DeleteConfirmation";
import { customerService } from "../../services/customerService";
import styles from "./styles/CustomerList.module.css";

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Simple notification function
  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
      color: white;
      border-radius: 4px;
      z-index: 10000;
      font-family: Arial, sans-serif;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      max-width: 300px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerService.getAllCustomers();
      if (response?.success && Array.isArray(response?.data)) {
        setCustomers(response.data);
        setError(null);
      } else {
        setCustomers([]);
        setError(response?.message || "Không thể tải danh sách khách hàng");
        showNotification(response?.message || "Không thể tải danh sách khách hàng", 'error');
      }
    } catch (err) {
      setCustomers([]);
      const errorMsg = err.response?.data?.message || err.message || "Không thể tải danh sách khách hàng";
      setError(errorMsg);
      showNotification(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Auto refresh every 30 seconds
  useEffect(() => {
    fetchCustomers();
    const interval = setInterval(() => {
      fetchCustomers();
    }, 30000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };

  const handleEditClick = (customer) => {
    setSelectedCustomer(customer);
    setShowEditModal(true);
  };

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setShowEditModal(true);
  };

  const handleEditSave = async (editedCustomer) => {
    try {
      let response;
      if (editedCustomer.id) {
        response = await customerService.updateCustomer(editedCustomer.id, editedCustomer);
      } else {
        response = await customerService.createCustomer(editedCustomer);
      }
      
      if (response?.success) {
        showNotification(editedCustomer.id ? "Cập nhật khách hàng thành công" : "Thêm khách hàng thành công", 'success');
        setShowEditModal(false);
        setSelectedCustomer(null);
        setRefreshTrigger(prev => prev + 1);
      } else {
        showNotification(response?.message || "Không thể lưu thông tin khách hàng", 'error');
      }
    } catch (error) {
      showNotification("Không thể lưu thông tin khách hàng: " + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleDeleteClick = (customer) => {
    setSelectedCustomer(customer);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await customerService.deleteCustomer(selectedCustomer.id);
      if (response?.success) {
        showNotification("Xóa khách hàng thành công", 'success');
        setShowDeleteModal(false);
        setSelectedCustomer(null);
        setRefreshTrigger(prev => prev + 1);
      } else {
        showNotification(response?.message || "Không thể xóa khách hàng", 'error');
      }
    } catch (error) {
      showNotification("Không thể xóa khách hàng: " + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleImportData = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      const response = await customerService.importCustomers(formData);
      if (response?.success) {
        showNotification("Nhập dữ liệu thành công", 'success');
        setRefreshTrigger(prev => prev + 1);
      } else {
        showNotification(response?.message || "Không thể nhập dữ liệu", 'error');
      }
    } catch (error) {
      showNotification("Không thể nhập dữ liệu: " + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleExportData = async () => {
    try {
      const response = await customerService.exportCustomers();
      if (response?.success) {
        // Create a download link for the Excel file
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'customers.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        showNotification(response?.message || "Không thể xuất dữ liệu", 'error');
      }
    } catch (error) {
      showNotification("Không thể xuất dữ liệu: " + (error.response?.data?.message || error.message), 'error');
    }
  };

  const filteredCustomers = Array.isArray(customers) ? customers.filter((customer) => {
    if (!customer) return false;
    
    const matchesSearch = customer.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || customer.role?.name === roleFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "registered" && customer.isRegistered) ||
      (statusFilter === "unregistered" && !customer.isRegistered);
    
    let matchesDate = true;
    if (startDate && endDate && customer.createdAt) {
      const customerDate = new Date(customer.createdAt);
      const start = new Date(startDate);
      const end = new Date(endDate);
      matchesDate = customerDate >= start && customerDate <= end;
    }

    return matchesSearch && matchesRole && matchesStatus && matchesDate;
  }) : [];

  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  if (loading) {
    return <div className={styles.loading}>Đang tải...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton}>
          <ArrowLeft size={20} />
          Quay lại
        </button>
        <div className={styles.headerTitle}>
          <h1>Manager Customer</h1>
          <p>Quản lý thông tin và trạng thái khách hàng</p>
        </div>
        <div className={styles.headerActions}>
          <input
            type="file"
            id="importFile"
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
            onChange={handleImportData}
          />
          <button className={styles.actionButton} onClick={() => document.getElementById('importFile').click()}>
            <FileUp size={20} />
            Nhập dữ liệu
          </button>
          <button className={styles.actionButton} onClick={handleExportData}>
            <FileDown size={20} />
            Xuất dữ liệu
          </button>
          <button className={styles.primaryButton} onClick={handleAddCustomer}>
            <Plus size={20} />
            Thêm khách hàng
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBar}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm kiếm theo số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.filterGroup}>
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">Tất cả vai trò</option>
            <option value="Customer">Customer</option>
            <option value="Premium Customer">Premium Customer</option>
          </select>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="registered">Đã đăng ký</option>
            <option value="unregistered">Chưa đăng ký</option>
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((customer) => customer && (
              <tr key={customer.id}>
                <td className={styles.idCell}>{customer.id}</td>
                <td className={styles.nameCell}>
                  <div className={styles.avatar}>?</div>
                  <span>{customer.phone}</span>
                </td>
                <td>{customer.role?.name || "Customer"}</td>
                <td>
                  <span className={`${styles.status} ${styles[customer.isRegistered ? 'registered' : 'unregistered']}`}>
                    {customer.isRegistered ? "Đã đăng ký" : "Chưa đăng ký"}
                  </span>
                </td>
                <td>{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                <td>
                  <div className={styles.actions}>
                    <button onClick={() => handleViewDetails(customer)} title="Xem chi tiết">
                      <Eye size={18} />
                    </button>
                    <button onClick={() => handleEditClick(customer)} title="Chỉnh sửa">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => handleDeleteClick(customer)} title="Xóa">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Trước
        </button>
        <span className={styles.pageNumber}>{currentPage}</span>
        <button 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Sau
        </button>
      </div>

      {/* Modals */}
      {showDetailModal && selectedCustomer && (
        <CustomerDetail
          customer={selectedCustomer}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedCustomer(null);
          }}
        />
      )}

      {showEditModal && (
        <CustomerEdit
          customer={selectedCustomer}
          onSave={handleEditSave}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCustomer(null);
          }}
        />
      )}

      {showDeleteModal && selectedCustomer && (
        <DeleteConfirmation
          customer={selectedCustomer}
          onConfirm={handleDeleteConfirm}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedCustomer(null);
          }}
        />
      )}
    </div>
  );
};

export default CustomerList; 