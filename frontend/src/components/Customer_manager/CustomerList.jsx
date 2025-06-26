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
  Bell
} from 'lucide-react';
import CustomerDetail from './CustomerDetail';
import CustomerEdit from './CustomerEdit';
import DeleteConfirmation from './DeleteConfirmation';
import styles from '../styles/CustomerList.module.css';
import commonStyles from '../styles/common.module.css';

const CustomerList = () => {

  const [currentUserRole] = useState('manager'); 
  
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
    role: '',
    dateFrom: '',
    dateTo: ''
  });

  // Định nghĩa quyền hạn theo vai trò
  const permissions = {
    user: {
      canView: true,
      canEdit: false,
      canDelete: false,
      canAdd: false,
      canExport: false,
      canImport: false,
      canManageStaff: false
    },
    staff: {
      canView: true,
      canEdit: true,
      canDelete: false,
      canAdd: true,
      canExport: false,
      canImport: false,
      canManageStaff: false
    },
    manager: {
      canView: true,
      canEdit: true,
      canDelete: true,
      canAdd: true,
      canExport: true,
      canImport: true,
      canManageStaff: true,
      canViewReports: true,
      canApproveRequests: true
    },
    admin: {
      canView: true,
      canEdit: true,
      canDelete: true,
      canAdd: true,
      canExport: true,
      canImport: true,
      canManageStaff: true,
      canViewReports: true,
      canApproveRequests: true,
      canManageRoles: true
    },
    shipper: {
      canView: true,
      canEdit: false,
      canDelete: false,
      canAdd: false,
      canExport: false,
      canImport: false,
      canManageStaff: false
    }
  };

  const currentUserPermissions = permissions[currentUserRole] || permissions.user;

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = 
        customer.firstName.toLowerCase().includes(searchTerm) ||
        customer.lastName.toLowerCase().includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm) ||
        customer.phone.includes(searchTerm);
      
      const matchesStatus = !filters.status || customer.status === filters.status;
      const matchesRole = !filters.role || customer.role === filters.role;

      const customerDate = new Date(customer.dateJoined);
      const matchesDateFrom = !filters.dateFrom || customerDate >= new Date(filters.dateFrom);
      const matchesDateTo = !filters.dateTo || customerDate <= new Date(filters.dateTo);

      return matchesSearch && matchesStatus && matchesRole && matchesDateFrom && matchesDateTo;
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
    if (!currentUserPermissions.canEdit) {
      alert('Bạn không có quyền chỉnh sửa khách hàng');
      return;
    }
    setEditingCustomer(customer);
    setShowEdit(true);
  };

  const handleDelete = (customer) => {
    if (!currentUserPermissions.canDelete) {
      alert('Bạn không có quyền xóa khách hàng');
      return;
    }
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
    if (!currentUserPermissions.canAdd) {
      alert('Bạn không có quyền thêm khách hàng mới');
      return;
    }
    setEditingCustomer({
      id: null,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      status: 'Active',
      role: 'user'
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
              {currentUserPermissions.canViewReports && (
                <button className={commonStyles.buttonSecondary}>
                  <Bell className={commonStyles.icon} />
                  Báo cáo
                </button>
              )}
              {currentUserPermissions.canImport && (
                <button className={commonStyles.buttonSecondary}>
                  <Upload className={commonStyles.icon} />
                  Nhập dữ liệu
                </button>
              )}
              {currentUserPermissions.canExport && (
                <button className={commonStyles.buttonSecondary}>
                  <Download className={commonStyles.icon} />
                  Xuất dữ liệu
                </button>
              )}
              {currentUserPermissions.canAdd && (
                <button className={commonStyles.buttonPrimary} onClick={handleAddCustomer}>
                  <Plus className={commonStyles.icon} />
                  Tạo hồ sơ KH
                </button>
              )}
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
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
            >
              <option value="">Vai trò</option>
              <option value="user">User</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="shipper">Shipper</option>
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
                <th className={styles.tableHeaderCell} style={{width: 'auto'}}>Vai trò</th>
                <th className={styles.tableHeaderCell} style={{width: 'auto'}}>Trạng thái</th>
                <th className={styles.tableHeaderCell} style={{width: '8%'}}>Đơn hàng</th>
                <th className={styles.tableHeaderCell} style={{width: '10%'}}>Tổng chi tiêu</th>
                <th className={styles.tableHeaderCell} style={{width: '10%'}}>Đơn hàng cuối</th>
                <th className={styles.tableHeaderCell} style={{width: '5%'}}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCustomers.map((customer) => (
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
                      customer.role === 'admin' || customer.role === 'manager'
                        ? commonStyles.badgeTypeBuild 
                        : commonStyles.badgeTypeComponent
                    }`}>
                      {customer.role === 'user' ? 'User' :
                       customer.role === 'staff' ? 'Staff' :
                       customer.role === 'admin' ? 'Admin' :
                       customer.role === 'manager' ? 'Manager' :
                       customer.role === 'shipper' ? 'Shipper' : customer.role}
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
                      {currentUserPermissions.canView && (
                        <button
                          onClick={() => handleViewDetail(customer)}
                          className={styles.actionButton}
                          title="Xem chi tiết"
                        >
                          <Eye className={styles.actionIcon} />
                        </button>
                      )}
                      {currentUserPermissions.canEdit && (
                        <button
                          onClick={() => handleEdit(customer)}
                          className={styles.actionButton}
                          title="Chỉnh sửa"
                        >
                          <Edit3 className={styles.actionIcon} />
                        </button>
                      )}
                      {currentUserPermissions.canDelete && (
                        <button
                          onClick={() => handleDelete(customer)}
                          className={styles.actionButton}
                          title="Xóa"
                        >
                          <Trash2 className={styles.actionIcon} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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