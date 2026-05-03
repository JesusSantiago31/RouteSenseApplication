import axios from 'axios';

const apiFlota = axios.create({
  baseURL: import.meta.env.VITE_API_AUTOBUS_URL || 'http://localhost:8002',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiFlota.interceptors.request.use((config) => {
  const token = localStorage.getItem('routesense_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const fleetService = {
  // --- AUTOBUSES ---
  getBuses: async () => {
    try {
      const response = await apiFlota.get('/buses/');
      return response.data;
    } catch (error) { return []; }
  },
  createBus: async (data) => {
    const response = await apiFlota.post('/buses/', data);
    return response.data;
  },
  updateBus: async (id, data) => {
    const response = await apiFlota.put(`/buses/${id}`, data);
    return response.data;
  },
  deleteBus: async (id) => {
    const response = await apiFlota.delete(`/buses/${id}`);
    return response.data;
  },

  // --- CONDUCTORES ---
  getDrivers: async () => {
    try {
      const response = await apiFlota.get('/conductores/');
      return response.data;
    } catch (error) { return []; }
  },
  createDriver: async (data) => {
    const response = await apiFlota.post('/conductores/', data);
    return response.data;
  },
  updateDriver: async (id, data) => {
    const response = await apiFlota.put(`/conductores/${id}`, data);
    return response.data;
  },
  deleteDriver: async (id) => {
    const response = await apiFlota.delete(`/conductores/${id}`);
    return response.data;
  }
};
