import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login, signup, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (password !== confirmPassword) {
          alert("Passwords don't match");
          return;
        }
        await signup(email, password);
      }
      navigate('/dashboard');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <div className="container">
      <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        {!isLogin && (
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            required
          />
        )}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Loading...' : (isLogin ? 'Login' : 'Sign Up')}
        </button>
      </form>
      <div className="toggle-form">
        <button onClick={() => setIsLogin(!isLogin)} disabled={isLoading}>
          {isLogin ? 'Need an account? Sign up' : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
