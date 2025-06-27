import React, { useState, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./SalesDashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SalesDashboard = () => {
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipping: 0,
    delivered: 0,
    cancelled: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderStatistics();
  }, []);

  const fetchOrderStatistics = async () => {
    try {
      setLoading(true);
      // Note: This endpoint requires authentication, so you'll need to include auth headers
      const response = await fetch('/api/orders/statistics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrderStats(data.statistics || data);
      } else {
        console.log('No order data available or authentication required');
        // Use default values if no data or auth issues
        setOrderStats({
          total: 0,
          pending: 0,
          processing: 0,
          shipping: 0,
          delivered: 0,
          cancelled: 0
        });
      }
    } catch (error) {
      console.error('Error fetching order statistics:', error);
      setError('Failed to load order statistics');
      // Use default values on error
      setOrderStats({
        total: 0,
        pending: 0,
        processing: 0,
        shipping: 0,
        delivered: 0,
        cancelled: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const customerTrafficData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Unique Customers",
        data: [200, 300, 250, 400, 350, 500],
        borderColor: "#ff6384",
        fill: false,
      },
      {
        label: "New Customers",
        data: [150, 200, 180, 300, 280, 400],
        borderColor: "#36a2eb",
        fill: false,
      },
      {
        label: "Returning Customers",
        data: [50, 100, 70, 100, 70, 100],
        borderColor: "#cc65fe",
        fill: false,
      },
    ],
  };

  const orderStatusData = {
    labels: ["Pending", "Processing", "Shipping", "Delivered", "Cancelled"],
    datasets: [
      {
        label: "Orders by Status",
        data: [
          orderStats.pending,
          orderStats.processing,
          orderStats.shipping,
          orderStats.delivered,
          orderStats.cancelled
        ],
        backgroundColor: [
          "#ff6384", // Pending - Red
          "#36a2eb", // Processing - Blue
          "#ffce56", // Shipping - Yellow
          "#4bc0c0", // Delivered - Green
          "#9966ff"  // Cancelled - Purple
        ],
      },
    ],
  };

  const salesTargetVsActualData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Target Sales",
        data: [300, 400, 350, 500, 450, 600],
        backgroundColor: "#36a2eb",
      },
      {
        label: "Actual Sales",
        data: [250, 350, 300, 450, 400, 550],
        backgroundColor: "#ffce56",
      },
    ],
  };

  const inventoryLevelsData = {
    labels: ["Level 1", "Level 2", "Level 3", "Level 4"],
    datasets: [
      {
        label: "Inventory",
        data: [400, 300, 200, 100],
        backgroundColor: "#36a2eb",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar min-h-screen">
        <h2>
          <a href="HomePage.html">
          <span style={{ color: "red" }}>T</span>echnical Store
          </a>
        </h2>
        <a href="SalesDashboard.jsx" className="active">
          Dashboard
        </a>
        <a href="#">
          Order
        </a>
        <a href="#">
          Payment
        </a>
        <a href="#">
          Products
        </a>
        <a href="#">
          FeedBack
        </a>
        <a href="#">
          Settings
        </a>
        <a href="#">
          Sign Out
        </a>
      </div>
      <div className="content">
        <div className="header">
          <h1>Dashboard</h1>
          <input type="text" placeholder="Search here..." />
          <div className="profile">
            <span>Manager</span>
          </div>
        </div>
        
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            Loading order statistics...
          </div>
        )}
        
        {error && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
            {error}
          </div>
        )}
        
        <div className="card-container">
          <div className="card">
            <h3>Total Orders</h3>
            <p>{orderStats.total}</p>
          </div>
          <div className="card">
            <h3>Pending Orders</h3>
            <p>{orderStats.pending}</p>
          </div>
          <div className="card">
            <h3>Processing Orders</h3>
            <p>{orderStats.processing}</p>
          </div>
          <div className="card">
            <h3>Delivered Orders</h3>
            <p>{orderStats.delivered}</p>
          </div>
        </div>
        
        <div className="chart-container">
          <div className="chart">
            <Bar
              data={orderStatusData}
              options={{
                ...chartOptions,
                plugins: { title: { text: "Orders by Status" } },
              }}
            />
          </div>
          <div className="chart">
            <Line
              data={customerTrafficData}
              options={{
                ...chartOptions,
                plugins: { title: { text: "Customer Traffic" } },
              }}
            />
          </div>
          <div className="chart">
            <Bar
              data={salesTargetVsActualData}
              options={{
                ...chartOptions,
                plugins: { title: { text: "Sales Target vs Actual" } },
              }}
            />
          </div>
        </div>
        
        {/* Additional order details section */}
        <div style={{ marginTop: '20px', padding: '20px', backgroundColor: 'white', borderRadius: '10px' }}>
          <h3>Order Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '15px' }}>
            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff6384', margin: '0 0 10px 0' }}>Pending</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>{orderStats.pending}</p>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ color: '#36a2eb', margin: '0 0 10px 0' }}>Processing</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>{orderStats.processing}</p>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ color: '#ffce56', margin: '0 0 10px 0' }}>Shipping</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>{orderStats.shipping}</p>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ color: '#4bc0c0', margin: '0 0 10px 0' }}>Delivered</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>{orderStats.delivered}</p>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h4 style={{ color: '#9966ff', margin: '0 0 10px 0' }}>Cancelled</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>{orderStats.cancelled}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
