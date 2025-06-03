import React from "react";
import "./SalesDashboard.css";

const SalesDashboard = () => {
  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="icon">🖥️</div>
        <div className="icon">💻</div>
        <div className="icon">📷</div>
        <div className="icon">🧩</div>
      </div>

      {/* Content */}
      <div className="content">
        <h2>Technical Store Dashboard</h2>

        {/* Top Summary Cards */}
        <div className="top-row">
          <div className="card">
            <h3>Monthly Sales</h3>
            <div className="chart-line">
              <div className="line"></div>
            </div>
            <p>$23,000</p>
          </div>
          <div className="card">
            <h3>Profits</h3>
            <div className="pie-chart"></div>
            <p>$5,000</p>
          </div>
          <div className="card">
            <h3>Visitors</h3>
            <div className="chart-line">
              <div className="line half"></div>
            </div>
            <p>12,345</p>
          </div>
        </div>

        {/* Daily Visitors Chart */}
        <div className="card">
          <h3>Daily Store Visitors</h3>
          <div className="bar-chart">
            {Array.from({ length: 20 }).map((_, idx) => (
              <div
                key={idx}
                className="bar"
                style={{ height: `${40 + (idx % 5) * 10}px` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Category Summary */}
        <div className="categories">
          <h3>Categories</h3>
          <div className="grid">
            {["CPU: 50", "Computer: 70", "Laptop: 90", "Camera: 30"].map(
              (item, idx) => (
                <div key={idx} className="mini-card">
                  <h4>{item.split(":")[0]}</h4>
                  <p>{item.split(":")[1]}</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
