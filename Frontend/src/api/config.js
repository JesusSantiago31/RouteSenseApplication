import axios from "axios";

// Instancia de API base configurada.
// Por defecto apunta a Desarrollo, pero usa variables de entorno en Producción.
const apiAdmin = axios.create({
  baseURL:
    import.meta.env.VITE_API_ADMIN_URL ||
    "https://routesense-administrador.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para inyectar token si existe en localStorage
apiAdmin.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("routesense_admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default apiAdmin;
