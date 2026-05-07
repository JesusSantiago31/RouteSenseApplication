import axios from 'axios';

const apiClientes = axios.create({
  baseURL: import.meta.env.VITE_API_CLIENTES_URL || 'https://routesense-clientes.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const userService = {
  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await apiClientes.post('/clients/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data;
  },

  register: async (userData) => {
    // userData: { nombre, apellido, email, password }
    const response = await apiClientes.post('/clients/register', userData);
    return response.data;
  },

  getProfile: async (token) => {
    const response = await apiClientes.get('/clients/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
};
