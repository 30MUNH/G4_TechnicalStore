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
  const [areaFilter, setAreaFilter] = useState('all');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  
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
      setLoading(true);
      setError(null);
      
      const response = await shipperService.getAllShippers();
      
      if (response.success && response.data) {
        // Ensure response.data is an array
        const dataArray = Array.isArray(response.data) ? response.data : [];
        const shippersData = dataArray.map(shipper => ({
          id: shipper.id,
          name: shipper.fullName,
          username: shipper.username,
          phone: shipper.phone,
          area: mockAreas[Math.floor(Math.random() * mockAreas.length)], // Mock area
          vehicle: mockVehicles[Math.floor(Math.random() * mockVehicles.length)], // Mock vehicle
          orders: shipper.shipperOrders?.length || Math.floor(Math.random() * 200), // Mock or real orders
          rating: (Math.random() * 2 + 3).toFixed(1), // Mock rating 3.0-5.0
          status: shipper.isRegistered ? 'Active' : 'Suspended',
          isRegistered: shipper.isRegistered,
          createdAt: shipper.createdAt,
          shipperOrders: shipper.shipperOrders || []
        }));
        
        setShippers(shippersData);
        setTotalShippers(shippersData.length);
        setTotalPages(Math.ceil(shippersData.length / itemsPerPage));
      } else {
        throw new Error(response.message || 'Failed to fetch shippers');
      }
    } catch (err) {
      console.error('Error fetching shippers:', err);
      setError('Failed to fetch shippers');
      showNotification('Failed to load shippers', 'error');
    } finally {
      setLoading(false);
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
    
    const matchesArea = areaFilter === 'all' || 
      shipper.area?.toLowerCase().includes(areaFilter.toLowerCase());
    
    const matchesVehicle = vehicleFilter === 'all' || 
      shipper.vehicle?.toLowerCase().includes(vehicleFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesArea && matchesVehicle;
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
          phone: formData.phone
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
        areaFilter={areaFilter}
        vehicleFilter={vehicleFilter}
        onSearchChange={setSearchTerm}
        onStatusChange={setStatusFilter}
        onAreaChange={setAreaFilter}
        onVehicleChange={setVehicleFilter}
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
    area: initialData?.area || 'Downtown',
    vehicle: initialData?.vehicle || 'Motorcycle',
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
          <label className={styles.label}>Area *</label>
          <select
            name="area"
            value={formData.area}
            onChange={handleChange}
            disabled={isViewMode}
            required
            className={styles.select}
          >
            <option value="Downtown">Downtown</option>
            <option value="Midtown">Midtown</option>
            <option value="Brooklyn">Brooklyn</option>
            <option value="Queens">Queens</option>
            <option value="Bronx">Bronx</option>
          </select>
        </div>

        <div className={styles.formField}>
          <label className={styles.label}>Vehicle *</label>
          <select
            name="vehicle"
            value={formData.vehicle}
            onChange={handleChange}
            disabled={isViewMode}
            required
            className={styles.select}
          >
            <option value="Motorcycle">Motorcycle</option>
            <option value="Small Truck">Small Truck</option>
          </select>
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