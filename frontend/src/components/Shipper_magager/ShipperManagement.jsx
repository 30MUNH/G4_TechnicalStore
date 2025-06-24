import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch,
  faPlus,
  faChevronLeft,
  faChevronRight,
  faArrowLeft,
  faUpload,
  faDownload,
  faEye,
  faEdit,
  faTrash,
  faStar
} from '@fortawesome/free-solid-svg-icons';
import Modal from '../Modal/Modal';
import ShipperForm from '../ShipperForm/ShipperForm';
import styles from './ShipperManagement.module.css';


const vehicleTypes = [
  { value: '', label: 'Loại phương tiện' },
  { value: 'motorbike', label: 'Xe máy' },
  { value: 'car', label: 'Ô tô' },
  { value: 'truck', label: 'Xe tải' }
];

const statusOptions = [
  { value: '', label: 'Trạng thái' },
  { value: 'Active', label: 'Đi làm' },
  { value: 'Inactive', label: 'Nghỉ' }
];

function ShipperManagement() {
  const [shippers, setShippers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDateFrom, setStartDateFrom] = useState('');
  const [startDateTo, setStartDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [selectedShipper, setSelectedShipper] = useState(null);
  const [formData, setFormData] = useState({});

  const itemsPerPage = 5;


  const filteredShippers = shippers.filter(shipper => {
    const matchesSearch = !searchTerm || 
      shipper.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipper.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipper.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesVehicleType = !vehicleTypeFilter || shipper.vehicleType === vehicleTypeFilter;
    const matchesStatus = !statusFilter || shipper.status === statusFilter;
    
    const matchesDateRange = (!startDateFrom || shipper.startDate >= startDateFrom) &&
                            (!startDateTo || shipper.startDate <= startDateTo);

    return matchesSearch && matchesVehicleType && matchesStatus && matchesDateRange;
  });


  const totalPages = Math.ceil(filteredShippers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedShippers = filteredShippers.slice(startIndex, startIndex + itemsPerPage);

 
  const openModal = (mode, shipper) => {
    setModalMode(mode);
    setSelectedShipper(shipper || null);
    setFormData(shipper || {
      employeeId: '',
      fullname: '',
      licenseNumber: '',
      vehicleType: 'motorbike',
      vehiclePlate: '',
      status: 'Available',
      workingAreas: [],
      rating: 0,
      totalDeliveries: 0,
      isActive: true,
      startDate: new Date().toISOString().split('T')[0],
      phone: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedShipper(null);
    setFormData({});
  };

  const handleSave = () => {
    if (modalMode === 'add') {
      const newShipper = {
        ...formData,
        id: Date.now().toString(),
      };
      setShippers([...shippers, newShipper]);
    } else if (modalMode === 'edit' && selectedShipper) {
      setShippers(shippers.map(shipper => 
        shipper.id === selectedShipper.id ? { ...shipper, ...formData } : shipper
      ));
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa shipper này?')) {
      setShippers(shippers.filter(shipper => shipper.id !== id));
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

  const getVehicleTypeLabel = (type) => {
    const vehicleLabels = {
      'motorbike': 'Xe máy',
      'car': 'Ô tô', 
      'truck': 'Xe tải'
    };
    return vehicleLabels[type] || type;
  };

  const renderStars = (rating) => {
    return (
      <div className={styles.rating}>
        {[1, 2, 3, 4, 5].map((star) => (
          <FontAwesomeIcon
            key={star}
            icon={faStar}
            className={`${styles.star} ${star <= rating ? styles.starFilled : styles.starEmpty}`}
          />
        ))}
        <span className={styles.ratingText}>
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const getModalTitle = () => {
    switch (modalMode) {
      case 'view': return 'Thông tin shipper';
      case 'edit': return 'Chỉnh sửa shipper';
      case 'add': return 'Thêm shipper mới';
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
                <h1 className={styles.title}>Quản lý Shipper</h1>
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
                Thêm shipper
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
                placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className={styles.filterSelect}
              value={vehicleTypeFilter}
              onChange={(e) => setVehicleTypeFilter(e.target.value)}
            >
              {vehicleTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>

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

            <input
              type="date"
              className={styles.filterSelect}
              value={startDateTo}
              onChange={(e) => setStartDateTo(e.target.value)}
              placeholder="dd/mm/yyyy"
            />
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.tableHeaderCell}>MÃ NV</th>
                <th className={styles.tableHeaderCell}>TÊN TÀI KHOẢN</th>
                <th className={styles.tableHeaderCell}>PHƯƠNG TIỆN</th>
                <th className={styles.tableHeaderCell}>TRẠNG THÁI</th>
                <th className={styles.tableHeaderCell}>KHU VỰC</th>
                <th className={styles.tableHeaderCell}>ĐƠN GIAO</th>
                <th className={styles.tableHeaderCell}>ĐÁNH GIÁ</th>
                <th className={styles.tableHeaderCell}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {paginatedShippers.length > 0 ? (
                paginatedShippers.map((shipper) => (
                  <tr key={shipper.id} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      <div className={styles.employeeId}>{shipper.employeeId}</div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.shipperInfo}>
                        <div className={styles.shipperName}>{shipper.fullname}</div>
                        <div className={styles.shipperPhone}>{shipper.phone}</div>
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.vehicleInfo}>
                        <div className={styles.vehicleType}>{getVehicleTypeLabel(shipper.vehicleType)}</div>
                        <div className={styles.vehiclePlate}>{shipper.vehiclePlate}</div>
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      {getStatusBadge(shipper.status)}
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.workingAreas}>{shipper.workingAreas.join(', ')}</div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.deliveryCount}>{shipper.totalDeliveries}</div>
                    </td>
                    <td className={styles.tableCell}>
                      {renderStars(shipper.rating)}
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
                  <td colSpan={8} className={styles.emptyState}>
                    <div className={styles.emptyContent}>
                      <div className={styles.emptyIcon}>📦</div>
                      <h3 className={styles.emptyTitle}>Không có shipper nào</h3>
                      <p className={styles.emptyText}>
                        Chưa có shipper nào trong hệ thống hoặc không khớp với bộ lọc
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
        onClose={closeModal}
        title={getModalTitle()}
        size="large"
      >
        <ShipperForm
          formData={formData}
          mode={modalMode}
          onFormDataChange={setFormData}
          onSave={handleSave}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}

export default ShipperManagement; 