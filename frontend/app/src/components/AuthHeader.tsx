import React from 'react';
import '../styles/AuthHeader.css';

const AuthHeader: React.FC = () => {
  return (
    <div className="auth-header-wrapper">
      <header className="auth-header">
        <div className="auth-welcome">
          <span className="auth-welcome-line"></span>
          <h1 className="auth-welcome-text">Hello! Let's Check The Weather</h1>
          <span className="auth-welcome-line"></span>
        </div>
      </header>
    </div>
  );
};

export default AuthHeader;
