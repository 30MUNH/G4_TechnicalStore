import React, { useState, useEffect } from "react";
import { orderService } from "../../services/orderService";
import styles from "./ShipperOrderList.module.css";
import { formatDateTime } from "../../utils/dateFormatter";

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
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState({
    status: "",
    reason: "",
  });

  // Order status options cho shipper (sync với backend enum)
  const statusOptions = [
    { value: "", label: "All status" },
    { value: "PENDING", label: "Pending" },
    { value: "SHIPPING", label: "Shipping" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "CANCELLED", label: "Cancelled" },
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
        // Backend trả về: { data: orders[], pagination: {...} }
        const ordersData = response.data || [];
        const total = response.pagination?.total || 0;

        // Đảm bảo orders luôn là array
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setPagination((prev) => ({
          ...prev,
          total: total,
          totalPages:
            response.pagination?.totalPages || Math.ceil(total / prev.limit),
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

  // Handle status update with enhanced validation
  const handleStatusUpdate = async () => {
    if (!selectedOrder || !statusUpdateData.status) {
      setError("Please select status");
      return;
    }

            if (statusUpdateData.status === "CANCELLED") {
      const reason = statusUpdateData.reason.trim();
      if (!reason) {
        setError("Please enter cancellation reason");
        return;
      }
      if (reason.length < 10) {
        setError("Cancellation reason must be at least 10 characters");
        return;
      }
      if (reason.length > 200) {
        setError("Cancellation reason cannot exceed 200 characters");
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
        setStatusUpdateData({ status: "", reason: "" });
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



  return (
    <>
      <div className={styles.backdrop} onClick={onClose}></div>
      <div className={styles.orderListContainer}>
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
                        {getAvailableStatusTransitions(order.status).length >
                          0 && (
                          <button
                            className={styles.actionButton}
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowStatusModal(true);
                              setStatusUpdateData({ status: "", reason: "" });
                              setError("");
                            }}
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

        {/* Status Update Modal */}
        {showStatusModal && selectedOrder && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h4>Update order status #{selectedOrder.id}</h4>
                <button
                  className={styles.modalCloseButton}
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedOrder(null);
                    setStatusUpdateData({ status: "", reason: "" });
                    setError("");
                  }}
                >
                  ×
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.currentOrderInfo}>
                  <p>
                    <strong>Customer:</strong> {selectedOrder.customer?.name}
                  </p>
                  <p>
                    <strong>Current status:</strong>
                    <span
                      className={`${styles.statusBadge} ${getStatusBadgeClass(
                        selectedOrder.status
                      )}`}
                    >
                      {selectedOrder.status}
                    </span>
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label>Select new status:</label>
                  <select
                    value={statusUpdateData.status}
                    onChange={(e) =>
                      setStatusUpdateData((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className={styles.formControl}
                  >
                    <option value="">-- Select status --</option>
                    {getAvailableStatusTransitions(selectedOrder.status).map(
                      (option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {statusUpdateData.status === "CANCELLED" && (
                  <div className={styles.formGroup}>
                    <label>
                      Cancellation reason:{" "}
                      <span className={styles.required}>*</span>
                    </label>
                    <textarea
                      value={statusUpdateData.reason}
                      onChange={(e) =>
                        setStatusUpdateData((prev) => ({
                          ...prev,
                          reason: e.target.value,
                        }))
                      }
                      placeholder="Enter cancellation reason (10-200 characters)..."
                      className={styles.textarea}
                      rows={3}
                      maxLength={500}
                    />
                    <div className={styles.characterCount}>
                      {statusUpdateData.reason.length}/200 characters
                    </div>
                  </div>
                )}

                {error && <div className={styles.modalError}>{error}</div>}
              </div>

              <div className={styles.modalFooter}>
                <button
                  className={styles.cancelButton}
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedOrder(null);
                    setStatusUpdateData({ status: "", reason: "" });
                    setError("");
                  }}
                >
                  Cancel
                </button>
                <button
                  className={styles.confirmButton}
                  onClick={handleStatusUpdate}
                  disabled={loading || !statusUpdateData.status}
                >
                  {loading ? "Updating..." : "Confirm"}
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
