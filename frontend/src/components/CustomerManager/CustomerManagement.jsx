import React, { useState, useEffect } from 'react';
import { 
  Download, 
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
      
      if (response.success && response.data) {
        // Ensure response.data is an array
        const dataArray = Array.isArray(response.data) ? response.data : [];
        const customersData = dataArray.map(customer => ({
          id: customer.id,
          name: customer.fullName,
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
      console.error('Error fetching customers:', err);
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
      matchesDate = customerDate >= filterDate;
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
    return filteredCustomers.slice(startIndex, startIndex + itemsPerPage);
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
      console.error('Error saving customer:', error);
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
      console.error('Error deleting customer:', error);
      showNotification(error.message || 'An error occurred', 'error');
    }
  };

  // Import/Export operations
  const handleImportData = async (event) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);
      
      const response = await customerService.importCustomers(formData);
      
      if (response.success) {
        showNotification('Data imported successfully', 'success');
        await fetchCustomers(); // Refresh the list
      } else {
        throw new Error(response.message || 'Failed to import data');
      }
    } catch (error) {
      console.error('Import error:', error);
      showNotification(error.message || 'Failed to import data', 'error');
    }
    
    // Reset file input
    event.target.value = '';
  };

  const handleExportData = async () => {
    try {
      const response = await customerService.exportCustomers();
      
      if (response.success && response.data) {
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `customers_${new Date().toISOString().split('T')[0]}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        showNotification('Data exported successfully', 'success');
      } else {
        throw new Error('Failed to export data');
      }
    } catch (error) {
      console.error('Export error:', error);
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
            <input
              type="file"
              id="importFile"
              accept=".xlsx,.xls"
              className={styles.hiddenInput}
              onChange={handleImportData}
            />
            <button 
              className={`${styles.actionButton} ${styles.importButton}`}
              onClick={() => document.getElementById('importFile')?.click()}
            >
              <Download size={18} />
              <span>Import Data</span>
            </button>
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
const CustomerDetail = ({ customer }) => (
  <div className={styles.customerDetail}>
    <div className={styles.customerHeader}>
      <div className={styles.customerAvatar}>
        {customer.name.charAt(0)}
      </div>
      <div className={styles.customerHeaderInfo}>
        <h3 className={styles.customerHeaderName}>{customer.name}</h3>
        <span className={`${styles.status} ${customer.status === 'Active' ? styles.statusActive : styles.statusInactive}`}>
          {customer.status === 'Active' ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>

    <div className={styles.customerDetailGrid}>
      <div className={styles.detailField}>
        <div className={styles.detailLabel}>
          <User size={16} />
          <span>Username</span>
        </div>
        <div className={styles.detailValue}>{customer.username}</div>
      </div>
      
      <div className={styles.detailField}>
        <div className={styles.detailLabel}>
          <Phone size={16} />
          <span>Phone Number</span>
        </div>
        <div className={styles.detailValue}>{customer.phone}</div>
      </div>
      
      <div className={styles.detailField}>
        <div className={styles.detailLabel}>
          <Calendar size={16} />
          <span>Created Date</span>
        </div>
        <div className={styles.detailValue}>
          {new Date(customer.createdAt).toLocaleDateString('en-US')}
        </div>
      </div>
      
      <div className={styles.detailField}>
        <span className={styles.detailLabel}>Registration Status</span>
        <div>
          <span className={`${styles.status} ${customer.isRegistered ? styles.statusActive : styles.statusInactive}`}>
            {customer.isRegistered ? 'Registered' : 'Not Registered'}
          </span>
        </div>
      </div>
    </div>
  </div>
);

// Customer Form Component
const CustomerForm = ({ mode, initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    username: initialData?.username || '',
    phone: initialData?.phone || '',
    status: initialData?.status || 'Active',
    password: ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (formData.name.length > 50) {
      newErrors.name = 'Name must not exceed 50 characters';
    }

    if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10-11 digits';
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
            disabled={isViewMode}
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
          <label className={styles.label}>Status *</label>
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