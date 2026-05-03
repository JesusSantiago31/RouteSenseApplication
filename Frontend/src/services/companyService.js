import axios from 'axios';

const apiEmpresas = axios.create({
  baseURL: import.meta.env.VITE_API_AUTOBUS_URL || 'http://localhost:8002', // Ajustar según el puerto de Autobus
  headers: {
    'Content-Type': 'application/json',
  },
});

apiEmpresas.interceptors.request.use((config) => {
  const token = localStorage.getItem('routesense_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const companyService = {
  createCompany: async (companyData) => {
    try {
      const response = await apiEmpresas.post('/companies/', companyData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || "Error al registrar la empresa");
    }
  },
  getCompanies: async () => {
    try {
      const response = await apiEmpresas.get('/companies/');
      return response.data;
    } catch (error) {
      return [];
    }
  },
  deleteCompany: async (companyId) => {
    try {
      const response = await apiEmpresas.delete(`/companies/${companyId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || "Error al eliminar la empresa");
    }
  }
};
