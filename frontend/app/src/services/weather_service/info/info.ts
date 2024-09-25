import api from '../api/api';

const infoService = {
    getWeather: async () => {
        const response = await api.get('/');
        return response.data;
    },
    getSuggestions: async (search: any) => {
        const response = await api.get(`/suggestions?search=${search}`);
        return response.data;
    },
    
} 

export default infoService;