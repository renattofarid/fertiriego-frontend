import axios from "axios";
import { errorToast } from "./core.function";

const baseURL =
  "https://develop.garzasoft.com:82/comercialferriego-backend/public/api/";
export const prodAssetURL =
  "https://develop.garzasoft.com:82/comercialferriego-backend/public/";

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
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error(
        "No autenticado: Redirigiendo al inicio de sesión en 3 segundos..."
      );
      localStorage.removeItem("token");
      errorToast(
        "SESIÓN EXPIRADA",
        "Redirigiendo al inicio de sesión en 3 segundos"
      );
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    }
    return Promise.reject(error);
  }
);
