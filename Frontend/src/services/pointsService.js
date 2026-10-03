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
  },

  getStampConfig: async () => {
    try {
      const response = await apiAdmin.get('/admin/sellos-config');
      return response.data;
    } catch (error) {
      return {
        max_stamps: 10,
        reward_points_bonus: 50,
        reward_description: "Recompensa por completar la tarjeta de 10 sellos",
        is_active: true
      };
    }
  },

  updateStampConfig: async (configData) => {
    try {
      const response = await apiAdmin.post('/admin/sellos-config', configData);
      return response.data;
    } catch (error) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error("No se pudo actualizar la configuración de sellos");
    }
  },

  getStampImages: async () => {
    try {
      const response = await apiAdmin.get('/admin/sellos-imagenes');
      return response.data;
    } catch (error) {
      // Fallback local con 11 sellos (0 a 10)
      return Array.from({ length: 11 }, (_, i) => ({
        stamp_count: i,
        image_url: `https://i.ibb.co/example/${i}_sellos.png`,
        wallet_hero_url: `https://i.ibb.co/example/${i}_sellos.png`,
        nombre_sello: i === 0 ? '0 Sellos - Inicial' : (i === 10 ? '10 Sellos - ¡Tarjeta Completa!' : `${i} Sellos Acumulados`)
      }));
    }
  },

  updateStampImage: async (stampImageData) => {
    try {
      const response = await apiAdmin.post('/admin/sellos-imagenes', stampImageData);
      return response.data;
    } catch (error) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error("No se pudo actualizar la imagen del sello");
    }
  },

  updateStampImagesBatch: async (stampImagesList) => {
    try {
      const response = await apiAdmin.post('/admin/sellos-imagenes/batch', stampImagesList);
      return response.data;
    } catch (error) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error("No se pudieron actualizar las imágenes de sellos en lote");
    }
  }
};
