import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../../services/auth/auth';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Auth.css';

const Login: React.FC = () => {
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    console.log("Client ID:", clientId);
    if (window.google && clientId) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse
      });
      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInDiv"),
        { theme: "outline", size: "large" }
      );
    } else {
      console.error("Google API not loaded or Client ID not found");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      const response = await AuthService.login({ login: loginInput, password });
      login(response.token, response.user);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  const handleGoogleResponse = async (response: any) => {
    try {
      const authResponse = await AuthService.googleAuth(response.credential);
      login(authResponse.token, authResponse.user);
      navigate('/dashboard');
    } catch (err) {
      setError('Google signup/login failed');
    }
  };

  const handleGoogleFailure = (error: any) => {
    console.error('Google login error:', error);
    setError('Google login failed');
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <i className="fas fa-user"></i>
          <input
            type="text"
            placeholder="Username or Email"
            value={loginInput}
            onChange={(e) => setLoginInput(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <i className="fas fa-lock"></i>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-footer">
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe">Remember me</label>
          </div>
          <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" className="btn btn-primary">
          Login
        </button>
      </form>
      <div className="social-login">
        <div id="googleSignInDiv"></div>
      </div>
      <p className="signup-link">
        Need an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
};

export default Login;
