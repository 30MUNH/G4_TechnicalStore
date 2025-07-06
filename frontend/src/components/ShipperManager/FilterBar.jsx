import React from 'react';
import { Search } from 'lucide-react';
import styles from './FilterBar.module.css';

const FilterBar = ({
  searchTerm = '',
  statusFilter = 'all',
  areaFilter = 'all',
  vehicleFilter = 'all',
  onSearchChange,
  onStatusChange,
  onAreaChange,
  onVehicleChange,
  onClearFilters
}) => {
  const hasActiveFilters = searchTerm || statusFilter !== 'all' || areaFilter !== 'all' || vehicleFilter !== 'all';

  const handleClearFilters = () => {
    onSearchChange('');
    onStatusChange('all');
    onAreaChange('all');
    onVehicleChange('all');
    if (onClearFilters) {
      onClearFilters();
    }
  };

  return (
    <div className={styles.filterContainer}>
      <div className={styles.filterGrid}>
        {/* Search Input */}
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <select
          className={styles.select}
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* Area Filter */}
        <select
          className={styles.select}
          value={areaFilter}
          onChange={(e) => onAreaChange(e.target.value)}
        >
          <option value="all">All Areas</option>
          <option value="downtown">Downtown</option>
          <option value="midtown">Midtown</option>
          <option value="brooklyn">Brooklyn</option>
          <option value="queens">Queens</option>
          <option value="bronx">Bronx</option>
        </select>

        {/* Vehicle Filter */}
        <select
          className={styles.select}
          value={vehicleFilter}
          onChange={(e) => onVehicleChange(e.target.value)}
        >
          <option value="all">All Vehicles</option>
          <option value="motorcycle">Motorcycle</option>
          <option value="truck">Small Truck</option>
        </select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar; 