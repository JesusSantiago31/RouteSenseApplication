import apiAdmin from '../api/config';

export const adminService = {
  login: async (email, password) => {
    // La API de FastAPI de Auth2Password usa form-data (application/x-www-form-urlencoded)
    const formData = new URLSearchParams();
    formData.append('username', email); // FASTAPI usa 'username'
    formData.append('password', password);

    try {
      const response = await apiAdmin.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      return response.data;
    } catch (error) {
      if (error.response) {
         throw new Error(error.response.data.detail || "Error al autenticar");
      }
      throw new Error("No se pudo conectar al servidor");
    }
  },

  getProfile: async () => {
    try {
      const response = await apiAdmin.get('/admin/me');
      return response.data;
    } catch (error) {
       throw error;
    }
  }
};
