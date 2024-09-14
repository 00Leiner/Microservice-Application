import React from 'react';
import AppHeader from '../../components/AppHeader';
import '../../styles/Saved.css';

const Saved: React.FC = () => {
  // Mock data for saved locations
  const savedLocations = [
    { id: 1, name: 'New York', country: 'USA' },
    { id: 2, name: 'London', country: 'UK' },
    { id: 3, name: 'Tokyo', country: 'Japan' },
  ];

  return (
    <div className="saved-page">
      <AppHeader />
      <main className="saved-content">
        <h2 className="page-title">Saved Locations</h2>
        <div className="saved-locations-list">
          {savedLocations.map((location) => (
            <div key={location.id} className="saved-location-item">
              <span className="location-name">{location.name}</span>
              <span className="location-country">{location.country}</span>
              <button className="btn btn-view">View Weather</button>
              <button className="btn btn-remove">Remove</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Saved;
