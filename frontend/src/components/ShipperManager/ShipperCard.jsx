import React from 'react';
import { Eye, Edit, Trash2, Phone, MapPin, Truck, ChevronLeft, ChevronRight, User, List } from 'lucide-react';
import styles from './ShipperCard.module.css';

const ShipperCard = ({
  shippers = [],
  currentPage = 1,
  totalPages = 1,
  totalShippers = 0,
  itemsPerPage = 5,
  onView,
  onEdit,
  onDelete,
  onViewOrders,
  onPageChange
}) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalShippers);

  const getStatusClass = (status) => {
    switch (status) {
      case 'Active':
        return styles.statusActive;
      case 'On Break':
        return styles.statusBreak;
      case 'Suspended':
        return styles.statusSuspended;
      default:
        return styles.statusActive;
    }
  };

  const renderStars = (rating) => {
    return (
      <div className={styles.ratingContainer}>
        <div className={styles.stars}>
          {[...Array(5)].map((_, index) => (
            <span
              key={index}
              className={`${styles.star} ${
                index < Math.floor(rating) ? styles.starFilled : styles.starEmpty
              }`}
            >
              ★
            </span>
          ))}
        </div>
        <span className={styles.ratingText}>({rating})</span>
      </div>
    );
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  if (!shippers.length) {
    return (
      <div className={styles.cardContainer}>
        <div className={styles.emptyState}>
          <User className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No shippers found</h3>
          <p className={styles.emptyDescription}>
            No shippers in system or no matches with current filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Shipper Cards */}
      <div className={styles.cardContainer}>
        {shippers.map((shipper) => (
          <div key={shipper.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.shipperInfo}>
                <div className={styles.avatar}>
                  {getInitial(shipper.name)}
                </div>
                <div className={styles.shipperDetails}>
                  <h3 className={styles.shipperName}>{shipper.name}</h3>
                  <p className={styles.shipperId}>ID: {shipper.id}</p>
                </div>
              </div>
              <span className={`${styles.status} ${getStatusClass(shipper.status)}`}>
                {shipper.status}
              </span>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <Phone className={styles.infoIcon} />
                  <span className={styles.infoText}>{shipper.phone}</span>
                </div>
                <div className={styles.infoItem}>
                  <MapPin className={styles.infoIcon} />
                  <span className={styles.infoText}>Member since: {formatDate(shipper.createdAt)}</span>
                </div>
              </div>

              <div className={styles.infoGrid}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Orders:</span>
                  <span className={styles.statValue}>{shipper.totalOrders}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Delivered:</span>
                  <span className={styles.statValue}>{shipper.deliveredOrders}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Rating:</span>
                  {shipper.rating ? renderStars(parseFloat(shipper.rating)) : renderStars(5.0)}
                </div>
              </div>
            </div>

            <div className={styles.cardActions}>
              <button
                className={`${styles.actionButton} ${styles.viewButton}`}
                onClick={() => onView(shipper)}
              >
                <Eye className={styles.actionIcon} />
                View
              </button>
              <button
                className={`${styles.actionButton} ${styles.ordersButton}`}
                onClick={() => onViewOrders(shipper)}
                title="View Orders"
              >
                <List className={styles.actionIcon} />
                Orders
              </button>
              <button
                className={`${styles.actionButton} ${styles.editButton}`}
                onClick={() => onEdit(shipper)}
              >
                <Edit className={styles.actionIcon} />
                Edit
              </button>
              <button
                className={`${styles.actionButton} ${styles.deleteButton}`}
                onClick={() => onDelete(shipper.id)}
              >
                <Trash2 className={styles.actionIcon} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <div className={styles.paginationInfo}>
          Showing {startIndex + 1} to {endIndex} of {totalShippers} results
        </div>
        <div className={styles.paginationControls}>
          <button
            className={styles.paginationButton}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </button>
          <span className={styles.currentPage}>{currentPage}</span>
          <button
            className={styles.paginationButton}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </>
  );
};

export default ShipperCard; 