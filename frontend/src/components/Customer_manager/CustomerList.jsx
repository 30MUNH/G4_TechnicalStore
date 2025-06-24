import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Download,
  Upload,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Users
} from 'lucide-react';
import CustomerDetail from './CustomerDetail';
import CustomerEdit from './CustomerEdit';
import DeleteConfirmation from './DeleteConfirmation';
import styles from './styles/CustomerList.module.css';
import commonStyles from './styles/common.module.css';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    customerType: '',
    dateFrom: '',
    dateTo: ''
  });

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = 
        customer.firstName.toLowerCase().includes(searchTerm) ||
        customer.lastName.toLowerCase().includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm) ||
        customer.phone.includes(searchTerm);
      
      const matchesStatus = !filters.status || customer.status === filters.status;
      const matchesType = !filters.customerType || customer.customerType === filters.customerType;

      const customerDate = new Date(customer.dateJoined);
      const matchesDateFrom = !filters.dateFrom || customerDate >= new Date(filters.dateFrom);
      const matchesDateTo = !filters.dateTo || customerDate <= new Date(filters.dateTo);

      return matchesSearch && matchesStatus && matchesType && matchesDateFrom && matchesDateTo;
    });
  }, [customers, filters]);

  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCustomers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const handleViewDetail = (customer) => {
    setSelectedCustomer(customer);
    setShowDetail(true);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setShowEdit(true);
  };

  const handleDelete = (customer) => {
    setDeletingCustomer(customer);
    setShowDelete(true);
  };

  const handleSaveCustomer = (updatedCustomer) => {
    if (updatedCustomer.id) {
      setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    } else {
      const newCustomer = {
        ...updatedCustomer,
        id: String(customers.length + 1),
        dateJoined: new Date().toISOString().split('T')[0],
        totalOrders: 0,
        totalSpent: 0
      };
      setCustomers(prev => [...prev, newCustomer]);
    }
    setShowEdit(false);
    setEditingCustomer(null);
    setShowAddCustomer(false);
  };

  const handleDeleteCustomer = (customerId) => {
    setCustomers(prev => prev.filter(c => c.id !== customerId));
    setShowDelete(false);
    setDeletingCustomer(null);
  };

  const handleAddCustomer = () => {
    setEditingCustomer({
      id: null,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      status: 'Active',
      customerType: 'Component Purchase'
    });
    setShowAddCustomer(true);
    setShowEdit(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className={commonStyles.container}>
      <div className={commonStyles.header}>
        <div className={commonStyles.headerContent}>
          <div className={commonStyles.headerTop}>
            <button className={commonStyles.buttonSecondary}>
              <ArrowLeft className={commonStyles.icon} />
              Quay lại
            </button>
            <div className={commonStyles.headerTitle}>
              <h1 className={commonStyles.title}>Quản lý khách hàng</h1>
              <p className={commonStyles.subtitle}>Quản lý thông tin khách hàng và đơn hàng</p>
            </div>
            <div className={commonStyles.headerActions}>
              <button className={commonStyles.buttonSecondary}>
                <Upload className={commonStyles.icon} />
                Nhập dữ liệu
              </button>
              <button className={commonStyles.buttonSecondary}>
                <Download className={commonStyles.icon} />
                Xuất dữ liệu
              </button>
              <button className={commonStyles.buttonPrimary} onClick={handleAddCustomer}>
                <Plus className={commonStyles.icon} />
                Thêm khách hàng
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={commonStyles.headerContent}>
        <div className={styles.searchContainer}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              className={styles.searchInput}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <div className={styles.filterContainer}>
            <select
              className={commonStyles.select}
              value={filters.customerType}
              onChange={(e) => setFilters(prev => ({ ...prev, customerType: e.target.value }))}
            >
              <option value="">Loại khách hàng</option>
              <option value="PC Build">Người build PC</option>
              <option value="Component Purchase">Người mua linh kiện</option>
            </select>
            <select
              className={commonStyles.select}
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">Trạng thái</option>
              <option value="Active">Đang hoạt động</option>
              <option value="Inactive">Không hoạt động</option>
            </select>
            <div className={styles.dateFilter}>
              <input
                type="date"
                className={commonStyles.select}
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                placeholder="Từ ngày"
              />
              <input
                type="date"
                className={commonStyles.select}
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                placeholder="Đến ngày"
              />
            </div>
          </div>
        </div>

        <div className={styles.table}>
          <table className="w-full">
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.tableHeaderCell} style={{width: 'auto'}}>Khách hàng</th>
                <th className={styles.tableHeaderCell} style={{width: 'auto'}}>Loại</th>
                <th className={styles.tableHeaderCell} style={{width: 'auto'}}>Trạng thái</th>
                <th className={styles.tableHeaderCell} style={{width: '8%'}}>Đơn hàng</th>
                <th className={styles.tableHeaderCell} style={{width: '10%'}}>Tổng chi tiêu</th>
                <th className={styles.tableHeaderCell} style={{width: '10%'}}>Đơn hàng cuối</th>
                <th className={styles.tableHeaderCell} style={{width: '5%'}}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCustomers.length > 0 ? (
                paginatedCustomers.map((customer) => (
                  <tr key={customer.id} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      <div className={styles.customerNameWrapper}>
                        <div className={styles.customerAvatar}>
                          {customer.firstName[0]}{customer.lastName[0]}
                        </div>
                        <div className={styles.customerInfo}>
                          <div className={styles.customerName}>
                            {customer.firstName} {customer.lastName}
                          </div>
                          <div className={styles.customerDate}>
                            Tham gia: {new Date(customer.dateJoined).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <span className={`${commonStyles.badgeType} ${
                        customer.customerType === 'PC Build' 
                          ? commonStyles.badgeTypeBuild 
                          : commonStyles.badgeTypeComponent
                      }`}>
                        {customer.customerType === 'PC Build' ? 'Người build PC' : 'Người mua linh kiện'}
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      <span className={customer.status === 'Active' ? commonStyles.badgeSuccess : commonStyles.badgeInactive}>
                        {customer.status === 'Active' ? 'Đang hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td className={styles.tableCell}>{customer.totalOrders} đơn hàng</td>
                    <td className={styles.tableCell}>{formatCurrency(customer.totalSpent)}</td>
                    <td className={styles.tableCell}>
                      {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString('vi-VN') : 'Chưa có'}
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.actionButtons}>
                        <button
                          onClick={() => handleViewDetail(customer)}
                          className={styles.actionButton}
                          title="Xem chi tiết"
                        >
                          <Eye className={styles.actionIcon} />
                        </button>
                        <button
                          onClick={() => handleEdit(customer)}
                          className={styles.actionButton}
                          title="Chỉnh sửa"
                        >
                          <Edit3 className={styles.actionIcon} />
                        </button>
                        <button
                          onClick={() => handleDelete(customer)}
                          className={styles.actionButton}
                          title="Xóa"
                        >
                          <Trash2 className={styles.actionIcon} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>
                    <div className={styles.emptyContent}>
                      <div className={styles.emptyIcon}>
                        <Users size={48} />
                      </div>
                      <h3 className={styles.emptyTitle}>
                        {customers.length === 0 ? 'Chưa có khách hàng nào' : 'Không tìm thấy khách hàng phù hợp'}
                      </h3>
                      <p className={styles.emptyText}>
                        {customers.length === 0 
                          ? 'Chưa có khách hàng nào trong hệ thống hoặc không khớp với bộ lọc' 
                          : 'Thử điều chỉnh bộ lọc hoặc tìm kiếm để xem kết quả khác'}
                      </p>
                      {customers.length === 0 && (
                        <button 
                          onClick={handleAddCustomer}
                          className={commonStyles.buttonPrimary}
                          style={{ marginTop: '16px' }}
                        >
                          <Plus className={commonStyles.icon} />
                          Thêm khách hàng đầu tiên
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length > 0 && (
          <div className={styles.pagination}>
            <div className={styles.paginationButtons}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={styles.paginationButton}
              >
                <ChevronLeft className={styles.actionIcon} />
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`${styles.pageNumber} ${currentPage === page ? styles.pageNumberActive : ''}`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={styles.paginationButton}
              >
                Sau
                <ChevronRight className={styles.actionIcon} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showDetail && (
        <CustomerDetail
          customer={selectedCustomer}
          onClose={() => {
            setShowDetail(false);
            setSelectedCustomer(null);
          }}
          onEdit={(customer) => {
            setEditingCustomer(customer);
            setShowEdit(true);
            setShowDetail(false);
          }}
        />
      )}

      {showEdit && (
        <CustomerEdit
          customer={editingCustomer}
          onClose={() => {
            setShowEdit(false);
            setEditingCustomer(null);
            if (showAddCustomer) {
              setShowAddCustomer(false);
            }
          }}
          onSave={handleSaveCustomer}
        />
      )}

      {showDelete && (
        <DeleteConfirmation
          customer={deletingCustomer}
          onClose={() => {
            setShowDelete(false);
            setDeletingCustomer(null);
          }}
          onConfirm={() => handleDeleteCustomer(deletingCustomer.id)}
        />
      )}
    </div>
  );
};

export default CustomerList; 