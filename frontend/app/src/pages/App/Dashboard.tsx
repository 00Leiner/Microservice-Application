import React from 'react';
import '../../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-page">
      <main className="dashboard-content">
        <h2 className="dashboard-title">Weather Dashboard</h2>
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Enter location" 
            className="location-input" 
          />
          <button className="search-button">Search</button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
