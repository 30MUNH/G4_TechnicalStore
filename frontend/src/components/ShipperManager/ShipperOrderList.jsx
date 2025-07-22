import React, { useState, useEffect } from "react";
import { orderService } from "../../services/orderService";
import styles from "./ShipperOrderList.module.css";
import { formatDateTime } from "../../utils/dateFormatter";
import { OrderDetailView } from "../OrderManager";

const ShipperOrderList = ({ shipperId, shipperName, onClose }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Filter states
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    sort: "date",
  });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  
  // Order status options cho shipper (sync với backend enum)
  const statusOptions = [
    { value: "", label: "All status" },
    { value: "PENDING", label: "Pending" },
    { value: "SHIPPING", label: "Shipping" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "CANCELLED", label: "Cancelled" },
    { value: "PENDING_EXTERNAL_SHIPPING", label: "External Shipping" },
  ];

  const sortOptions = [
    { value: "date", label: "Order date (Newest)" },
    { value: "amount", label: "Total amount (Highest)" },
    { value: "customer", label: "Customer name" },
  ];

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        status: filters.status || undefined,
        search: filters.search || undefined,
        sort: filters.sort,
        page: pagination.page,
        limit: pagination.limit,
      };

      const response = await orderService.getOrdersByShipper(shipperId, params);

      if (response.success) {
        // ✅ FIX: Handle nested response structure from Response Interceptor
        // Structure: { success: true, statusCode: 200, data: { data: orders[], pagination: {...} } }
        const responseData = response.data || {};
        const ordersData = responseData.data || [];
        const total = responseData.pagination?.total || 0;

        // Đảm bảo orders luôn là array
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setPagination((prev) => ({
          ...prev,
          total: total,
          totalPages:
            responseData.pagination?.totalPages || Math.ceil(total / prev.limit),
        }));
      } else {
        throw new Error(response.message || "Cannot load order list");
      }
    } catch (err) {
      setError(err.message || "Failed to load order list");
      setOrders([]); // Ensure always set array
      setPagination((prev) => ({ ...prev, total: 0, totalPages: 0 }));
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
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Handle status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setLoading(true);
      const response = await orderService.updateOrderStatusByShipper(
        shipperId,
        orderId,
        { status: newStatus }
      );

      if (response.success) {
        setShowOrderDetail(false);
        setSelectedOrder(null);
        await fetchOrders(); // Refresh list
      } else {
        throw new Error(response.message || "Update failed");
      }
    } catch (err) {
      setError(err.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  // Get status badge class (sync với backend enum values)
  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      "PENDING": styles.statusPending,
      "SHIPPING": styles.statusShipping,
      "DELIVERED": styles.statusDelivered,
      "CANCELLED": styles.statusCancelled,
      "PENDING_EXTERNAL_SHIPPING": styles.statusExternalShipping,
    };
    return statusClasses[status] || styles.statusDefault;
  };

  // Get available status transitions for current order (sync với backend logic)
  const getAvailableStatusTransitions = (currentStatus) => {
    const transitions = {
      "PENDING": [
        { value: "SHIPPING", label: "Change to Shipping" },
        { value: "CANCELLED", label: "Cancel order" },
      ],
      "SHIPPING": [
        { value: "DELIVERED", label: "Complete delivery" },
        { value: "CANCELLED", label: "Cancel order" },
      ],
      "PENDING_EXTERNAL_SHIPPING": [
        { value: "DELIVERED", label: "Mark as delivered" },
        { value: "CANCELLED", label: "Cancel order" },
      ],
    };
    return transitions[currentStatus] || [];
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Open order detail modal
  const viewOrderDetail = (order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  return (
    <>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <h3>Order list - {shipperName}</h3>
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close" 
            >
              ×
            </button>
          </div>

          {/* Filters */}
          <div className={styles.filtersRow}>
            <div className={styles.filterGroup}>
              <label>Status:</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className={styles.filterSelect}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Sort:</label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange("sort", e.target.value)}
                className={styles.filterSelect}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Search:</label>
              <input
                type="text"
                placeholder="Order ID, customer name..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && <div className={styles.errorMessage}>{error}</div>}

        {/* Loading state */}
        {loading && (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <span>Loading...</span>
          </div>
        )}

        {/* Orders table */}
        {!loading && (
          <div className={styles.tableContainer}>
            <table className={styles.ordersTable}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Order date</th>
                  <th>Total amount</th>
                  <th>Status</th>
                  <th>Shipping address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {!Array.isArray(orders) || orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className={styles.emptyState}>
                      {!Array.isArray(orders)
                        ? "Loading data..."
                        : filters.status || filters.search
                        ? "No order found"
                        : "This shipper has no orders"}
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td className={styles.orderIdCell}>#{order.id}</td>
                      <td>
                        <div className={styles.customerInfo}>
                          <div className={styles.customerName}>
                            {order.customer?.name ||
                              order.customer?.username ||
                              "N/A"}
                          </div>
                          <div className={styles.customerUsername}>
                            @{order.customer?.username || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td>{formatDateTime(order.orderDate)}</td>
                      <td className={styles.amountCell}>
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td>
                        <span
                          className={`${
                            styles.statusBadge
                          } ${getStatusBadgeClass(order.status)}`}
                        >
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
                            onClick={() => viewOrderDetail(order)}
                          >
                            Update
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
              « Previous
            </button>

            <span className={styles.paginationInfo}>
              Page {pagination.page} / {pagination.totalPages}(
              {pagination.total} orders)
            </span>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className={styles.paginationButton}
            >
              Next »
            </button>
          </div>
        )}

        {/* Order Detail Modal */}
        {showOrderDetail && selectedOrder && (
          <OrderDetailView
            order={selectedOrder}
            open={showOrderDetail}
            onClose={() => {
              setShowOrderDetail(false);
              setSelectedOrder(null);
            }}
            onStatusChange={handleStatusUpdate}
            role="shipper"
          />
        )}
    </>
  );
};

export default ShipperOrderList;
