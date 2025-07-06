import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Upload, 
  Plus, 
  X,
  Save
} from 'lucide-react';

import ShipperCard from './ShipperCard';
import FilterBar from './FilterBar';
import styles from './ShipperManagement.module.css';
import { shipperService } from '../../services/shipperService';

const ShipperManagement = () => {
  // State management
  const [shippers, setShippers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalShippers, setTotalShippers] = useState(0);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createdDateFilter, setCreatedDateFilter] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'add'
  const [selectedShipper, setSelectedShipper] = useState(null);

  const itemsPerPage = 5;

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

  // Mock areas and calculate orders/rating for demo
  const mockAreas = ['Downtown', 'Midtown', 'Brooklyn', 'Queens', 'Bronx'];
  const mockVehicles = ['Motorcycle', 'Small Truck'];

  // Fetch shippers from API
  const fetchShippers = async () => {
    try {
      console.log('🚀 [ShipperManagement] Starting fetchShippers');
      setLoading(true);
      setError(null);
      
      const response = await shipperService.getAllShippers();
      console.log('📨 [ShipperManagement] API Response:', response);
      
      if (response.success) {
        // Handle nested response structure: response.data.data or response.data
        const rawData = response.data?.data || response.data;
        console.log('📊 [ShipperManagement] Raw data extracted:', rawData);
        
        // Ensure rawData is an array
        const dataArray = Array.isArray(rawData) ? rawData : [];
        console.log('📋 [ShipperManagement] Data array:', dataArray);
        
        const shippersData = dataArray.map(shipper => {
          console.log('🔍 [ShipperManagement] Processing shipper:', shipper);
          
          // Calculate real statistics from orders
          const totalOrders = shipper.shipperOrders?.length || 0;
          const deliveredOrders = shipper.shipperOrders?.filter(order => order.status === 'Đã giao').length || 0;
          const activeOrders = shipper.shipperOrders?.filter(order => ['Đang giao', 'Đang xử lý'].includes(order.status)).length || 0;
          const cancelledOrders = shipper.shipperOrders?.filter(order => order.status === 'Đã hủy').length || 0;
          
          // Calculate performance metrics
          const deliveryRate = totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(1) : '0';
          
          // Calculate rating from feedback if available, otherwise from delivery performance
          let rating = '5.0'; // Default rating for new shippers
          if (shipper.feedbacks && shipper.feedbacks.length > 0) {
            // Calculate average rating from feedbacks (if feedback system is implemented)
            const avgRating = shipper.feedbacks.reduce((sum, feedback) => sum + (feedback.rating || 0), 0) / shipper.feedbacks.length;
            rating = avgRating.toFixed(1);
          } else if (totalOrders > 0) {
            // Fallback: Calculate rating from delivery success rate (0-5 scale)
            const successRate = deliveredOrders / totalOrders;
            rating = (successRate * 5).toFixed(1);
          }
          
          return {
            id: shipper.id,
            name: shipper.name || 'N/A',
            username: shipper.username || 'N/A',
            phone: shipper.phone || 'N/A',
            
            // Real data from database
            totalOrders,
            deliveredOrders,
            activeOrders,
            cancelledOrders,
            deliveryRate,
            rating,
            
            // Status from database
            status: shipper.isRegistered ? 'Active' : 'Suspended',
            isRegistered: shipper.isRegistered,
            
            // Real timestamps
            createdAt: shipper.createdAt,
            updatedAt: shipper.updatedAt,
            
            // Keep original order data for reference
            shipperOrders: shipper.shipperOrders || [],
            feedbacks: shipper.feedbacks || []
          };
        });
        
        console.log('✅ [ShipperManagement] Mapped shippers data:', shippersData);
        
        setShippers(shippersData);
        setTotalShippers(shippersData.length);
        setTotalPages(Math.ceil(shippersData.length / itemsPerPage));
      } else {
        throw new Error(response.message || 'Failed to fetch shippers');
      }
    } catch (err) {
      console.error('💥 [ShipperManagement] Error fetching shippers:', err);
      setError('Failed to fetch shippers');
      showNotification('Failed to load shippers', 'error');
    } finally {
      setLoading(false);
      console.log('🏁 [ShipperManagement] fetchShippers completed');
    }
  };

  useEffect(() => {
    fetchShippers();
  }, []);

  // Filter shippers
  const filteredShippers = shippers.filter((shipper) => {
    if (!shipper) return false;
    
    const matchesSearch = shipper.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipper.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipper.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && shipper.isRegistered) ||
      (statusFilter === 'inactive' && !shipper.isRegistered);
    
    let matchesDate = true;
    if (createdDateFilter && shipper.createdAt) {
      const shipperDate = new Date(shipper.createdAt);
      const filterDate = new Date(createdDateFilter);
      
      // Compare only the date part (ignore time)
      const shipperDateOnly = new Date(shipperDate.getFullYear(), shipperDate.getMonth(), shipperDate.getDate());
      const filterDateOnly = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate());
      
      matchesDate = shipperDateOnly.getTime() === filterDateOnly.getTime();
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Update pagination when filtered shippers change
  useEffect(() => {
    const newTotalPages = Math.ceil(filteredShippers.length / itemsPerPage);
    setTotalPages(newTotalPages);
    
    // Reset to page 1 if current page is beyond new total
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredShippers, currentPage]);

  // Get current page shippers
  const getCurrentPageShippers = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredShippers.slice(startIndex, startIndex + itemsPerPage);
  };

  // Modal operations
  const openModal = (mode, shipper = null) => {
    setModalMode(mode);
    setSelectedShipper(shipper);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedShipper(null);
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
        
        const response = await shipperService.createShipper(createData);
        
        if (response.success) {
          showNotification('Shipper added successfully', 'success');
          await fetchShippers(); // Refresh the list
        } else {
          throw new Error(response.message || 'Failed to create shipper');
        }
      } else if (modalMode === 'edit' && selectedShipper) {
        const updateData = {
          username: formData.username,
          fullName: formData.name,
          phone: formData.phone,
          isRegistered: formData.isRegistered
        };
        
        const response = await shipperService.updateShipper(selectedShipper.id, updateData);
        
        if (response.success) {
          showNotification('Shipper updated successfully', 'success');
          await fetchShippers(); // Refresh the list
        } else {
          throw new Error(response.message || 'Failed to update shipper');
        }
      }
      closeModal();
    } catch (error) {
      console.error('Error saving shipper:', error);
      showNotification(error.message || 'An error occurred', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this shipper?')) {
      try {
        const response = await shipperService.deleteShipper(id);
        
        if (response.success) {
          showNotification('Shipper deleted successfully', 'success');
          await fetchShippers(); // Refresh the list
        } else {
          throw new Error(response.message || 'Failed to delete shipper');
        }
      } catch (error) {
        console.error('Error deleting shipper:', error);
        showNotification(error.message || 'An error occurred', 'error');
      }
    }
  };



  // Import/Export operations (placeholder implementations)
  const handleImportData = async (event) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // TODO: Implement actual import logic
      showNotification('Import feature coming soon', 'info');
    } catch (error) {
      showNotification('Failed to import data', 'error');
    }
    
    // Reset file input
    event.target.value = '';
  };

  const handleExportData = async () => {
    try {
      // TODO: Implement actual export logic
      showNotification('Export feature coming soon', 'info');
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
            <h1 className={styles.title}>Shipper Management</h1>
            <p className={styles.description}>Manage delivery information and performance</p>
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
              <span>Add Shipper</span>
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

      {/* Shipper Cards */}
      <ShipperCard
        shippers={getCurrentPageShippers()}
        currentPage={currentPage}
        totalPages={totalPages}
        totalShippers={filteredShippers.length}
        itemsPerPage={itemsPerPage}
        onView={(shipper) => openModal('view', shipper)}
        onEdit={(shipper) => openModal('edit', shipper)}
        onDelete={handleDelete}
        onPageChange={setCurrentPage}
      />

      {/* Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          title={getModalTitle()}
          onClose={closeModal}
        >
          <ShipperForm
            mode={modalMode}
            initialData={selectedShipper}
            onSubmit={handleSave}
            onCancel={closeModal}
          />
        </Modal>
      )}
    </div>
  );

  // Helper function for modal title
  function getModalTitle() {
    switch (modalMode) {
      case 'view': return 'Shipper Details';
      case 'edit': return 'Edit Shipper';
      case 'add': return 'Add New Shipper';
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

// Shipper Form Component
const ShipperForm = ({ mode, initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    username: initialData?.username || '',
    phone: initialData?.phone || '',
    status: initialData?.status || 'Active',
    isRegistered: initialData?.isRegistered !== undefined ? initialData.isRegistered : true,
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

    // Support both formats: 0xxxxxxxxx or +84xxxxxxxxx
    const phoneRegex = /^(0\d{9}|\+84\d{9})$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Phone format: 0xxxxxxxxx or +84xxxxxxxxx';
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
    
    // Handle boolean conversion for isRegistered field
    const finalValue = name === 'isRegistered' ? value === 'true' : value;
    
    setFormData(prev => ({ ...prev, [name]: finalValue }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const isViewMode = mode === 'view';

  if (isViewMode) {
    return (
      <div className={styles.viewContainer}>
        {/* Basic Information */}
        <div className={styles.viewSection}>
          <h3 className={styles.viewSectionTitle}>Basic Information</h3>
          <div className={styles.viewGrid}>
            <div className={styles.viewField}>
              <span className={styles.viewLabel}>Full Name:</span>
              <span className={styles.viewValue}>{initialData?.name || 'N/A'}</span>
            </div>
            <div className={styles.viewField}>
              <span className={styles.viewLabel}>Username:</span>
              <span className={styles.viewValue}>{initialData?.username || 'N/A'}</span>
            </div>
            <div className={styles.viewField}>
              <span className={styles.viewLabel}>Phone:</span>
              <span className={styles.viewValue}>{initialData?.phone || 'N/A'}</span>
            </div>
            <div className={styles.viewField}>
              <span className={styles.viewLabel}>Status:</span>
              <span className={`${styles.viewValue} ${initialData?.status === 'Active' ? styles.statusActiveText : styles.statusInactiveText}`}>
                {initialData?.status || 'N/A'}
              </span>
            </div>
            <div className={styles.viewField}>
              <span className={styles.viewLabel}>Registered:</span>
              <span className={styles.viewValue}>{initialData?.isRegistered ? 'Yes' : 'No'}</span>
            </div>
            <div className={styles.viewField}>
              <span className={styles.viewLabel}>Member Since:</span>
              <span className={styles.viewValue}>{initialData?.createdAt ? new Date(initialData.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className={styles.viewField}>
              <span className={styles.viewLabel}>Last Updated:</span>
              <span className={styles.viewValue}>{initialData?.updatedAt ? new Date(initialData.updatedAt).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className={styles.viewField}>
              <span className={styles.viewLabel}>Rating:</span>
              <span className={styles.viewValue}>
                {initialData?.rating ? `⭐ ${initialData?.rating}/5.0` : '⭐ 5.0/5.0'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <option value="On Break">On Break</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        <div className={styles.formField}>
          <label className={styles.label}>Registration Status *</label>
          <select
            name="isRegistered"
            value={formData.isRegistered}
            onChange={handleChange}
            disabled={isViewMode}
            required
            className={styles.select}
          >
            <option value={true}>Registered</option>
            <option value={false}>Not Registered</option>
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

export default ShipperManagement; 