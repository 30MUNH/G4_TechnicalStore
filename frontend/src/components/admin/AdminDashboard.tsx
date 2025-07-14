import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Package, 
  Truck, 
  DollarSign
} from 'lucide-react';
import { productService } from '../../services/productService';
import { customerService } from '../../services/customerService';
import { shipperService } from '../../services/shipperService';
import { orderService } from '../../services/orderService';

const AdminDashboard: React.FC = () => {
  const [productCount, setProductCount] = useState<number>(0);
  const [customerCount, setCustomerCount] = useState<number>(0);
  const [shipperCount, setShipperCount] = useState<number>(0);
  const [revenue, setRevenue] = useState<number>(0);

  useEffect(() => {
    const fetchStats = async () => {
      // Lấy số lượng sản phẩm
      const products = await productService.getAllProducts();
      setProductCount(products.length);

      // Lấy số lượng khách hàng
      try {
        const customerRes = await customerService.getAllCustomers();
        let customers: any[] = [];
        if (customerRes && customerRes.success && customerRes.data) {
          // Có thể là data hoặc data.data
          customers = Array.isArray(customerRes.data) ? customerRes.data : (customerRes.data.data || []);
        }
        setCustomerCount(customers.length);
      } catch {
        setCustomerCount(0);
      }

      // Lấy số lượng shipper
      try {
        const shipperRes = await shipperService.getAllShippers();
        let shippers: any[] = [];
        if (shipperRes && shipperRes.success && shipperRes.data) {
          shippers = Array.isArray(shipperRes.data) ? shipperRes.data : (shipperRes.data.data || []);
        }
        setShipperCount(shippers.length);
      } catch {
        setShipperCount(0);
      }

      // Lấy revenue (tổng đơn hàng đã giao)
      try {
        const orderRes = await orderService.getAllOrdersForAdmin();
        let orders: any[] = [];
        if (orderRes && orderRes.data) {
          orders = Array.isArray(orderRes.data) ? orderRes.data : (orderRes.data.data || []);
        }
        // Các trạng thái hoàn thành có thể là 'Delivered', 'Đã giao', 'Hoàn thành'
        const completedStatuses = ['Delivered', 'Đã giao', 'Hoàn thành'];
        const totalRevenue = orders
          .filter((order: any) => completedStatuses.includes(order.status))
          .reduce((sum: number, order: any) => sum + (parseFloat(order.totalAmount) || 0), 0);
        setRevenue(totalRevenue);
      } catch {
        setRevenue(0);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    {
      title: 'Total Customers',
      value: customerCount.toString(),
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Products',
      value: productCount.toString(),
      icon: Package,
      color: 'bg-green-500'
    },
    {
      title: 'Shippers',
      value: shipperCount.toString(),
      icon: Truck,
      color: 'bg-yellow-500'
    },
    {
      title: 'Revenue',
      value: revenue.toLocaleString('vi-VN') + ' VND',
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