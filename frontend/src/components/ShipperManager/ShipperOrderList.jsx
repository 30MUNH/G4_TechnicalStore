import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import styles from './ShipperOrderList.module.css';

const ShipperOrderList = ({ shipperId, shipperName, onClose }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    // Filter states
    const [filters, setFilters] = useState({
        status: '',
        search: '',
        sort: 'date'
    });

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusUpdateData, setStatusUpdateData] = useState({
        status: '',
        reason: ''
    });

    // Order status options cho shipper (sync với backend enum)
    const statusOptions = [
        { value: '', label: 'Tất cả trạng thái' },
        { value: 'Đang xử lý', label: 'Đang xử lý' },
        { value: 'Đang giao', label: 'Đang giao' },
        { value: 'Đã giao', label: 'Đã giao' },
        { value: 'Đã hủy', label: 'Đã hủy' }
    ];

    const sortOptions = [
        { value: 'date', label: 'Ngày đặt (Mới nhất)' },
        { value: 'amount', label: 'Tổng tiền (Cao nhất)' },
        { value: 'customer', label: 'Tên khách hàng' }
    ];

    // Fetch orders
    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError('');

            const params = {
                status: filters.status || undefined,
                search: filters.search || undefined,
                sort: filters.sort,
                page: pagination.page,
                limit: pagination.limit
            };

            const response = await orderService.getOrdersByShipper(shipperId, params);
            
            if (response.success) {
                // Backend trả về: { data: orders[], pagination: {...} }
                const ordersData = response.data || [];
                const total = response.pagination?.total || 0;
                
                // Đảm bảo orders luôn là array
                setOrders(Array.isArray(ordersData) ? ordersData : []);
                setPagination(prev => ({
                    ...prev,
                    total: total,
                    totalPages: response.pagination?.totalPages || Math.ceil(total / prev.limit)
                }));
            } else {
                throw new Error(response.message || 'Không thể lấy danh sách đơn hàng');
            }
        } catch (err) {
            console.error('❌ Error fetching orders:', err);
            setError(err.message || 'Có lỗi xảy ra khi tải danh sách đơn hàng');
            setOrders([]); // Đảm bảo luôn set array
            setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
        } finally {
            setLoading(false);
        }
    };

    // Effect to fetch data when dependencies change
    useEffect(() => {
        if (shipperId) {
            fetchOrders();
        }
    }, [shipperId, filters, pagination.page, pagination.limit]);

    // Handle filter changes
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    };

    // Handle pagination
    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    // Handle status update with enhanced validation
    const handleStatusUpdate = async () => {
        if (!selectedOrder || !statusUpdateData.status) {
            setError('Vui lòng chọn trạng thái');
            return;
        }

        if (statusUpdateData.status === 'Đã hủy') {
            const reason = statusUpdateData.reason.trim();
            if (!reason) {
                setError('Vui lòng nhập lý do hủy đơn hàng');
                return;
            }
            if (reason.length < 10) {
                setError('Lý do hủy đơn hàng phải có ít nhất 10 ký tự');
                return;
            }
            if (reason.length > 500) {
                setError('Lý do hủy đơn hàng không được vượt quá 500 ký tự');
                return;
            }
        }

        try {
            setLoading(true);
            const response = await orderService.updateOrderStatusByShipper(
                shipperId,
                selectedOrder.id,
                statusUpdateData
            );

            if (response.success) {
                setShowStatusModal(false);
                setSelectedOrder(null);
                setStatusUpdateData({ status: '', reason: '' });
                await fetchOrders(); // Refresh list
            } else {
                throw new Error(response.message || 'Cập nhật thất bại');
            }
        } catch (err) {
            console.error('❌ Error updating status:', err);
            setError(err.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
        } finally {
            setLoading(false);
        }
    };

    // Get status badge class (sync với backend enum values)
    const getStatusBadgeClass = (status) => {
        const statusClasses = {
            'Đang chờ': styles.statusPending,
            'Đang xử lý': styles.statusProcessing,
            'Đang giao': styles.statusShipping,
            'Đã giao': styles.statusDelivered,
            'Đã hủy': styles.statusCancelled
        };
        return statusClasses[status] || styles.statusDefault;
    };

    // Get available status transitions for current order (sync với backend logic)
    const getAvailableStatusTransitions = (currentStatus) => {
        const transitions = {
            'Đang xử lý': [
                { value: 'Đang giao', label: 'Chuyển sang Đang giao' },
                { value: 'Đã hủy', label: 'Hủy đơn hàng' }
            ],
            'Đang giao': [
                { value: 'Đã giao', label: 'Hoàn thành giao hàng' },
                { value: 'Đã hủy', label: 'Hủy đơn hàng' }
            ]
        };
        return transitions[currentStatus] || [];
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
        <div className={styles.backdrop} onClick={onClose}></div>
        <div className={styles.orderListContainer}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <h3>Danh sách đơn hàng - {shipperName}</h3>
                    <button 
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Đóng"
                    >
                        ×
                    </button>
                </div>
                
                {/* Filters */}
                <div className={styles.filtersRow}>
                    <div className={styles.filterGroup}>
                        <label>Trạng thái:</label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className={styles.filterSelect}
                        >
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label>Sắp xếp:</label>
                        <select
                            value={filters.sort}
                            onChange={(e) => handleFilterChange('sort', e.target.value)}
                            className={styles.filterSelect}
                        >
                            {sortOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label>Tìm kiếm:</label>
                        <input
                            type="text"
                            placeholder="Mã đơn, tên khách hàng..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>


                </div>
            </div>

            {/* Error message */}
            {error && (
                <div className={styles.errorMessage}>
                    {error}
                </div>
            )}

            {/* Loading state */}
            {loading && (
                <div className={styles.loadingState}>
                    <div className={styles.spinner}></div>
                    <span>Đang tải...</span>
                </div>
            )}

            {/* Orders table */}
            {!loading && (
                <div className={styles.tableContainer}>
                    <table className={styles.ordersTable}>
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                <th>Khách hàng</th>
                                <th>Ngày đặt</th>
                                <th>Tổng tiền</th>
                                <th>Trạng thái</th>
                                <th>Địa chỉ giao</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!Array.isArray(orders) || orders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className={styles.emptyState}>
                                        {!Array.isArray(orders) 
                                            ? 'Đang tải dữ liệu...'
                                            : (filters.status || filters.search 
                                                ? 'Không tìm thấy đơn hàng phù hợp'
                                                : 'Shipper này chưa có đơn hàng nào'
                                            )
                                        }
                                    </td>
                                </tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.id}>
                                        <td className={styles.orderIdCell}>
                                            #{order.id}
                                        </td>
                                        <td>
                                            <div className={styles.customerInfo}>
                                                <div className={styles.customerName}>
                                                    {order.customer?.name || order.customer?.username || 'N/A'}
                                                </div>
                                                <div className={styles.customerUsername}>
                                                    @{order.customer?.username || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td>{formatDate(order.orderDate)}</td>
                                        <td className={styles.amountCell}>
                                            {formatCurrency(order.totalAmount)}
                                        </td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${getStatusBadgeClass(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className={styles.addressCell}>
                                            {order.shippingAddress}
                                        </td>
                                        <td className={styles.actionCell}>
                                            {getAvailableStatusTransitions(order.status).length > 0 && (
                                                <button
                                                    className={styles.actionButton}
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setShowStatusModal(true);
                                                        setStatusUpdateData({ status: '', reason: '' });
                                                        setError('');
                                                    }}
                                                >
                                                    Cập nhật
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && Array.isArray(orders) && (
                <div className={styles.pagination}>
                    <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className={styles.paginationButton}
                    >
                        « Trước
                    </button>
                    
                    <span className={styles.paginationInfo}>
                        Trang {pagination.page} / {pagination.totalPages} 
                        ({pagination.total} đơn hàng)
                    </span>
                    
                    <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className={styles.paginationButton}
                    >
                        Sau »
                    </button>
                </div>
            )}

            {/* Status Update Modal */}
            {showStatusModal && selectedOrder && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h4>Cập nhật trạng thái đơn hàng #{selectedOrder.id}</h4>
                            <button
                                className={styles.modalCloseButton}
                                onClick={() => {
                                    setShowStatusModal(false);
                                    setSelectedOrder(null);
                                    setStatusUpdateData({ status: '', reason: '' });
                                    setError('');
                                }}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className={styles.modalBody}>
                            <div className={styles.currentOrderInfo}>
                                <p><strong>Khách hàng:</strong> {selectedOrder.customer?.name}</p>
                                <p><strong>Trạng thái hiện tại:</strong> 
                                    <span className={`${styles.statusBadge} ${getStatusBadgeClass(selectedOrder.status)}`}>
                                        {selectedOrder.status}
                                    </span>
                                </p>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Chọn trạng thái mới:</label>
                                <select
                                    value={statusUpdateData.status}
                                    onChange={(e) => setStatusUpdateData(prev => ({ 
                                        ...prev, 
                                        status: e.target.value 
                                    }))}
                                    className={styles.formControl}
                                >
                                    <option value="">-- Chọn trạng thái --</option>
                                    {getAvailableStatusTransitions(selectedOrder.status).map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {statusUpdateData.status === 'Đã hủy' && (
                                <div className={styles.formGroup}>
                                    <label>Lý do hủy đơn hàng: <span className={styles.required}>*</span></label>
                                    <textarea
                                        value={statusUpdateData.reason}
                                        onChange={(e) => setStatusUpdateData(prev => ({ 
                                            ...prev, 
                                            reason: e.target.value 
                                        }))}
                                        placeholder="Nhập lý do hủy đơn hàng (10-500 ký tự)..."
                                        className={styles.textarea}
                                        rows={3}
                                        maxLength={500}
                                    />
                                    <div className={styles.characterCount}>
                                        {statusUpdateData.reason.length}/500 ký tự
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className={styles.modalError}>
                                    {error}
                                </div>
                            )}
                        </div>
                        
                        <div className={styles.modalFooter}>
                            <button
                                className={styles.cancelButton}
                                onClick={() => {
                                    setShowStatusModal(false);
                                    setSelectedOrder(null);
                                    setStatusUpdateData({ status: '', reason: '' });
                                    setError('');
                                }}
                            >
                                Hủy
                            </button>
                            <button
                                className={styles.confirmButton}
                                onClick={handleStatusUpdate}
                                disabled={loading || !statusUpdateData.status}
                            >
                                {loading ? 'Đang cập nhật...' : 'Xác nhận'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </>
    );
};

export default ShipperOrderList; 