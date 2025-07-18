import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Plus, 
  X,
  Save,
  User,
  Phone,
  Calendar,
  Trash2
} from 'lucide-react';

import CustomerTable from './CustomerTable';
import FilterBar from './FilterBar';
import styles from './CustomerManagement.module.css';
import { customerService } from '../../services/customerService';
import { formatDate, formatDateForFilename } from '../../utils/dateFormatter';

const CustomerManagement = () => {
  // State management
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createdDateFilter, setCreatedDateFilter] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'add'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const itemsPerPage = 10;

  // Notification function
  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `${styles.notification} ${styles[`notification${type.charAt(0).toUpperCase() + type.slice(1)}`]}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  };

  // Fetch customers from API
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await customerService.getAllCustomers();
      
      if (response.success && response.data.data) {
        // Backend returns nested structure: { success: true, data: { data: customers } }
        // Updated based on actual API response structure
        const rawData = response.data.data;
        
        // Ensure data is an array
        const dataArray = Array.isArray(rawData) ? rawData : [];
        
        const customersData = dataArray.map(customer => ({
          id: customer.id,
          name: customer.name || 'N/A',
          username: customer.username,
          phone: customer.phone,
          status: customer.isRegistered ? 'Active' : 'Suspended',
          createdAt: customer.createdAt,
          isRegistered: customer.isRegistered,
          customerOrders: customer.customerOrders || []
        }));
        
        setCustomers(customersData);
        setTotalCustomers(customersData.length);
        setTotalPages(Math.ceil(customersData.length / itemsPerPage));
      } else {
        throw new Error(response.message || 'Failed to fetch customers');
      }
    } catch (err) {
      setError('Failed to fetch customers');
      showNotification('Failed to load customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter customers
  const filteredCustomers = customers.filter((customer) => {
    if (!customer) return false;
    
    const matchesSearch = customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && customer.status === 'Active') ||
      (statusFilter === "inactive" && customer.status === 'Suspended');
    
    let matchesDate = true;
    if (createdDateFilter && customer.createdAt) {
      const customerDate = new Date(customer.createdAt);
      const filterDate = new Date(createdDateFilter);
      
      // Compare only the date part (ignore time)
      const customerDateOnly = new Date(customerDate.getFullYear(), customerDate.getMonth(), customerDate.getDate());
      const filterDateOnly = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate());
      
      matchesDate = customerDateOnly.getTime() === filterDateOnly.getTime();
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Update pagination when filtered customers change
  useEffect(() => {
    const newTotalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    setTotalPages(newTotalPages);
    
    // Reset to page 1 if current page is beyond new total
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredCustomers, currentPage]);

  // Get current page customers
  const getCurrentPageCustomers = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentPageData = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);
    return currentPageData;
  };

  // Modal operations
  const openModal = (mode, customer = null) => {
    setModalMode(mode);
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCustomer(null);
  };

  // CRUD operations
  const handleSave = async (formData) => {
    try {
      if (modalMode === 'add') {
        const createData = {
          username: formData.username,
          password: formData.password || '12345678', // Default password
          fullName: formData.name,
          phone: formData.phone
        };
        
        const response = await customerService.createCustomer(createData);
        
        if (response.success) {
          showNotification('Customer added successfully', 'success');
          await fetchCustomers(); // Refresh the list
        } else {
          throw new Error(response.message || 'Failed to create customer');
        }
      } else if (modalMode === 'edit' && selectedCustomer) {
        const updateData = {
          username: formData.username,
          fullName: formData.name,
          phone: formData.phone
        };
        
        const response = await customerService.updateCustomer(selectedCustomer.id, updateData);
        
        if (response.success) {
          showNotification('Customer updated successfully', 'success');
          await fetchCustomers(); // Refresh the list
        } else {
          throw new Error(response.message || 'Failed to update customer');
        }
      }
      closeModal();
    } catch (error) {
      showNotification(error.message || 'An error occurred', 'error');
    }
  };

  const handleDelete = async (id) => {
    const customer = customers.find(c => c.id === id);
    setSelectedCustomer(customer);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCustomer) return;
    
    try {
      const response = await customerService.deleteCustomer(selectedCustomer.id);
      
      if (response.success) {
        showNotification('Customer deleted successfully', 'success');
        await fetchCustomers(); // Refresh the list
      } else {
        throw new Error(response.message || 'Failed to delete customer');
      }
      
      setShowDeleteModal(false);
      setSelectedCustomer(null);
    } catch (error) {
      showNotification(error.message || 'An error occurred', 'error');
    }
  };

  // Export operation
  const handleExportData = async () => {
    try {
      const response = await customerService.exportCustomers();
      
      if (response.success && response.data) {
        // Create download link with proper Excel MIME type
        const url = window.URL.createObjectURL(new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `customers_${formatDateForFilename()}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        showNotification('Data exported successfully', 'success');
      } else {
        throw new Error('Failed to export data');
      }
    } catch (error) {
      showNotification('Failed to export data', 'error');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingContent}>
            <div className={styles.loadingText}>Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <div className={styles.errorText}>{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>Customer Management</h1>
            <p className={styles.description}>Manage customer information and status</p>
          </div>
          
          <div className={styles.headerActions}>
            <button 
              className={`${styles.actionButton} ${styles.exportButton}`}
              onClick={handleExportData}
            >
              <Upload size={18} />
              <span>Export Data</span>
            </button>
            <button 
              className={`${styles.actionButton} ${styles.addButton}`}
              onClick={() => openModal('add')}
            >
              <Plus size={18} />
              <span>Add Customer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        createdDateFilter={createdDateFilter}
        onSearchChange={setSearchTerm}
        onStatusChange={setStatusFilter}
        onDateChange={setCreatedDateFilter}
      />

      {/* Customer Table */}
      <CustomerTable
        customers={getCurrentPageCustomers()}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCustomers={filteredCustomers.length}
        itemsPerPage={itemsPerPage}
        onView={(customer) => openModal('view', customer)}
        onEdit={(customer) => openModal('edit', customer)}
        onDelete={handleDelete}
        onPageChange={setCurrentPage}
      />

      {/* Modals */}
      {showModal && (
        <Modal
          isOpen={showModal}
          title={getModalTitle()}
          onClose={closeModal}
        >
          {modalMode === 'view' && selectedCustomer ? (
            <CustomerDetail customer={selectedCustomer} />
          ) : (
            <CustomerForm
              mode={modalMode}
              initialData={selectedCustomer}
              onSubmit={handleSave}
              onCancel={closeModal}
            />
          )}
        </Modal>
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

  // Helper function for modal title
  function getModalTitle() {
    switch (modalMode) {
      case 'view': return 'Customer Details';
      case 'edit': return 'Edit Customer';
      case 'add': return 'Add New Customer';
      default: return '';
    }
  }
};

// Modal Component
const Modal = ({ isOpen, title, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Customer Detail Component  
const CustomerDetail = ({ customer }) => {
  // Calculate order statistics with both English and Vietnamese status support
  const orders = customer.customerOrders || [];
  const totalOrders = orders.length;
  
  // Support both English and Vietnamese status values
      const completedStatuses = ['DELIVERED', 'COMPLETED'];
    const activeStatuses = ['PENDING', 'SHIPPING', 'DELIVERED'];
      const cancelledStatuses = ['CANCELLED', 'CANCELLED'];
  
  const completedOrders = orders.filter(order => 
    completedStatuses.includes(order.status)
  ).length;
  
  const activeOrders = orders.filter(order => 
    activeStatuses.includes(order.status)
  ).length;
  
  const cancelledOrders = orders.filter(order => 
    cancelledStatuses.includes(order.status)
  ).length;
  
  const totalSpent = orders
    .filter(order => completedStatuses.includes(order.status))
    .reduce((sum, order) => sum + (parseFloat(order.totalAmount) || 0), 0);

  // Format currency properly
  const formatCurrency = (amount) => {
    if (amount === 0) return '0 ₫';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
  };



  return (
    <div className={styles.customerDetail}>
      {/* Customer Header */}
      <div className={styles.customerHeader}>
        <div className={styles.customerAvatar}>
          {customer.name ? customer.name.charAt(0).toUpperCase() : 'N'}
        </div>
        <div className={styles.customerHeaderInfo}>
          <h3 className={styles.customerHeaderName}>{customer.name || 'N/A'}</h3>
          <span className={`${styles.status} ${customer.status === 'Active' ? styles.statusActive : styles.statusInactive}`}>
            {customer.status === 'Active' ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className={styles.detailContainer}>
        {/* Basic Information Section */}
        <div className={styles.detailSection}>
          <h4 className={styles.detailSectionTitle}>
            <User size={18} />
            Basic Information
          </h4>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Username</span>
              <span className={styles.infoValue}>{customer.username || 'N/A'}</span>
            </div>
            
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Phone Number</span>
              <span className={styles.infoValue}>{customer.phone || 'N/A'}</span>
            </div>
            
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Member Since</span>
              <span className={styles.infoValue}>{formatDate(customer.createdAt)}</span>
            </div>
            
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Registration Status</span>
              <span className={`${styles.statusCompact} ${customer.isRegistered ? styles.statusActive : styles.statusInactive}`}>
                {customer.isRegistered ? 'Registered' : 'Not Registered'}
              </span>
            </div>
          </div>
        </div>

        {/* Order Statistics Section */}
        <div className={styles.detailSection}>
          <h4 className={styles.detailSectionTitle}>
            <Calendar size={18} />
            Order Statistics
          </h4>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{totalOrders}</div>
              <div className={styles.statLabel}>Total Orders</div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{completedOrders}</div>
              <div className={styles.statLabel}>Completed</div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{activeOrders}</div>
              <div className={styles.statLabel}>Active</div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{cancelledOrders}</div>
              <div className={styles.statLabel}>Cancelled</div>
            </div>
          </div>
          
          <div className={styles.summarySection}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Total Spent:</span>
              <span className={styles.summaryValue}>{formatCurrency(totalSpent)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Customer Form Component
const CustomerForm = ({ mode, initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    username: initialData?.username || '',
    phone: initialData?.phone || '',
    isRegistered: initialData?.isRegistered || false,
    status: initialData?.status || 'Active',
    password: ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must not exceed 100 characters';
    }

    if (!formData.username || formData.username.trim().length === 0) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.phone || formData.phone.trim().length === 0) {
      newErrors.phone = 'Phone number is required';
    } else {
      // Support both formats: 0xxxxxxxxx or +84xxxxxxxxx
      const phoneRegex = /^(0\d{9}|\+84\d{9})$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Phone format: 0xxxxxxxxx or +84xxxxxxxxx';
      }
    }

    if (mode === 'add' && (!formData.password || formData.password.length < 8)) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const isViewMode = mode === 'view';

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label className={styles.label}>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isViewMode}
              required
              className={`${styles.input} ${errors.name ? styles.errorInput : ''}`}
            />
            {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
          </div>
          
          <div className={styles.formField}>
            <label className={styles.label}>Username *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={isViewMode || mode === 'edit'}
              required
              className={`${styles.input} ${errors.username ? styles.errorInput : ''}`}
            />
            {errors.username && <span className={styles.errorMessage}>{errors.username}</span>}
          </div>
          
          <div className={styles.formField}>
            <label className={styles.label}>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={isViewMode}
              required
              className={`${styles.input} ${errors.phone ? styles.errorInput : ''}`}
            />
            {errors.phone && <span className={styles.errorMessage}>{errors.phone}</span>}
          </div>

          <div className={styles.formField}>
            <label className={styles.label}>Registration Status</label>
            <select
              name="isRegistered"
              value={formData.isRegistered.toString()}
              onChange={(e) => handleChange({
                target: { name: 'isRegistered', value: e.target.value === 'true' }
              })}
              disabled={isViewMode}
              className={styles.select}
            >
              <option value="true">Registered</option>
              <option value="false">Not Registered</option>
            </select>
          </div>

          <div className={styles.formField}>
            <label className={styles.label}>Account Status *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={isViewMode}
              required
              className={styles.select}
            >
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          {mode === 'add' && (
            <div className={styles.formField}>
              <label className={styles.label}>Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`${styles.input} ${errors.password ? styles.errorInput : ''}`}
              />
              {errors.password && <span className={styles.errorMessage}>{errors.password}</span>}
            </div>
          )}
        </div>

        {!isViewMode && (
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onCancel}
              className={`${styles.formButton} ${styles.cancelFormButton}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.formButton} ${styles.saveButton}`}
            >
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

// Delete Confirmation Component
const DeleteConfirmation = ({ customer, onConfirm, onClose }) => (
  <div className={styles.deleteModalOverlay}>
    <div className={styles.deleteModalContent}>
      <div className={styles.deleteModalBody}>
        <div className={styles.deleteIcon}>
          <Trash2 size={24} color="#dc2626" />
        </div>
        <h3 className={styles.deleteTitle}>Confirm Delete</h3>
        <p className={styles.deleteMessage}>
          Are you sure you want to delete customer "{customer.name}"? This action cannot be undone.
        </p>
        <div className={styles.deleteActions}>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={onConfirm} className={styles.confirmDeleteButton}>
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default CustomerManagement; 