import React from 'react';
import AppHeader from '../../components/AppHeader';
import '../../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-page">
      <AppHeader />
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
        <h3 className="section-title">Saved Locations</h3>
        {/* Add saved locations list here */}
      </main>
    </div>
  );
};

export default Dashboard;
