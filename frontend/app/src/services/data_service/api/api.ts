import axios from 'axios';

const API = `http://localhost:8000/api/userData/locations/${localStorage.getItem('userId')}`; 

const api = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (localStorage.getItem('token')) {
    config.headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
  }
  return config;
});

export default api;
