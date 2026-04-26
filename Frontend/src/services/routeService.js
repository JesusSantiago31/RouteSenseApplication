import axios from 'axios';

const apiRutas = axios.create({
  baseURL: import.meta.env.VITE_API_RUTAS_URL || 'https://routesense-rutas.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const routeService = {
  getRoutes: async () => {
    try {
      const response = await apiRutas.get('/routes');
      return response.data;
    } catch (error) {
      console.error(error);
      return [];
    }
  },
  
  getRouteDetails: async (rutaId) => {
    try {
      const response = await apiRutas.get(`/routes/${rutaId}/details`);
      return response.data;
    } catch (error) {
       console.error(error);
       return null;
    }
  }
};
