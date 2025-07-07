import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Plus, 
  X,
  Save,
  User,
  Phone,
  Calendar,
  Trash2,
  Eye,
  Edit
} from 'lucide-react';

import OrderTable from './OrderTable';
import FilterBar from './FilterBar';
import styles from './OrderManagement.module.css';
import { orderService } from '../../services/orderService';

const OrderManagement = ({ role = 'admin' }) => {
  // State management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [shipperFilter, setShipperFilter] = useState('all');
  const [amountFilter, setAmountFilter] = useState('all');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit'
  const [selectedOrder, setSelectedOrder] = useState(null);
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

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      console.log('🔄 [OrderManagement] Starting fetchOrders...');
      setLoading(true);
      setError(null);
      
      const response = await orderService.getAllOrdersForAdmin();
      console.log('📡 [OrderManagement] API Response:', response);
      
      if (response && response.data) {
        console.log('✅ [OrderManagement] API Success - Raw data:', response.data);
        
        // Response structure: { message, data: [...orders...], pagination }
        // Access the orders array directly from response.data
        const ordersArray = Array.isArray(response.data) ? response.data : [];
        console.log('🔍 [OrderManagement] Orders array after extraction:', ordersArray);
        console.log('📊 [OrderManagement] Orders array length:', ordersArray.length);
        
        // Map the orders data
        const ordersData = ordersArray.map(order => ({
          id: order.id,
          customer: order.customer || {},
          orderDate: order.orderDate,
          totalAmount: order.totalAmount,
          status: order.status,
          shippingAddress: order.shippingAddress,
          note: order.note,
          cancelReason: order.cancelReason,
          orderDetails: order.orderDetails || [],
          shipper: order.shipper || null
        }));
        
        console.log('🔄 [OrderManagement] Mapped orders data:', ordersData);
        
        setOrders(ordersData);
        setTotalOrders(ordersData.length);
        setTotalPages(Math.ceil(ordersData.length / itemsPerPage));
        
        console.log('💾 [OrderManagement] State updated - orders length:', ordersData.length);
      } else {
        console.error('❌ [OrderManagement] API Failed - No data in response:', response);
        setOrders([]);
        setTotalOrders(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('💥 [OrderManagement] Error fetching orders:', err);
      
      // Handle 401 Unauthorized specifically
      if (err.message && err.message.includes('401')) {
        setError('You are not authorized to view orders. Please login with admin privileges.');
        showNotification('Please login with admin account to view orders', 'error');
      } else {
        setError('Failed to fetch orders: ' + err.message);
        showNotification('Failed to load orders: ' + err.message, 'error');
      }
      
      // Set empty state
      setOrders([]);
      setTotalOrders(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
      console.log('🏁 [OrderManagement] fetchOrders completed');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (!order) return false;
    
    const matchesSearch = order.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter && order.orderDate) {
      const orderDate = new Date(order.orderDate);
      const filterDate = new Date(dateFilter);
      
      // Compare only the date part (ignore time)
      const orderDateOnly = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
      const filterDateOnly = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate());
      
      matchesDate = orderDateOnly.getTime() === filterDateOnly.getTime();
    }

    // Shipper filter
    const matchesShipper = shipperFilter === "all" || 
      (shipperFilter === "with_shipper" && order.shipper) ||
      (shipperFilter === "without_shipper" && !order.shipper);

    // Amount range filter - VND values
    let matchesAmount = true;
    if (amountFilter !== "all" && order.totalAmount) {
      const amount = order.totalAmount;
      switch (amountFilter) {
        case "0-500000":
          matchesAmount = amount >= 0 && amount <= 500000;
          break;
        case "500000-2000000":
          matchesAmount = amount > 500000 && amount <= 2000000;
          break;
        case "2000000-10000000":
          matchesAmount = amount > 2000000 && amount <= 10000000;
          break;
        case "10000000-50000000":
          matchesAmount = amount > 10000000 && amount <= 50000000;
          break;
        case "50000000+":
          matchesAmount = amount > 50000000;
          break;
        default:
          matchesAmount = true;
      }
    }

    return matchesSearch && matchesStatus && matchesDate && matchesShipper && matchesAmount;
  });

  console.log('🔍 [OrderManagement] Filter Debug:', {
    ordersLength: orders.length,
    filteredOrdersLength: filteredOrders.length,
    searchTerm,
    statusFilter,
    dateFilter,
    sampleOrder: orders[0]
  });

  // Update pagination when filtered orders change
  useEffect(() => {
    const newTotalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    setTotalPages(newTotalPages);
    
    // Reset to page 1 if current page is beyond new total
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredOrders, currentPage]);

  // Get current page orders
  const getCurrentPageOrders = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentPageData = filteredOrders.slice(startIndex, startIndex + itemsPerPage);
    console.log('📄 [OrderManagement] getCurrentPageOrders:', {
      currentPage,
      startIndex,
      itemsPerPage,
      filteredOrdersLength: filteredOrders.length,
      currentPageDataLength: currentPageData.length,
      currentPageData
    });
    return currentPageData;
  };

  // Modal operations
  const openModal = (mode, order = null) => {
    setModalMode(mode);
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  // Status update operation
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await orderService.updateOrderStatus(orderId, { status: newStatus });
      
      if (response.success) {
        showNotification('Order status updated successfully', 'success');
        await fetchOrders(); // Refresh the list
      } else {
        throw new Error(response.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showNotification(error.message || 'An error occurred', 'error');
    }
  };

  const handleDelete = async (id) => {
    const order = orders.find(o => o.id === id);
    setSelectedOrder(order);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedOrder) return;
    
    try {
      const response = await orderService.deleteOrder(selectedOrder.id);
      
      if (response.success) {
        showNotification('Order deleted successfully', 'success');
        await fetchOrders(); // Refresh the list
      } else {
        throw new Error(response.message || 'Failed to delete order');
      }
      
      setShowDeleteModal(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error deleting order:', error);
      showNotification(error.message || 'An error occurred', 'error');
    }
  };

  // Export operation
  const handleExportData = async () => {
    try {
      const response = await orderService.exportOrders();
      
      if (response.success && response.data) {
        // Create download link with proper Excel MIME type
        const url = window.URL.createObjectURL(new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.xlsx`);
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

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('');
    setShipperFilter('all');
    setAmountFilter('all');
    setCurrentPage(1);
    showNotification('Filters cleared', 'info');
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
            <h1 className={styles.title}>Order Management</h1>
            <p className={styles.description}>Manage order information and status</p>
          </div>
          
          <div className={styles.headerActions}>
            <button 
              className={`${styles.actionButton} ${styles.exportButton}`}
              onClick={handleExportData}
            >
              <Upload size={18} />
              <span>Export Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        dateFilter={dateFilter}
        shipperFilter={shipperFilter}
        amountFilter={amountFilter}
        onSearchChange={setSearchTerm}
        onStatusChange={setStatusFilter}
        onDateChange={setDateFilter}
        onShipperChange={setShipperFilter}
        onAmountChange={setAmountFilter}
        onClearFilters={clearFilters}
      />

      {/* Order Table */}
      <OrderTable
        orders={getCurrentPageOrders()}
        currentPage={currentPage}
        totalPages={totalPages}
        totalOrders={filteredOrders.length}
        itemsPerPage={itemsPerPage}
        role={role}
        onView={(order) => openModal('view', order)}
        onStatusUpdate={handleStatusUpdate}
        onDelete={role !== 'shipper' ? handleDelete : undefined}
        onPageChange={setCurrentPage}
      />

      {/* Modals */}
      {showModal && (
        <Modal
          isOpen={showModal}
          title={getModalTitle()}
          onClose={closeModal}
        >
          {modalMode === 'view' && selectedOrder && (
            <OrderDetail order={selectedOrder} />
          )}
        </Modal>
      )}

      {showDeleteModal && selectedOrder && (
        <DeleteConfirmation
          order={selectedOrder}
          onConfirm={handleDeleteConfirm}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );

  // Helper function for modal title
  function getModalTitle() {
    switch (modalMode) {
      case 'view': return 'Order Details';
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

// Order Detail Component
const OrderDetail = ({ order }) => (
  <div className={styles.orderDetail}>
    <div className={styles.orderHeader}>
      <div className={styles.orderHeaderInfo}>
        <h3 className={styles.orderHeaderName}>Order #{order.id}</h3>
        <span className={`${styles.status} ${getStatusClass(order.status)}`}>
          {order.status}
        </span>
      </div>
    </div>

    <div className={styles.orderDetailGrid}>
      <div className={styles.detailField}>
        <div className={styles.detailLabel}>
          <User size={16} />
          <span>Customer</span>
        </div>
        <div className={styles.detailValue}>{order.customer?.name || order.customer?.username}</div>
      </div>
      
      <div className={styles.detailField}>
        <div className={styles.detailLabel}>
          <Calendar size={16} />
          <span>Order Date</span>
        </div>
        <div className={styles.detailValue}>
          {new Date(order.orderDate).toLocaleDateString('en-US')}
        </div>
      </div>
      
      <div className={styles.detailField}>
        <div className={styles.detailLabel}>
          <span>Total Amount</span>
        </div>
        <div className={styles.detailValue}>
          {order.totalAmount?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
        </div>
      </div>
      
      <div className={styles.detailField}>
        <div className={styles.detailLabel}>
          <span>Shipping Address</span>
        </div>
        <div className={styles.detailValue}>{order.shippingAddress}</div>
      </div>

      {order.note && (
        <div className={styles.detailField}>
          <div className={styles.detailLabel}>
            <span>Note</span>
          </div>
          <div className={styles.detailValue}>{order.note}</div>
        </div>
      )}

      {order.cancelReason && (
        <div className={styles.detailField}>
          <div className={styles.detailLabel}>
            <span>Cancel Reason</span>
          </div>
          <div className={styles.detailValue}>{order.cancelReason}</div>
        </div>
      )}
    </div>

    {order.orderDetails && order.orderDetails.length > 0 && (
      <div className={styles.orderProducts}>
        <h4>Ordered Products</h4>
        <div className={styles.productsList}>
          {order.orderDetails.map((item, index) => (
            <div key={index} className={styles.productItem}>
              <span>{item.product?.name || 'Product'}</span>
              <span>x{item.quantity}</span>
              <span>{item.price?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Helper function for status class
const getStatusClass = (status) => {
  switch (status) {
    case 'Processing': return styles.statusProcessing;
    case 'Shipping': return styles.statusShipping;
    case 'Delivered': return styles.statusDelivered;
    case 'Cancelled': return styles.statusCancelled;
    default: return styles.statusDefault;
  }
};

// Delete Confirmation Component
const DeleteConfirmation = ({ order, onConfirm, onClose }) => (
  <div className={styles.deleteModalOverlay}>
    <div className={styles.deleteModalContent}>
      <div className={styles.deleteModalBody}>
        <div className={styles.deleteIcon}>
          <Trash2 size={24} color="#dc2626" />
        </div>
        <h3 className={styles.deleteTitle}>Confirm Delete</h3>
        <p className={styles.deleteMessage}>
          Are you sure you want to delete order "#{order.id}"? This action cannot be undone.
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

export default OrderManagement;