import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Truck,
  ShoppingCart,
  ChevronRight,
  Shield,
  MessageSquare // Thêm dòng này
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeSection, setActiveSection }) => {
  const { user } = useAuth();
  // Lấy role an toàn, không mặc định là 'admin' nếu không có role
  let role = null;
  if (user?.role) {
    if (typeof user.role === 'object' && user.role.name) {
      role = user.role.name;
    } else if (typeof user.role === 'string') {
      role = user.role;
    }
  }
  role = role ? role.toLowerCase() : 'unknown';

  console.log('🔍 [AdminSidebar] User role detected:', role);
  console.log('🔍 [AdminSidebar] User object:', user);

  let menuItems: Array<{id: string, label: string, icon: any}> = [];

  if (role === 'admin') {
    menuItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'products', label: 'Products', icon: Package },
      { id: 'customers', label: 'Customers', icon: Users },
      { id: 'accounts', label: 'Accounts', icon: Shield },
      { id: 'orders', label: 'Orders', icon: ShoppingCart },
      { id: 'shippers', label: 'Shippers', icon: Truck },
      { id: 'feedbacks', label: 'Feedbacks', icon: MessageSquare },
    ];
    console.log('✅ [AdminSidebar] Admin role - showing all menu items');
  } else if (role === 'manager') {
    menuItems = [
      { id: 'customers', label: 'Customers', icon: Users },
    ];
    console.log('✅ [AdminSidebar] Manager role - showing only Customers');
  } else if (role === 'shipper') {
    menuItems = [
      { id: 'shippers', label: 'Shippers', icon: Truck },
    ];
    console.log('✅ [AdminSidebar] Shipper role - showing only Shippers');
  } else if (role === 'staff') {
    menuItems = [
      { id: 'products', label: 'Products', icon: Package },
      { id: 'customers', label: 'Customers', icon: Users },
      { id: 'orders', label: 'Orders', icon: ShoppingCart },
      { id: 'shippers', label: 'Shippers', icon: Truck },
      { id: 'feedbacks', label: 'Feedbacks', icon: MessageSquare },
    ];
    console.log('✅ [AdminSidebar] Staff role - showing limited menu items');
  } else {
    // Không xác định được role hoặc không có quyền
    menuItems = [];
    console.log('❌ [AdminSidebar] Unknown or unauthorized role - no menu items');
  }

  console.log('🔍 [AdminSidebar] Final menu items:', menuItems.map(item => item.label));

  return (
    <div className="w-64 bg-gradient-to-b from-red-900 via-red-800 to-black shadow-xl">
      <div className="p-6 border-b border-red-700">
        <h1 className="text-2xl font-bold text-white">
          Technical Store <span className="text-red-400">Admin</span>
        </h1>
        <p className="text-red-200 text-sm mt-1">Hardware Management</p>
      </div>
      <nav className="mt-6">
        {menuItems.length === 0 ? (
          <div className="text-red-200 px-6 py-4">No permission</div>
        ) : (
          menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`
                  w-full flex items-center justify-between px-6 py-4 text-left transition-all duration-200
                  ${isActive 
                    ? 'bg-red-700 text-white border-r-4 border-red-400' 
                    : 'text-red-100 hover:bg-red-800 hover:text-white'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {isActive && <ChevronRight size={16} className="text-red-400" />}
              </button>
            );
          })
        )}
      </nav>
    </div>
  );
};

export default AdminSidebar; 
 