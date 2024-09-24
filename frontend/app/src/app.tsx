import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthHeader from './components/AuthHeader';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Dashboard from './pages/App/Dashboard';
import Profile from './pages/App/Profile';
import Saved from './pages/App/Saved';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AppHeader from './components/AppHeader';

const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

const RedirectIfAuthenticated: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : element;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<RedirectIfAuthenticated element={<><AuthHeader /><Login /></>} />} />
      <Route path="/signup" element={<RedirectIfAuthenticated element={<><AuthHeader /><Signup /></>} />} />
      <Route path="/dashboard" element={<ProtectedRoute element={<><AppHeader /><Dashboard /></>} />} />
      <Route path="/saved" element={<ProtectedRoute element={<><AppHeader /><Saved /></>} />} />
      <Route path="/profile" element={<ProtectedRoute element={<><AppHeader /><Profile /></>} />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID!}>
      <AuthProvider>
        <Router>
          <div className="app">
            <AppRoutes />
          </div>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
