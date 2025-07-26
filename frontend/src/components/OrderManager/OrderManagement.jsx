import React, { useState, useEffect } from 'react';
import { 
  X,
  Calendar,
  User,
  Trash2,
  XCircle,
  Eye,
} from 'lucide-react';

import OrderTable from './OrderTable';
import FilterBar from './FilterBar';
import OrderDetailModal from './OrderDetailModal';
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
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const itemsPerPage = 10;

  // Fetch orders from API with pagination and filters
  const fetchOrders = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      // Compose params: filters + pagination
      const queryParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        date: dateFilter || undefined,
        shipper: shipperFilter !== 'all' ? shipperFilter : undefined,
        amount: amountFilter !== 'all' ? amountFilter : undefined,
        ...params
      };
      const response = await orderService.getAllOrdersForAdmin(queryParams);
      
      // Backend returns nested structure due to ResponseInterceptor:
      // { success: true, statusCode: 200, data: { message: "...", data: orders[], pagination: {...} } }
      if (response.data && response.data.data && response.data.pagination) {
        const ordersArr = response.data.data || [];
        const pagination = response.data.pagination || {};
        setOrders(ordersArr);
        setTotalOrders(pagination.total || ordersArr.length);
        setTotalPages(pagination.totalPages || 1);
      } else {
        // Fallback for simpler response format
        const ordersArr = Array.isArray(response.data?.data) ? response.data.data : [];
        setOrders(ordersArr);
        setTotalOrders(ordersArr.length);
        setTotalPages(1);
      }
    } catch (err) {
        setError('Cannot load orders: ' + err.message);
      setOrders([]);
      setTotalOrders(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders on mount and when filters/page change
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, [currentPage, searchTerm, statusFilter, dateFilter, shipperFilter, amountFilter]);

  // Ensure orders is always an array
  const safeOrders = Array.isArray(orders) ? orders : [];

  // Modal operations
  const openModal = (order = null) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const handleReject = async (id) => {
    const order = orders.find(o => o.id === id);
    setSelectedOrder(order);
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedOrder) return;
    
    try {
      // Reject order by changing status to "CANCELLED"
      const response = await orderService.updateOrderStatus(selectedOrder.id, { 
        status: 'CANCELLED',
        cancelReason: 'Rejected by admin'
      });
      
      if (response.success) {
        await fetchOrders(); // Refresh the list
      } else {
        throw new Error(response.message || 'Cannot reject order');
      }
      
      setShowRejectModal(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to reject order:', error);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('');
    setShipperFilter('all');
    setAmountFilter('all');
    setCurrentPage(1);
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
            <h1 className={styles.title}>Order management</h1>
            <p className={styles.description}>Manage order information and status</p>
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
        orders={safeOrders}
        currentPage={currentPage}
        totalPages={totalPages}
        totalOrders={totalOrders}
        itemsPerPage={itemsPerPage}
        role={role}
        onView={(order) => openModal(order)}
        onReject={role === 'admin' ? handleReject : undefined}
        onPageChange={setCurrentPage}
      />

      {/* Modals */}
      {showModal && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          open={showModal}
          onClose={closeModal}
          role={role}
        />
      )}

      {showRejectModal && selectedOrder && (
        <RejectConfirmation
          order={selectedOrder}
          onConfirm={handleRejectConfirm}
          onClose={() => {
            setShowRejectModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};

// Reject Confirmation Component
const RejectConfirmation = ({ order, onConfirm, onClose }) => (
  <div className={styles.deleteModalOverlay}>
    <div className={styles.deleteModalContent}>
      <div className={styles.deleteModalBody}>
        <div className={styles.deleteIcon}>
          <XCircle size={24} color="#dc2626" />
        </div>
        <h3 className={styles.deleteTitle}>Confirm reject order</h3>
        <p className={styles.deleteMessage}>
          Are you sure you want to reject order "#{order.id}"? The order will be changed to "CANCELLED".
        </p>
        <div className={styles.deleteActions}>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={onConfirm} className={styles.confirmDeleteButton}>
            Reject
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default OrderManagement;