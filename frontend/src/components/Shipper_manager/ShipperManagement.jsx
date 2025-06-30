import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch,
  faPlus,
  faArrowLeft,
  faUpload,
  faDownload,
  faEye,
  faEdit,
  faTrash,
  faStar
} from '@fortawesome/free-solid-svg-icons';
import Modal from "./Modal";
import ShipperForm from "./ShipperForm";
import { shipperService } from '../../services/shipperService';
import styles from './ShipperManagement.module.css';


const statusOptions = [
  { value: '', label: 'Trạng thái' },
  { value: 'Active', label: 'Đã đăng ký' },
  { value: 'Inactive', label: 'Chưa đăng ký' }
];

function ShipperManagement() {
  const [shippers, setShippers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDateFrom, setStartDateFrom] = useState('');
  const [startDateTo, setStartDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [selectedShipper, setSelectedShipper] = useState(null);

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

  const itemsPerPage = 5;

  // Fetch shippers from API
  useEffect(() => {
    fetchShippers();
  }, []);

  const fetchShippers = async () => {
    try {
      setLoading(true);
      const response = await shipperService.getAllShippers();
      if (response.success && response.data) {
        setShippers(response.data);
        setError(null);
      } else {
        setError(response.message || 'Failed to fetch shippers');
        setShippers([]);
      }
    } catch (err) {
      setError('Failed to fetch shippers');
      console.error('Error fetching shippers:', err);
      setShippers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredShippers = Array.isArray(shippers) ? shippers.filter(shipper => {
    const matchesSearch = !searchTerm || 
      shipper.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipper.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipper.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || 
      (statusFilter === 'Active' && shipper.isRegistered) ||
      (statusFilter === 'Inactive' && !shipper.isRegistered);
    
    const matchesDateRange = (!startDateFrom || new Date(shipper.createdAt) >= new Date(startDateFrom)) &&
                            (!startDateTo || new Date(shipper.createdAt) <= new Date(startDateTo));

    return matchesSearch && matchesStatus && matchesDateRange;
  }) : [];


  const totalPages = Math.ceil(filteredShippers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedShippers = filteredShippers.slice(startIndex, startIndex + itemsPerPage);

 
  const openModal = (mode, shipper) => {
    setModalMode(mode);
    setSelectedShipper(shipper);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedShipper(null);
  };

  const handleSave = async (formData) => {
    try {
      let response;
      if (modalMode === 'add') {
        response = await shipperService.createShipper(formData);
      } else if (modalMode === 'edit' && selectedShipper) {
        response = await shipperService.updateShipper(selectedShipper.id, formData);
      }
      
      if (response?.success) {
        showNotification(modalMode === 'add' ? 'Tạo shipper thành công' : 'Cập nhật shipper thành công', 'success');
        closeModal();
        fetchShippers(); // Refresh the list
      } else {
        showNotification(response?.message || 'Thao tác thất bại', 'error');
      }
    } catch (error) {
      console.error('Error saving shipper:', error);
      showNotification('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa shipper này?')) {
      try {
        const response = await shipperService.deleteShipper(id);
        if (response?.success) {
          showNotification('Xóa shipper thành công', 'success');
          fetchShippers(); // Refresh the list
        } else {
          showNotification(response?.message || 'Xóa shipper thất bại', 'error');
        }
      } catch (error) {
        console.error('Error deleting shipper:', error);
        showNotification('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message), 'error');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
        'Active': { label: 'Đi làm', className: styles.statusActive },
        'Inactive': { label: 'Nghỉ', className: styles.statusInactive },
    };
    const config = statusConfig[status] || { label: status, className: styles.statusDefault };
    return (
      <span className={`${styles.statusBadge} ${config.className}`}>
        {config.label}
      </span>
    );
  };

  // Removed getVehicleTypeLabel as it's not needed for shipper account management

  // Removed renderStars function as rating is not applicable for shipper account management

  const getModalTitle = () => {
    switch (modalMode) {
      case 'view': return 'Thông tin Shipper';
      case 'edit': return 'Chỉnh sửa Shipper';
      case 'add': return 'Thêm Shipper mới';
      default: return '';
    }
  };

  return (
    <div className={styles.app}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.container}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <button className={styles.backButton}>
                <FontAwesomeIcon icon={faArrowLeft} className={styles.backIcon} />
                Quay lại
              </button>
              <div className={styles.titleSection}>
                <h1 className={styles.title}>Manager shipper</h1>
                <p className={styles.subtitle}>
                  Quản lý thông tin shipper và giao hàng
                </p>
              </div>
            </div>
            <div className={styles.headerActions}>
              <button className={`${styles.button} ${styles.headerButton}`}>
                <FontAwesomeIcon icon={faUpload} className={styles.buttonIcon} />
                Nhập dữ liệu
              </button>
              <button className={`${styles.button} ${styles.headerButton}`}>
                <FontAwesomeIcon icon={faDownload} className={styles.buttonIcon} />
                Xuất dữ liệu
              </button>
              <button 
                className={`${styles.button} ${styles.primaryButton}`}
                onClick={() => openModal('add')}
              >
                <FontAwesomeIcon icon={faPlus} className={styles.buttonIcon} />
                Thêm Shipper
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {/* Filters */}
        <div className={styles.filtersCard}>
          <div className={styles.filtersGrid}>
            <div className={styles.searchWrapper}>
              <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã , ..."
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Removed vehicle type filter as it's not applicable for shipper account management */}

            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>

            <input
              type="date"
              className={styles.filterSelect}
              value={startDateFrom}
              onChange={(e) => setStartDateFrom(e.target.value)}
              placeholder="dd/mm/yyyy"
            />

            
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.tableHeaderCell}>Username</th>
                <th className={styles.tableHeaderCell}>Họ và tên</th>
                <th className={styles.tableHeaderCell}>Số điện thoại</th>
                <th className={styles.tableHeaderCell}>Trạng thái</th>
                <th className={styles.tableHeaderCell}>Ngày tạo</th>
                <th className={styles.tableHeaderCell}>Thao tác</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {paginatedShippers.length > 0 ? (
                paginatedShippers.map((shipper) => (
                  <tr key={shipper.id} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      <div className={styles.username}>{shipper.username}</div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.shipperName}>{shipper.name || shipper.fullName}</div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.phone}>{shipper.phone}</div>
                    </td>
                    <td className={styles.tableCell}>
                      {getStatusBadge(shipper.isRegistered ? 'Active' : 'Inactive')}
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.createdAt}>
                        {new Date(shipper.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.actionButtons}>
                        <button
                          onClick={() => openModal('view', shipper)}
                          className={`${styles.actionButton} ${styles.viewButton}`}
                          title="Xem"
                        >
                          <FontAwesomeIcon icon={faEye} className={styles.actionIcon} />
                        </button>
                        <button
                          onClick={() => openModal('edit', shipper)}
                          className={`${styles.actionButton} ${styles.editButton}`}
                          title="Sửa"
                        >
                          <FontAwesomeIcon icon={faEdit} className={styles.actionIcon} />
                        </button>
                        <button
                          onClick={() => handleDelete(shipper.id)}
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          title="Xóa"
                        >
                          <FontAwesomeIcon icon={faTrash} className={styles.actionIcon} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>
                    <div className={styles.emptyContent}>
                      <div className={styles.emptyIcon}>👤</div>
                      <h3 className={styles.emptyTitle}>Không có shipper nào</h3>
                      <p className={styles.emptyText}>
                        {loading ? 'Đang tải...' : (error ? error : 'Chưa có shipper nào trong hệ thống hoặc không khớp với bộ lọc')}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav aria-label="Page navigation example" className={styles.paginationWrapper}>
            <ul className={styles.pagination}>
              <li className={`${styles.pageItem} ${currentPage === 1 ? styles.disabled : ''}`}>
                <a 
                  className={styles.pageLink} 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(prev => Math.max(prev - 1, 1));
                  }}
                >
                  Previous
                </a>
              </li>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <li key={page} className={`${styles.pageItem} ${currentPage === page ? styles.active : ''}`}>
                  <a 
                    className={styles.pageLink} 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(page);
                    }}
                  >
                    {page}
                  </a>
                </li>
              ))}
              
              <li className={`${styles.pageItem} ${currentPage === totalPages ? styles.disabled : ''}`}>
                <a 
                  className={styles.pageLink} 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(prev => Math.min(prev + 1, totalPages));
                  }}
                >
                  Next
                </a>
              </li>
            </ul>
          </nav>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        title={getModalTitle()}
        onClose={closeModal}
        size="large"
      >
        <ShipperForm
          mode={modalMode}
          initialData={selectedShipper}
          onSubmit={handleSave}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}

export default ShipperManagement; 