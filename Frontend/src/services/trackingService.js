import axios from 'axios';

const apiTracking = axios.create({
  baseURL: import.meta.env.VITE_API_MONITOREO_URL || 'http://localhost:8005',
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

  // Simular actualización de ubicación (para pruebas desde el dashboard o app conductor)
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
  }
};
