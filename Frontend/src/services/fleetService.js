import axios from 'axios';

// Instancia para AUTOBUSES
const apiFlota = axios.create({
  baseURL: import.meta.env.VITE_API_AUTOBUS_URL || 'http://localhost:8002',
  headers: { 'Content-Type': 'application/json' },
});

// Instancia para CONDUCTORES
const apiConductores = axios.create({
  baseURL: import.meta.env.VITE_API_CONDUCTORES_URL || 'http://localhost:8003',
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para Token
const addAuth = (config) => {
  const token = localStorage.getItem('routesense_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};

apiFlota.interceptors.request.use(addAuth);
apiConductores.interceptors.request.use(addAuth);

export const fleetService = {
  // --- AUTOBUSES ---
  getBuses: async () => {
    try {
      const response = await apiFlota.get('/buses/');
      return response.data;
    } catch (error) { return []; }
  },
  createBus: async (data) => {
    try {
      const response = await apiFlota.post('/buses/', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || error.message);
    }
  },
  updateBus: async (id, data) => {
    try {
      const response = await apiFlota.put(`/buses/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || error.message);
    }
  },
  deleteBus: async (id) => {
    try {
      const response = await apiFlota.delete(`/buses/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || error.message);
    }
  },

  // --- CONDUCTORES ---
  getDrivers: async () => {
    try {
      const response = await apiConductores.get('/conductores/');
      return response.data;
    } catch (error) { return []; }
  },
  createDriver: async (data) => {
    try {
      const response = await apiConductores.post('/conductores/', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || error.message);
    }
  },
  updateDriver: async (id, data) => {
    try {
      const response = await apiConductores.put(`/conductores/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || error.message);
    }
  },
  deleteDriver: async (id) => {
    try {
      const response = await apiConductores.delete(`/conductores/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || error.message);
    }
  },

  loginDriver: async (matricula, nombre, password) => {
    try {
      const response = await apiConductores.post('/conductores/login', {
        licencia: matricula,
        nombre_completo: nombre,
        password: password
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || error.message);
    }
  },

  getBusByConductor: async (conductorId) => {
    try {
      const response = await apiFlota.get(`/autobuses/conductor/${conductorId}`);
      return response.data;
    } catch (error) {
      // Si no tiene bus asignado, retornamos null
      return null;
    }
  }
};
