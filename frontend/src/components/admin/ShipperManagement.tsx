import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Upload, 
  Plus, 
  Search,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone
} from 'lucide-react';

const ShipperManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const shippers = [
    {
      id: 1,
      name: 'David Miller',
      phone: '+1-555-0123',
      email: 'david.miller@email.com',
      vehicle: 'Motorcycle',
      area: 'Downtown, NYC',
      status: 'Active',
      orders: 45,
      rating: 4.8
    },
    {
      id: 2,
      name: 'Emma Davis',
      phone: '+1-555-0124',
      email: 'emma.davis@email.com',
      vehicle: 'Small Truck',
      area: 'Midtown, NYC',
      status: 'Active',
      orders: 62,
      rating: 4.9
    },
    {
      id: 3,
      name: 'James Wilson',
      phone: '+1-555-0125',
      email: 'james.wilson@email.com',
      vehicle: 'Motorcycle',
      area: 'Brooklyn, NYC',
      status: 'On Break',
      orders: 23,
      rating: 4.5
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'On Break':
        return 'bg-yellow-100 text-yellow-800';
      case 'Suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <span key={index} className={`text-sm ${index < Math.floor(rating) ? 'text-yellow-500' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 rounded-lg p-6 mb-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all duration-200">
              <ArrowLeft size={20} className="text-white" />
              <span className="text-white font-medium">Back</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Shipper Management</h1>
              <p className="text-red-200 mt-1">Manage delivery information and performance</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all duration-200">
              <Download size={18} className="text-white" />
              <span className="text-white font-medium">Import Data</span>
            </button>
            <button className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all duration-200">
              <Upload size={18} className="text-white" />
              <span className="text-white font-medium">Export Data</span>
            </button>
            <button className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-all duration-200">
              <Plus size={18} className="text-white" />
              <span className="text-white font-medium">Add Shipper</span>
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
              placeholder="Search by name, email, phone..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="on_break">On Break</option>
            <option value="suspended">Suspended</option>
          </select>
          
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
            <option value="all">All Areas</option>
            <option value="downtown">Downtown</option>
            <option value="midtown">Midtown</option>
            <option value="brooklyn">Brooklyn</option>
          </select>
          
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
            <option value="all">All Vehicles</option>
            <option value="motorcycle">Motorcycle</option>
            <option value="truck">Small Truck</option>
          </select>
        </div>
      </div>

      {/* Shipper Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {shippers.map((shipper) => (
          <div key={shipper.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {shipper.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{shipper.name}</h3>
                  <p className="text-sm text-gray-600">ID: {shipper.id}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(shipper.status)}`}>
                {shipper.status}
              </span>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2">
                <Phone size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">{shipper.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">{shipper.area}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Vehicle:</span>
                <span className="text-sm font-medium">{shipper.vehicle}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Orders:</span>
                <span className="text-sm font-medium">{shipper.orders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Rating:</span>
                <div className="flex items-center space-x-1">
                  {renderStars(shipper.rating)}
                  <span className="text-sm text-gray-600 ml-1">({shipper.rating})</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md transition-colors flex items-center justify-center">
                <Eye size={16} className="mr-1" />
                View
              </button>
              <button className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-3 rounded-md transition-colors flex items-center justify-center">
                <Edit size={16} className="mr-1" />
                Edit
              </button>
              <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-md transition-colors flex items-center justify-center">
                <Trash2 size={16} className="mr-1" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-lg shadow-lg p-6 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing 1 to 3 of 3 results
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50">
            <ChevronLeft size={16} />
          </button>
          <span className="px-3 py-1 bg-red-600 text-white rounded-md">1</span>
          <button className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShipperManagement; 