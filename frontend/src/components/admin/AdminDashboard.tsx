import React from 'react';
import { 
  Users, 
  Package, 
  Truck, 
  DollarSign
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const stats = [
    {
      title: 'Total Customers',
      value: '500',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Products',
      value: '100',
      icon: Package,
      color: 'bg-green-500'
    },
    {
      title: 'Shippers',
      value: '15',
      icon: Truck,
      color: 'bg-yellow-500'
    },
    {
      title: 'Revenue',
      value: '50.000.000 VND',
      icon: DollarSign,
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 rounded-lg p-6 mb-6 shadow-xl">
        <div className="text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-red-200">Technical Store management system overview</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-2xl shadow-lg p-12 hover:shadow-2xl transition-shadow min-h-[220px] flex flex-row items-center justify-between">
              <div className="flex flex-col items-start justify-center flex-1">
                <p className="text-xl font-semibold text-gray-600 mb-4">{stat.title}</p>
                <p className="text-5xl font-extrabold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} w-36 h-36 rounded-full flex items-center justify-center ml-8`}>
                <Icon size={72} className="text-white" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDashboard; 