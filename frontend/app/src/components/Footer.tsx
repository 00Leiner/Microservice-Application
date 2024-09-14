import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer style={{ backgroundColor: '#f0f0f0', padding: '10px 0', textAlign: 'center' }}>
      <div className="container">
        <p>&copy; 2023 Weather Dashboard. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
