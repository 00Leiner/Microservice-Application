import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../../services/auth/auth';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Auth.css';

interface SignupProps {
  onSignup?: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSignup }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    repeatPassword: '',
  });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const validateForm = () => {
    if (formData.password !== formData.repeatPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    try {
      const response = await AuthService.signup(formData);
      login(response.token, response.user);
      onSignup?.();
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed. Please try again.');
    }
  };

  const handleGoogleResponse = async (response: any) => {
    try {
      const authResponse = await AuthService.googleAuth(response.credential);
      login(authResponse.token, authResponse.user);
      onSignup?.();
      navigate('/dashboard');
    } catch (err) {
      setError('Google signup failed');
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        {['firstName', 'lastName', 'username', 'email', 'password', 'repeatPassword'].map((field) => (
          <div className="input-group" key={field}>
            <i className={`fas fa-${field === 'email' ? 'envelope' : 'user'}`}></i>
            <input
              type={field.includes('password') ? 'password' : field === 'email' ? 'email' : 'text'}
              name={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
              value={formData[field as keyof typeof formData]}
              onChange={handleChange}
              required
              minLength={field.includes('password') ? 8 : undefined}
            />
          </div>
        ))}
        {error && <div className="error-message">{error}</div>}
        <button type="submit" className="btn btn-primary">
          Sign Up
        </button>
      </form>
      <div className="social-login">
        <div id="googleSignInDiv"></div>
      </div>
      <p className="signup-link">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Signup;