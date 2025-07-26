import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { authService } from "../../services/authService";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminDashboard from "./AdminDashboard";
import CustomerManagement from "../CustomerManager/CustomerManagement.jsx";
import AccountManagement from "../AccountManager/AccountManagement.jsx";
import ProductManagement from "./ProductManagement";
import ShipperManagement from "../ShipperManager/ShipperManagement.jsx";
import OrderManagement from "../OrderManager/OrderManagement.jsx";

function AdminApp() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const orderManagementRef = useRef<{ fetchOrders: () => void } | null>(null);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!isAuthenticated()) {
        navigate("/login", { replace: true });
        return;
      }

      const isAdminFromCurrentUser =
        user &&
        (user.role === "admin" ||
          user.role === "manager" ||
          (user.role &&
            typeof user.role === "object" &&
            user.role.name &&
            (user.role.name === "admin" || user.role.name === "manager")));
      const isShipperFromCurrentUser =
        user &&
        (user.role === "shipper" ||
          (user.role &&
            typeof user.role === "object" &&
            user.role.name === "shipper"));

      if (isAdminFromCurrentUser) {
        return;
      }
      if (isShipperFromCurrentUser) {
        setActiveSection("orders");
        return;
      }

      try {
        const userProfile = await authService.getUserProfile();
        const userData = userProfile.data || userProfile;
        const isAdmin =
          userData &&
          (userData.role === "admin" ||
            userData.role === "manager" ||
            (userData.role &&
              userData.role.name &&
              (userData.role.name === "admin" ||
                userData.role.name === "manager")));
        const isShipper =
          userData &&
          (userData.role === "shipper" ||
            (userData.role && userData.role.name === "shipper"));
        if (!isAdmin && !isShipper) {
          navigate("/", { replace: true });
        } else if (isShipper) {
          setActiveSection("orders");
        }
      } catch (error) {
        navigate("/", { replace: true });
      }
    };

    checkAdminAccess();
  }, [isAuthenticated, navigate, user]);

  const role =
    typeof user?.role === "object" && user?.role?.name
      ? user.role.name
      : typeof user?.role === "string"
      ? user.role
      : "admin";

  useEffect(() => {
    if (role === "shipper") {
      if (activeSection !== "shippers") {
        setActiveSection("shippers");
      }
    } else if (role === "staff") {
      if (
        activeSection === "dashboard" ||
        !["products", "customers", "accounts", "orders", "shippers"].includes(
          activeSection
        )
      ) {
        setActiveSection("products");
      }
    }
  }, [role, activeSection]);

  useEffect(() => {
    if (
      activeSection === "orders" &&
      orderManagementRef.current &&
      orderManagementRef.current.fetchOrders
    ) {
      orderManagementRef.current.fetchOrders();
    }
  }, [activeSection]);

  const renderContent = () => {
    if (role === "shipper") {
      return <ShipperManagement />;
    }
    if (role === "staff") {
      switch (activeSection) {
        case "products":
          return <ProductManagement />;
        case "customers":
          return <CustomerManagement />;
        case "accounts":
          return <AccountManagement />;
        case "orders":
          return <OrderManagement ref={orderManagementRef} role={role} />;
        case "shippers":
          return <ShipperManagement />;
        default:
          return <ProductManagement />;
      }
    }
    switch (activeSection) {
      case "dashboard":
        return <AdminDashboard />;
      case "customers":
        return <CustomerManagement />;
      case "accounts":
        return <AccountManagement />;
      case "products":
        return <ProductManagement />;
      case "shippers":
        return <ShipperManagement />;
      case "orders":
        return <OrderManagement ref={orderManagementRef} role={role} />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-6 overflow-y-auto">{renderContent()}</main>
      </div>
    </div>
  );
}

export default AdminApp;
