import React from 'react';

interface WeatherCardProps {
  location: string;
  temperature: number;
  description: string;
  onSave?: () => void;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ location, temperature, description, onSave }) => {
  return (
    <div className="card">
      <h3>{location}</h3>
      <p>Temperature: {temperature}°C</p>
      <p>Description: {description}</p>
      {onSave && (
        <button onClick={onSave} className="btn btn-primary">
          Save Location
        </button>
      )}
    </div>
  );
};

export default WeatherCard;
