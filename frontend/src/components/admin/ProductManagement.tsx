import React, { useState, useEffect } from 'react';
import {
  Upload,
  Plus,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { productService } from '../../services/productService';
import type { Product, Category } from '../../types/product';
import ProductDetailAdminModal from './ProductDetailAdminModal';
import ProductEditAdminModal from './ProductEditAdminModal';
import ProductAddAdminModal from './ProductAddAdminModal';

// Notification function (dùng chung, không phụ thuộc CSS module)
const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.padding = '16px 24px';
  notification.style.borderRadius = '8px';
  notification.style.color = 'white';
  notification.style.fontWeight = '600';
  notification.style.fontSize = '14px';
  notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  notification.style.zIndex = '10000';
  notification.style.maxWidth = '400px';
  notification.style.wordWrap = 'break-word';
  notification.style.animation = 'slideInRight 0.3s ease-out';
  switch (type) {
    case 'success':
      notification.style.backgroundColor = '#22c55e';
      break;
    case 'error':
      notification.style.backgroundColor = '#ef4444';
      break;
    default:
      notification.style.backgroundColor = '#3b82f6';
  }
  // Add animation keyframes if not already added
  if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
  document.body.appendChild(notification);
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }, 3000);
};

const ProductManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priceSort, setPriceSort] = useState('none');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const PRODUCTS_PER_PAGE = 12;
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Danh sách category filter cố định
  const CATEGORY_FILTERS = [
    'laptop', 'pc', 'drive', 'monitor', 'cpu', 'cooler', 'ram', 'psu', 'case', 'headset', 'motherboard', 'keyboard', 'gpu', 'mouse', 'network card'
  ];

  // Fetch products and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all products including out of stock
        const productsData = await productService.getAllProductsIncludingOutOfStock();
        console.log('Fetched products:', productsData);
        setProducts(Array.isArray(productsData) ? productsData : []);
        
        // Lấy danh sách category
        const categoriesData = await productService.getCategories();
        console.log('Fetched categories:', categoriesData);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (stock: number) => {
    if (stock > 0) {
      return 'bg-green-100 text-green-800';
    } else {
      return 'bg-red-100 text-red-800';
    }
  };

  const getStatusText = (stock: number) => {
    if (stock > 0) {
      return 'In Stock';
    } else {
      return 'Out of Stock';
    }
  };

  const getCategoryColor = (categoryName: string) => {
    switch (categoryName?.toLowerCase()) {
      case 'laptop':
        return 'bg-blue-100 text-blue-800';
      case 'cpu':
        return 'bg-purple-100 text-purple-800';
      case 'gpu':
        return 'bg-orange-100 text-orange-800';
      case 'ram':
        return 'bg-green-100 text-green-800';
      case 'storage':
      case 'drive':
        return 'bg-yellow-100 text-yellow-800';
      case 'motherboard':
        return 'bg-indigo-100 text-indigo-800';
      case 'psu':
        return 'bg-pink-100 text-pink-800';
      case 'case':
        return 'bg-gray-100 text-gray-800';
      case 'cooler':
        return 'bg-cyan-100 text-cyan-800';
      case 'monitor':
        return 'bg-emerald-100 text-emerald-800';
      case 'keyboard':
        return 'bg-amber-100 text-amber-800';
      case 'mouse':
        return 'bg-rose-100 text-rose-800';
      case 'headset':
        return 'bg-violet-100 text-violet-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter và sort products
  const filteredAndSortedProducts = products
    .filter(product => {
      // Search filter
      const matchesSearch = searchTerm.trim() === '' ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      // Category filter
      const matchesCategory = categoryFilter === 'all' ||
        (product.category?.name || '').toLowerCase() === categoryFilter.toLowerCase();
      // Status filter
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'in_stock' && product.stock > 0) ||
        (statusFilter === 'out_of_stock' && product.stock === 0);
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (priceSort === 'asc') {
        return a.price - b.price;
      } else if (priceSort === 'desc') {
        return b.price - a.price;
      }
      return 0;
    });

  // Tính toán sản phẩm hiển thị trên trang hiện tại
  const totalPages = Math.ceil(filteredAndSortedProducts.length / PRODUCTS_PER_PAGE);
  const startIdx = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIdx = startIdx + PRODUCTS_PER_PAGE;
  const paginatedProducts = filteredAndSortedProducts.slice(startIdx, endIdx);

  // Hàm tạo mảng số trang dạng rút gọn
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2);
      if (currentPage > 4) pages.push('...');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        if (i > 2 && i < totalPages - 1) pages.push(i);
      }
      if (currentPage < totalPages - 4) pages.push('...');
      pages.push(totalPages - 1, totalPages);
    }
    // Loại bỏ số trùng và ... cạnh nhau
    const result: (number | string)[] = [];
    let prev: number | string | null = null;
    for (const p of pages) {
      if (typeof p === 'string' && (prev === '...' || typeof prev === 'number' && Math.abs((prev as number) - (pages[pages.indexOf(p) + 1] as number)) === 1)) {
        continue;
      }
      if (result.length && result[result.length - 1] === p) continue;
      result.push(p);
      prev = p;
    }
    return result.filter((p, i, arr) => !(p === '...' && (i === 0 || i === arr.length - 1)));
  };

  // Khi thay đổi filter/sort, reset về trang 1
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, statusFilter, priceSort, products]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleViewProduct = async (product: Product) => {
    try {
      // Gọi API lấy chi tiết sản phẩm
      const detail = await productService.getProductById(product.id);
      setSelectedProduct(detail || product);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching product details:', error);
      // Fallback: sử dụng product từ danh sách
      setSelectedProduct(product);
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const handleEditProduct = async (product: Product) => {
    // Gọi API lấy chi tiết sản phẩm để lấy đủ các trường đặc thù
    try {
      const detail = await productService.getProductById(product.id);
      setEditingProduct(detail || product);
      setShowEditModal(true);
    } catch (error) {
      setEditingProduct(product);
      setShowEditModal(true);
    }
  };

  const handleSubmitEdit = async (updatedProduct: Product) => {
    if (!updatedProduct.id) return;

    // Chuẩn bị dữ liệu update với các field cơ bản của Product
    let updateData: Record<string, unknown> = {
      name: updatedProduct.name,
      description: updatedProduct.description,
      price: Number(updatedProduct.price),
      stock: Number(updatedProduct.stock),
      categoryId: updatedProduct.categoryId,
      isActive: updatedProduct.isActive
    };

    // Thêm các field đặc thù theo loại sản phẩm
    const category = updatedProduct.category?.name;
    if (category === 'Laptop') {
      updateData = {
        ...updateData,
        brand: updatedProduct.brand,
        model: updatedProduct.model,
        screenSize: updatedProduct.screenSize ? Number(updatedProduct.screenSize) : undefined,
        screenType: updatedProduct.screenType,
        resolution: updatedProduct.resolution,
        batteryLifeHours: updatedProduct.batteryLifeHours ? Number(updatedProduct.batteryLifeHours) : undefined,
        weightKg: updatedProduct.weightKg ? Number(updatedProduct.weightKg) : undefined,
        os: updatedProduct.os,
        ramCount: updatedProduct.ramCount ? Number(updatedProduct.ramCount) : undefined
      };
    } else if (category === 'RAM') {
      updateData = {
        ...updateData,
        brand: updatedProduct.brand,
        model: updatedProduct.model,
        capacityGb: updatedProduct.capacityGb ? Number(updatedProduct.capacityGb) : undefined,
        speedMhz: updatedProduct.speedMhz ? Number(updatedProduct.speedMhz) : undefined,
        type: updatedProduct.type
      };
    } else if (category === 'CPU') {
      updateData = {
        ...updateData,
        cores: updatedProduct.cores ? Number(updatedProduct.cores) : undefined,
        threads: updatedProduct.threads ? Number(updatedProduct.threads) : undefined,
        baseClock: updatedProduct.baseClock,
        boostClock: updatedProduct.boostClock,
        socket: updatedProduct.socket,
        architecture: updatedProduct.architecture,
        tdp: updatedProduct.tdp ? Number(updatedProduct.tdp) : undefined,
        integratedGraphics: updatedProduct.integratedGraphics
      };
    } else if (category === 'GPU') {
      updateData = {
        ...updateData,
        brand: updatedProduct.brand,
        model: updatedProduct.model,
        vram: updatedProduct.vram ? Number(updatedProduct.vram) : undefined,
        chipset: updatedProduct.chipset,
        memoryType: updatedProduct.memoryType,
        lengthMm: updatedProduct.lengthMm ? Number(updatedProduct.lengthMm) : undefined
      };
    } else if (category === 'Monitor') {
      updateData = {
        ...updateData,
        brand: updatedProduct.brand,
        model: updatedProduct.model,
        sizeInch: updatedProduct.sizeInch ? Number(updatedProduct.sizeInch) : undefined,
        resolution: updatedProduct.resolution,
        panelType: updatedProduct.panelType,
        refreshRate: updatedProduct.refreshRate ? Number(updatedProduct.refreshRate) : undefined
      };
    } else if (category === 'Motherboard') {
      updateData = {
        ...updateData,
        brand: updatedProduct.brand,
        model: updatedProduct.model,
        socket: updatedProduct.socket,
        chipset: updatedProduct.chipset,
        formFactor: updatedProduct.formFactor,
        ramSlots: updatedProduct.ramSlots ? Number(updatedProduct.ramSlots) : undefined,
        maxRam: updatedProduct.maxRam ? Number(updatedProduct.maxRam) : undefined
      };
    }

    // Loại bỏ các field undefined
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });
    try {
      const result = await productService.updateProduct(updatedProduct.id, updateData);
      if (result) {
        const productsData = await productService.getAllProductsIncludingOutOfStock();
        setProducts(Array.isArray(productsData) ? productsData : []);
        setShowEditModal(false);
        setEditingProduct(null);
        showNotification('Product updated successfully!', 'success');
      } else {
        showNotification('Failed to update product. Please try again!', 'error');
      }
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.response?.data?.message || err?.message || '';
      if (message.toLowerCase().includes('already exists')) {
        showNotification('Product name already exists. Please choose another name.', 'error');
      } else if (message.includes('Price must be greater than 0')) {
        showNotification('Price must be greater than 0.', 'error');
      } else if (message.includes('Stock cannot be negative')) {
        showNotification('Stock cannot be negative.', 'error');
      } else if (message.toLowerCase().includes('network')) {
        showNotification('Network error. Please try again later.', 'error');
      } else if (message) {
        showNotification(message, 'error');
      } else {
        showNotification('An unknown error occurred while updating the product.', 'error');
      }
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!window.confirm(`Are you sure you want to delete the product "${product.name}"?`)) return;
    try {
      const result = await productService.updateProduct(product.id, { isActive: false });
      if (result) {
        const productsData = await productService.getAllProductsIncludingOutOfStock();
        setProducts(Array.isArray(productsData) ? productsData : []);
        showNotification('Product deleted (deactivated) successfully!', 'success');
      } else {
        showNotification('Failed to deactivate product. Please try again!', 'error');
      }
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.response?.data?.message || err?.message || '';
      if (message.toLowerCase().includes('not found')) {
        showNotification('Product not found. It may have already been deleted.', 'error');
      } else if (message.toLowerCase().includes('network')) {
        showNotification('Network error. Please try again later.', 'error');
      } else if (message) {
        showNotification(message, 'error');
      } else {
        showNotification('An unknown error occurred while deleting the product.', 'error');
      }
    }
  };

  const handleAddProduct = () => {
    setShowAddModal(true);
  };

  const handleSubmitAdd = async (newProduct: Partial<Product>) => {
    try {
      const result = await productService.createProduct(newProduct);
      if (result) {
        const productsData = await productService.getAllProductsIncludingOutOfStock();
        setProducts(Array.isArray(productsData) ? productsData : []);
        setShowAddModal(false);
        showNotification('Product added successfully!', 'success');
      } else {
        showNotification('Failed to add product. Please try again!', 'error');
      }
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.response?.data?.message || err?.message || '';
      if (message.toLowerCase().includes('already exists')) {
        showNotification('Product name already exists. Please choose another name.', 'error');
      } else if (message.includes('Price must be greater than 0')) {
        showNotification('Price must be greater than 0.', 'error');
      } else if (message.includes('Stock cannot be negative')) {
        showNotification('Stock cannot be negative.', 'error');
      } else if (message.toLowerCase().includes('network')) {
        showNotification('Network error. Please try again later.', 'error');
      } else if (message) {
        showNotification(message, 'error');
      } else {
        showNotification('An unknown error occurred while adding the product.', 'error');
      }
    }
  };

  const exportToExcel = () => {
    try {
      // Chuẩn bị dữ liệu để export
      const exportData = products.map(product => ({
        Name: product.name || '',
        Image: product.images && product.images.length > 0 ? product.images[0].url : 'No Image',
        Category: product.category?.name || 'Unknown',
        Stock: product.stock || 0,
        Price: product.price ? new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND'
        }).format(product.price) : 'N/A'
      }));

      // Tạo workbook và worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Đặt tên cho worksheet
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

      // Tạo tên file với timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const fileName = `products_export_${timestamp}.xlsx`;

      // Export file
      XLSX.writeFile(workbook, fileName);
      
      showNotification('Data exported successfully!', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      showNotification('Failed to export data. Please try again.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 rounded-lg p-6 mb-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div className="text-left mt-[10px]">
            <h1 className="text-3xl font-bold text-white text-left">Product Management</h1>
            <p className="text-red-200 mt-1 text-left">Manage inventory and product information</p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* <button className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all duration-200">
              <Download size={18} className="text-white" />
              <span className="text-white font-medium">Import Data</span>
            </button> */}
            <button 
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all duration-200"
              onClick={exportToExcel}
            >
              <Upload size={18} className="text-white" />
              <span className="text-white font-medium">Export Data</span>
            </button>
            <button className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-all duration-200" onClick={handleAddProduct}>
              <Plus size={18} className="text-white" />
              <span className="text-white font-medium">Add Product</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {CATEGORY_FILTERS.map(cat => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
          
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="in_stock">In Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
          
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            value={priceSort}
            onChange={(e) => setPriceSort(e.target.value)}
          >
            <option value="none">Sort by Price</option>
            <option value="asc">Price: Low to High</option>
            <option value="desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
        {paginatedProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col h-full">
            {(product.images && product.images.length > 0 && product.images[0].url) ? (
              <img 
                src={product.images[0].url} 
                alt={product.name}
                className="w-full h-60 object-contain"
                style={{ background: '#f8f8f8', objectFit: 'contain', maxHeight: 240 }}
              />
            ) : (
              <div className="w-full h-60 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-sm">No Image</span>
              </div>
            )}
            <div className="flex-1 flex flex-col justify-between p-4">
              <h3 className="font-semibold text-gray-900 mb-2 text-center text-xl line-clamp-2">{product.name}</h3>
              <div className="flex flex-col gap-2 mt-auto">
                <div className="flex items-center justify-between mb-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(product.category?.name || '')}`}>{product.category?.name || 'Unknown'}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.stock)}`}>{getStatusText(product.stock)}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-red-600">{formatPrice(product.price)}</span>
                  <span className="text-sm text-gray-600">Stock: {product.stock}</span>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md transition-colors flex items-center justify-center" onClick={() => handleViewProduct(product)}>
                    <Eye size={16} className="mr-1" />
                    View
                  </button>
                  <button className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-3 rounded-md transition-colors flex items-center justify-center" onClick={() => handleEditProduct(product)}>
                    <Edit size={16} className="mr-1" />
                    Edit
                  </button>
                  <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-md transition-colors flex items-center justify-center" onClick={() => handleDeleteProduct(product)}>
                    <Trash2 size={16} className="mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No products message */}
      {filteredAndSortedProducts.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
        </div>
      )}

      {/* Pagination */}
      <div className="bg-white rounded-lg shadow-lg p-6 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {paginatedProducts.length} of {filteredAndSortedProducts.length} results
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </button>
          {getPageNumbers().map((page, idx) =>
            typeof page === 'number' ? (
              <button
                key={page}
                className={`px-3 py-1 rounded-md ${page === currentPage ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ) : (
              <span key={"ellipsis-" + idx} className="px-2 text-gray-400 font-bold">...</span>
            )
          )}
          <button
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <ProductDetailAdminModal
        isOpen={showModal}
        onClose={handleCloseModal}
        product={selectedProduct}
        onEdit={handleEditProduct}
      />

      {showEditModal && editingProduct && (
        <ProductEditAdminModal
          isOpen={showEditModal}
          onClose={() => { setShowEditModal(false); setEditingProduct(null); }}
          product={editingProduct}
          onSubmit={handleSubmitEdit}
        />
      )}

      <ProductAddAdminModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleSubmitAdd}
        categories={categories}
      />
    </div>
  );
};

export default ProductManagement; 