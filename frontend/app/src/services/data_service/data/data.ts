import api from '../api/api';

export interface loc {
    _id?: string;
    name?: string;
    latitude?: number;
    longitude?: number;
}

const checkUserId = () => {
    const userId = localStorage.getItem('userId'); 
    if (!userId) {
        throw new Error('No user ID found');
    }
    return userId;
}

const userDataService = {
    getAlluserData: async () => {
        checkUserId(); 
        const response = await api.get('/');
        return response.data;
    },
    getDataById: async (locId: any) => {
        checkUserId(); 
        const response = await api.get(`/${locId}`);
        return response.data;
    },
    saveData: async () => {
        checkUserId(); 
        const response = await api.post(`/add`);
        return response.data;
    },
    updateData: async (locId: any, LocInfo: loc) => {
        checkUserId(); 
        const response = await api.post(`/${locId}`, LocInfo);
        return response.data;
    },
    deleteData: async (locId: any) => {
        checkUserId(); 
        const response = await api.delete(`/${locId}`);
        return response.data;
    }
}

export default userDataService;