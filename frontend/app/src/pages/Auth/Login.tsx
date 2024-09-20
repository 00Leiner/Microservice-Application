import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      const response = await AuthService.login({ login: loginInput, password });
      login(response.token, response.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  const handleGoogleAuth = async (credentialResponse: any) => {
    try {
      const authResponse = await AuthService.googleLogin(credentialResponse.credential);
      login(authResponse.token, authResponse.user);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Google auth error:', err);
      setError(err.message || 'An error occurred during Google authentication');
    }
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
        <GoogleLogin
          onSuccess={handleGoogleAuth}
          onError={() => {
            console.error('Login Failed');
            setError('Google login failed. Please try again.');
          }}
          useOneTap={false}
          ux_mode="popup"
          text="signin_with"
          locale="fil"
        />
      </div>
      <p className="signup-link">
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
};

export default Login;
