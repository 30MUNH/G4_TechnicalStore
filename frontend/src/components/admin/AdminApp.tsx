import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminDashboard from './AdminDashboard';
import CustomerManagement from '../CustomerManager/CustomerManagement.jsx';
import AccountManagement from '../AccountManager/AccountManagement.jsx';
import ProductManagement from './ProductManagement';
import ShipperManagement from '../ShipperManager/ShipperManagement.jsx';
import OrderManagement from '../OrderManager/OrderManagement.jsx';
import FeedbackManagement from './FeedbackManagement';

function AdminApp() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { user, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (hasChecked) return; // Tránh check lại nhiều lần
      
      if (!isAuthenticated()) {
        navigate('/login', { replace: true });
        return;
      }

      if (!user) {
        console.log('🔄 [AdminApp] No user yet, waiting...');
        return;
      }

      try {
        console.log('🔄 [AdminApp] Fetching user profile for role...');
        const userProfile = await authService.getUserProfile();
        const userData = userProfile.data || userProfile;
        console.log('🔍 [AdminApp] Fetched user profile:', userData);
        
        // Kiểm tra quyền truy cập
        let role = null;
        if (userData?.role) {
          if (typeof userData.role === 'object' && userData.role.name) {
            role = userData.role.name.toLowerCase();
          } else if (typeof userData.role === 'string') {
            role = userData.role.toLowerCase();
          }
        }

        console.log('🔍 [AdminApp] Extracted role:', role);

        if (!role || !['admin', 'manager', 'staff', 'shipper'].includes(role)) {
          console.log('❌ [AdminApp] Invalid role, redirecting to home');
          navigate('/', { replace: true });
          return;
        }

        // Update user trong AuthContext với role
        const updatedUser = { 
          ...user, 
          role: userData.role 
        };
        console.log('✅ [AdminApp] Updating user with role:', updatedUser);
        
        // Sử dụng login để update user với role
        const token = localStorage.getItem('authToken');
        if (token) {
          login(updatedUser, token);
        }
        
        setHasChecked(true);
      } catch (error) {
        console.error('❌ [AdminApp] Error fetching user profile:', error);
        navigate('/', { replace: true });
      }
    };

    checkAdminAccess();
  }, [isAuthenticated, navigate, user, hasChecked, login]);

  // Lấy role an toàn
  let role = null;
  if (user?.role) {
    if (typeof user.role === 'object' && user.role.name) {
      role = user.role.name.toLowerCase();
    } else if (typeof user.role === 'string') {
      role = user.role.toLowerCase();
    }
  }

  // Restrict accessible sections for each role
  useEffect(() => {
    if (!role) return;
    
    if (role === 'admin') {
      // Admin: có thể truy cập tất cả, không cần redirect
    } else if (role === 'manager') {
      // Manager: chỉ có thể truy cập customers
      if (activeSection !== 'customers') {
        setActiveSection('customers');
      }
    } else if (role === 'shipper') {
      // Shipper: chỉ có thể truy cập shippers
      if (activeSection !== 'shippers') {
        setActiveSection('shippers');
      }
    } else if (role === 'staff') {
      // Staff: có thể truy cập products, customers, orders, shippers, feedbacks
      if (!['products', 'customers', 'orders', 'shippers', 'feedbacks'].includes(activeSection)) {
        setActiveSection('products');
      }
    }
  }, [role, activeSection]);

  // Chỉ hiển thị loading nếu chưa check hoặc chưa có role
  if (!hasChecked || !role) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
          <p className="text-gray-400 text-sm mt-2">User: {user?.username || 'Loading...'}</p>
          <p className="text-gray-400 text-sm">Role: {role || 'Loading...'}</p>
          <p className="text-gray-400 text-sm">Checked: {hasChecked ? 'Yes' : 'No'}</p>
        </div>
      </div>
    );
  }

  console.log('🔍 [AdminApp] Rendering with user:', user);
  console.log('🔍 [AdminApp] Rendering with role:', role);

  const renderContent = () => {
    if (role === 'admin') {
      // Admin: có thể truy cập tất cả các mục
      switch (activeSection) {
        case 'dashboard':
          return <AdminDashboard />;
        case 'customers':
          return <CustomerManagement />;
        case 'accounts':
          return <AccountManagement />;
        case 'products':
          return <ProductManagement />;
        case 'shippers':
          return <ShipperManagement />;
        case 'orders':
          return <OrderManagement role={role} />;
        case 'feedbacks':
          return <FeedbackManagement />;
        default:
          return <AdminDashboard />;
      }
    } else if (role === 'manager') {
      // Manager: chỉ render CustomerManagement
      return <CustomerManagement />;
    } else if (role === 'shipper') {
      // Shipper: chỉ render ShipperManagement
      return <ShipperManagement />;
    } else if (role === 'staff') {
      // Staff: render theo activeSection nhưng giới hạn
      switch (activeSection) {
        case 'products':
          return <ProductManagement />;
        case 'customers':
          return <CustomerManagement />;
        case 'orders':
          return <OrderManagement role={role} />;
        case 'shippers':
          return <ShipperManagement />;
        case 'feedbacks':
          return <FeedbackManagement />;
        default:
          return <ProductManagement />;
      }
    }
    // Fallback
    return <AdminDashboard />;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default AdminApp; 