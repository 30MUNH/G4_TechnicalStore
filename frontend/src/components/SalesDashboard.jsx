import React from "react";
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
      <div className="sidebar">
        <h2>
          <span style={{ color: "#6b48ff" }}>T</span>echnical Store
        </h2>
        <a href="#" className="active">
          <span className="icon" style={{ background: "#6b48ff" }}></span>
          Dashboard
        </a>
        <a href="#">
          <span className="icon"></span>Leaderboard
        </a>
        <a href="#">
          <span className="icon"></span>Order
        </a>
        <a href="Homepage.html" target="_blank" rel="noopener noreferrer">
          <span className="icon"></span>Homepage
        </a>
        <a href="#">
          <span className="icon"></span>Sales Report
        </a>
        <a href="#">
          <span className="icon"></span>Messages
        </a>
        <a href="#">
          <span className="icon"></span>Settings
        </a>
        <a href="#">
          <span className="icon"></span>Sign Out
        </a>
      </div>
      <div className="content">
        <div className="header">
          <h1>Dashboard</h1>
          <input type="text" placeholder="Search here..." />
          <div className="profile">
            <span>Muqif</span>
            <img src="https://via.placeholder.com/30" alt="Profile" />
          </div>
        </div>
        <div className="card-container">
          <div className="card">
            <h3>Today’s Sales</h3>
            <p>$1k</p>
          </div>
          <div className="card">
            <h3>Sales Summary</h3>
            <p>300</p>
          </div>
          <div className="card">
            <h3>Total Order</h3>
            <p>5</p>
          </div>
          <div className="card">
            <h3>New Customers</h3>
            <p>8</p>
          </div>
        </div>
        <div className="chart-container">
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
          <div className="chart">
            <Bar
              data={inventoryLevelsData}
              options={{
                ...chartOptions,
                indexAxis: "y",
                plugins: { title: { text: "Inventory Levels" } },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
