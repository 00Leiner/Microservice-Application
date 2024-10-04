import React, { useState, useEffect, useRef } from 'react'; 
import '../../styles/Dashboard.css';
import infoService from '../../services/weather_service/info/info';

const Dashboard: React.FC = () => {
  const [location, setLocation] = useState(''); 
  const [suggestions, setSuggestions] = useState<string[]>([]); 
  const [showSuggestions, setShowSuggestions] = useState(false); 
  const suggestionsRef = useRef<HTMLUListElement>(null); 

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
    fetchSuggestions(e.target.value);
    setShowSuggestions(true);
  };

  const fetchSuggestions = async (search: string) => {
    if (search) {
      try {
        const data = await infoService.getSuggestions(search); 
        const suggestions = data.map((item: any) => ({
          name: item.name,
          localNames: item.local_names, 
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false); 
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

          {showSuggestions && suggestions.length > 0 && ( 
            <ul className="suggestions-list" ref={suggestionsRef}> 
              {suggestions.map((suggestion: any, index) => (
                <li key={index} className="suggestion-item">
                  <i className="fa fa-search light-grey-icon"></i> {suggestion.name} ({suggestion.country})
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
