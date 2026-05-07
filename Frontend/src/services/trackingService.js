import axios from 'axios';

const apiTracking = axios.create({
  baseURL: import.meta.env.VITE_API_MONITOREO_URL || 'https://routesense-monitoreo.onrender.com',
  headers: { 'Content-Type': 'application/json' },
});

export const trackingService = {
  // Obtener todas las posiciones en tiempo real
  getLivePositions: async () => {
    try {
      const response = await apiTracking.get('/tracking/positions');
      return response.data;
    } catch (error) {
      console.error("Error fetching live positions:", error);
      return [];
    }
  },

  // Actualizar ubicación (Conductor)
  updateLocation: async (busId, conductorId, lat, lng, speed = 0) => {
    try {
      const response = await apiTracking.post('/tracking/update', {
        bus_id: busId,
        conductor_id: conductorId,
        latitud: lat,
        longitud: lng,
        velocidad: speed
      });
      return response.data;
    } catch (error) {
      console.error("Error updating location:", error);
      throw error;
    }
  },

  // Solicitar parada (Pasajero)
  requestStop: async (userId, busId, paradaId) => {
    const response = await apiTracking.post('/requests/', {
      user_id: userId,
      bus_id: busId,
      parada_id: paradaId
    });
    return response.data;
  },

  // Cancelar parada
  cancelRequest: async (solicitudId) => {
    const response = await apiTracking.put(`/requests/${solicitudId}/cancel`);
    return response.data;
  },

  // Obtener solicitudes activas del usuario
  getUserRequests: async (userId) => {
    const response = await apiTracking.get(`/requests/user/${userId}`);
    return response.data;
  }
};
