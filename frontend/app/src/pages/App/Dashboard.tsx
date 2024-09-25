import React, { useState, useEffect } from 'react'; 
import '../../styles/Dashboard.css';
import infoService from '../../services/weather_service/info/info';

const Dashboard: React.FC = () => {
  const [location, setLocation] = useState(''); 
  const [suggestions, setSuggestions] = useState<string[]>([]); 

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
    fetchSuggestions(e.target.value);
  };

  const fetchSuggestions = async (search: string) => {
    if (search) {
      try {
        const data = await infoService.getSuggestions(search); 
        const suggestions = data.map((item: any) => ({
          name: item.name,
          localNames: item.local_names, // This is an object
          country: item.country,
        }));
        setSuggestions(suggestions); 
      } catch (error) {
        console.error("Error fetching suggestions:", error); 
        setSuggestions([]); 
      }
    } else {
      setSuggestions([]); 
    }
  };

  return (
    <div className="dashboard-page">
      <main className="dashboard-content">
        <div className="search-container">
          <div className='search'>
            <input 
              type="text" 
              placeholder="Enter location" 
              className="location-input" 
              value={location}
              onChange={handleInputChange} 
            />
            <button className="search-button"><i className="fa fa-search"></i></button>
          </div>
          {suggestions.length > 0 && ( 
            <ul className="suggestions-list"> 
              {suggestions.map((suggestion: any, index) => (
                <li key={index} className="suggestion-item">
                  {suggestion.name} ({suggestion.country})
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
