import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/AppHeader.css';

const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth(); 

  const handleLogout = () => {
    logout();
    navigate('/login'); 
  };

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login'); 
    }
  }, [isAuthenticated, navigate]);

  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="header-title">Weather Dashboard</h1>
        <nav className="header-nav">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/saved" className="nav-link">Saved</Link>
          <Link to="/profile" className="nav-link">Profile</Link>
        </nav>
        <button className="logout-button" aria-label="Logout" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </header>
  );
};

export default AppHeader;
