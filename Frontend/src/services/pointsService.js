import apiAdmin from '../api/config';

export const pointsService = {
  getPointsConfig: async () => {
    try {
      const response = await apiAdmin.get('/admin/puntos-config');
      return response.data;
    } catch (error) {
      console.warn("Error al cargar configuración de puntos desde API, usando defaults local:", error);
      return {
        monto_dinero: 10,
        puntos_otorgados: 1,
        descripcion: "1 punto por cada $10 gastados",
        activa: true
      };
    }
  },

  updatePointsConfig: async (configData) => {
    try {
      const response = await apiAdmin.post('/admin/puntos-config', configData);
      return response.data;
    } catch (error) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error("No se pudo actualizar la regla de puntos en el servidor");
    }
  }
};
