import React, { useState, useEffect } from 'react';
import OrderTable from './OrderTable';
import { orderService } from '../../services/orderService';
import styles from './OrderManagement.module.css';

const OrderManagement = ({ role = 'admin' }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [filters, setFilters] = useState({
        status: '',
        search: '',
        sort: 'date'
    });
    const [refreshFlag, setRefreshFlag] = useState(false);

    // Fetch orders
    const fetchOrders = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {
                status: filters.status || undefined,
                search: filters.search || undefined,
                sort: filters.sort,
                page: pagination.page,
                limit: pagination.limit
            };
            const response = await orderService.getAllOrdersForAdmin(params);
            if (response && response.data) {
                setOrders(Array.isArray(response.data) ? response.data : []);
                setPagination(prev => ({
                    ...prev,
                    total: response.pagination?.total || 0,
                    totalPages: response.pagination?.totalPages || 1
                }));
            } else {
                throw new Error(response?.message || 'Không thể lấy danh sách đơn hàng');
            }
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra khi tải danh sách đơn hàng');
            setOrders([]);
            setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line
    }, [filters, pagination.page, pagination.limit, refreshFlag]);

    // Handle filter changes
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    // Handle pagination
    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    // Handle status update
    const handleStatusChange = async (orderId, newStatus, reason) => {
        try {
            setLoading(true);
            await orderService.updateOrderStatus(orderId, { status: newStatus, reason });
            setRefreshFlag(flag => !flag);
        } catch (err) {
            setError(err.message || 'Cập nhật trạng thái thất bại');
        } finally {
            setLoading(false);
        }
    };

    // Handle delete order (admin/staff only)
    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm('Bạn có chắc muốn xóa đơn hàng này?')) return;
        try {
            setLoading(true);
            await orderService.deleteOrder(orderId);
            setRefreshFlag(flag => !flag);
        } catch (err) {
            setError(err.message || 'Xóa đơn hàng thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.headerInfo}>
                        <div className={styles.title}>Quản lý đơn hàng</div>
                        <div className={styles.description}>Theo dõi, tìm kiếm, cập nhật và xử lý đơn hàng của khách hàng</div>
                    </div>
                </div>
            </div>
            <div className={styles.filterBar}>
                <input
                    type="text"
                    placeholder="Tìm kiếm mã đơn, tên khách hàng..."
                    value={filters.search || ''}
                    onChange={e => handleFilterChange('search', e.target.value)}
                />
                <select
                    value={filters.status || ''}
                    onChange={e => handleFilterChange('status', e.target.value)}
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="Đang xử lý">Đang xử lý</option>
                    <option value="Đang giao">Đang giao</option>
                    <option value="Đã giao">Đã giao</option>
                    <option value="Đã hủy">Đã hủy</option>
                </select>
                <select
                    value={filters.sort || 'date'}
                    onChange={e => handleFilterChange('sort', e.target.value)}
                >
                    <option value="date">Ngày đặt (Mới nhất)</option>
                    <option value="amount">Tổng tiền (Cao nhất)</option>
                    <option value="customer">Tên khách hàng</option>
                </select>
            </div>
            {error && <div className={styles.errorText}>{error}</div>}
            <OrderTable
                orders={orders}
                loading={loading}
                role={role}
                onStatusChange={handleStatusChange}
                onDelete={role !== 'shipper' ? handleDeleteOrder : undefined}
                pagination={pagination}
                onPageChange={handlePageChange}
                filters={filters}
                onFilterChange={handleFilterChange}
            />
        </div>
    );
};

export default OrderManagement; 