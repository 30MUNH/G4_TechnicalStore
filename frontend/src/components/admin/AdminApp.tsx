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

function AdminApp() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!isAuthenticated()) {
        navigate('/login', { replace: true });
        return;
      }

      // Kiểm tra role từ user data hiện tại trước
      const isAdminFromCurrentUser = user && (
        user.role === 'admin' || 
        user.role === 'manager' ||
        (user.role && typeof user.role === 'object' && user.role.name && (
          user.role.name === 'admin' || 
          user.role.name === 'manager'
        ))
      );

      if (isAdminFromCurrentUser) {
        console.log('✅ Admin access granted from current user data');
        return;
      }

      // Nếu không có user data hoặc không phải admin, thử fetch từ API
      try {
        const userProfile = await authService.getUserProfile();
        const userData = userProfile.data || userProfile;
        
        const isAdmin = userData && (
          userData.role === 'admin' || 
          userData.role === 'manager' ||
          (userData.role && userData.role.name && (
            userData.role.name === 'admin' || 
            userData.role.name === 'manager'
          ))
        );

        if (!isAdmin) {
          console.log('❌ Access denied - not admin');
          navigate('/', { replace: true });
        } else {
          console.log('✅ Admin access granted from API');
        }
      } catch (error) {
        console.error('❌ Error checking admin access:', error);
        navigate('/', { replace: true });
      }
    };

    checkAdminAccess();
  }, [isAuthenticated, navigate, user]);

  const role = typeof user?.role === 'object' && user?.role?.name ? user.role.name : (typeof user?.role === 'string' ? user.role : 'admin');
  const renderContent = () => {
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
      default:
        return <AdminDashboard />;
    }
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