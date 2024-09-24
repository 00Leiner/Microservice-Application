import api from '../api/api';

export interface LoginCredentials {
  login: string;
  password: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

const AuthService = {
  login: async (credentials: LoginCredentials) => {
    try {
      const response = await api.post('/users/login', credentials);
      return response.data; 
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('An error occurred during login. Please try again.');
      }
    }
  },

  signup: async (userData: SignupData) => {
    try {
      const response = await api.post('/users/register', userData);
      return response.data; 
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('An error occurred during signup. Please try again.');
      }
    }
  },

  googleLogin: async (credential: string) => {
    try {
      const response = await api.post('/users/google-login', { credential });
      return response.data; 
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('An error occurred during Google login. Please try again.');
      }
    }
  },

  googleSignup: async (credential: string) => {
    try {
      const response = await api.post('/users/google-signup', { credential });
      return response.data; 
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('An error occurred during Google signup. Please try again.');
      }
    }
  },
};

export default AuthService;
