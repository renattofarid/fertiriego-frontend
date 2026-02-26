import axios from "axios";
import { errorToast } from "./core.function";

const baseURL =
  "https://develop.garzasoft.com:82/comercialferriego-backend-dev/public/api/";
export const prodAssetURL =
  "https://develop.garzasoft.com:82/comercialferriego-backend-dev/public/storage/";
// const baseURL =
//   "https://develop.garzasoft.com:82/comercialferriego-backend/public/api/";
// export const prodAssetURL =
//   "https://develop.garzasoft.com:82/comercialferriego-backend/public/storage/";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Variable para evitar múltiples redirecciones simultáneas
let isRedirecting = false;

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Evitar múltiples toasts y redirecciones simultáneas
      if (!isRedirecting) {
        isRedirecting = true;
        console.error("No autenticado: Redirigiendo al inicio de sesión...");
        localStorage.removeItem("token");
        errorToast("SESIÓN EXPIRADA", "Redirigiendo al inicio de sesión");
        // Redirección inmediata sin espera
        window.location.href = "/";
      }
      // Rechazamos con un error específico que NO debe mostrarse en los componentes
      return new Promise(() => {}); // Promesa que nunca se resuelve para detener la ejecución
    }
    return Promise.reject(error);
  },
);

// Locale por defecto de la aplicación. Puede cambiarse si se desea otro locale.
// Nota: asumimos 'es-PE' como locale por defecto para mostrar separadores de miles
// y formato numérico local. Si se desea detectar dinámicamente, se puede
// adaptar para leer de una preferencia del usuario en el futuro.
export const APP_LOCALE = "es-PE";
