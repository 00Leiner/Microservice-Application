import api from '../api/api';

export interface UserUpdateData {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  profilePicture?: string;
}

const UserService = {
  getCurrentUser: async () => {
    const userId = localStorage.getItem('userId'); // or however you store the current user's ID
    if (!userId) {
      throw new Error('No user ID found');
    }
    return UserService.getUserDetails(userId);
  },

  getUserDetails: async (userId: string) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId: string, userData: UserUpdateData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId: string) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },
};

export default UserService;
