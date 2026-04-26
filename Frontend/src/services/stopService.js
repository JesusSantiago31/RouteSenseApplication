import axios from 'axios';

const apiParadas = axios.create({
  baseURL: import.meta.env.VITE_API_PARADAS_URL || 'https://routesense-paradas.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiParadas.interceptors.request.use((config) => {
  const token = localStorage.getItem('routesense_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const stopService = {
  createStop: async (stopData) => {
    try {
      const response = await apiParadas.post('/stops/', stopData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || "Error al crear la parada");
    }
  },
  getStops: async () => {
    try {
      const response = await apiParadas.get('/stops/');
      return response.data;
    } catch (error) {
      return [];
    }
  }
};
