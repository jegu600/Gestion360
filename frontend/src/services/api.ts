/**
 * CONFIGURACIÓN DE AXIOS
 * 
 * Configura la instancia base de Axios para todas las peticiones HTTP.
 * Incluye interceptores para agregar token y manejar errores.
 * 
 */

import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
  
// URL base del backend (desde variable de entorno o valor por defecto)
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/**
 * INSTANCIA DE AXIOS
 * 
 * Instancia configurada de Axios que se usará en todos los servicios.
 */
export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});

/**
 * INTERCEPTOR DE REQUEST
 * 
 * Se ejecuta antes de cada petición.
 * Agrega el token JWT al header si existe en localStorage.
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Obtener token del localStorage
    const token = localStorage.getItem('token');
    
    // Si existe token, agregarlo al header
    if (token && config.headers) {
      config.headers['x-token'] = token;
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

/**
 * INTERCEPTOR DE RESPONSE
 * 
 * Se ejecuta después de recibir cada respuesta.
 * Maneja errores de forma centralizada.
 */
api.interceptors.response.use(
  // Respuesta exitosa (status 2xx)
  (response) => {
    return response;
  },
  
  // Respuesta con error (status fuera de 2xx)
  (error: AxiosError) => {
    // Estructura del error personalizada
    const customError = {
      message: 'Error desconocido',
      status: error.response?.status,
      data: error.response?.data,
    };

    // Manejar diferentes tipos de errores
    if (error.response) {
      // El servidor respondió con un status fuera del rango 2xx
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          customError.message = (data as any)?.msg || 'Solicitud incorrecta';
          break;
        case 401:
          customError.message = 'No autenticado. Por favor inicia sesión.';
          // Limpiar localStorage si el token expiró
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Solo redirigir si NO estamos ya en una página de auth
          const currentPath = window.location.pathname;
          if (!currentPath.startsWith('/auth')) {
            window.location.href = '/auth/login';
          }
          break;
        case 403:
          customError.message = 'No tienes permisos para realizar esta acción';
          break;
        case 404:
          customError.message = (data as any)?.msg || 'Recurso no encontrado';
          break;
        case 500:
          customError.message = 'Error en el servidor. Intenta más tarde.';
          break;
        default:
          customError.message = (data as any)?.msg || 'Error en la solicitud';
      }
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      customError.message = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    } else {
      // Error al configurar la petición
      customError.message = error.message;
    }

    console.error('Error en response interceptor:', customError);
    return Promise.reject(customError);
  }
);

/**
 * HELPER: Manejar errores de API
 * 
 * Función auxiliar para extraer mensajes de error de forma consistente
 */
export const handleApiError = (error: any): string => {
  if (error.message) {
    return error.message;
  }
  if (error.data?.msg) {
    return error.data.msg;
  }
  return 'Ocurrió un error inesperado';
};

export default api;