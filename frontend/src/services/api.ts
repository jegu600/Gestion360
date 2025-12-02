/**
 * CONFIGURACIÓN DE AXIOS - CORREGIDA
 * 
 * Configura la instancia base de Axios para todas las peticiones HTTP.
 * Incluye interceptores para agregar token y manejar errores.
 * 
 * CORREGIDO: Token se agrega correctamente en cada petición
 */

import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

/**
 * INSTANCIA BASE DE AXIOS
 * Configuración con URL base del backend
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * INTERCEPTOR DE REQUEST
 * Agrega el token JWT a cada petición
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Obtener token del localStorage
    const token = localStorage.getItem('token');
    
    // Si existe token, agregarlo al header
    if (token) {
      config.headers['x-token'] = token;
      console.log('✅ Token agregado a la petición:', token.substring(0, 20) + '...');
    } else {
      console.warn('⚠️ No hay token en localStorage');
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

/**
 * INTERCEPTOR DE RESPONSE
 * Maneja respuestas y errores globalmente
 */
api.interceptors.response.use(
  // Respuesta exitosa (status 2xx)
  (response) => {
    return response;
  },
  
  // Respuesta con error (status fuera de 2xx)
  (error: AxiosError) => {
    console.error('❌ Error en response:', error.response?.status, error.response?.data);
    
    // Estructura del error personalizada
    const customError = {
      message: 'Error desconocido',
      status: error.response?.status,
      data: error.response?.data,
    };

    // Manejar errores específicos
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 400:
          customError.message = 'Solicitud incorrecta. Verifica los datos enviados.';
          break;
        case 401:
          customError.message = 'No autorizado. Token inválido o expirado.';
          
          // Solo redirigir al login si NO estamos en rutas de auth
          const currentPath = window.location.pathname;
          if (!currentPath.includes('/auth')) {
            console.warn('⚠️ Token expirado, redirigiendo al login...');
            localStorage.removeItem('token');
            window.location.href = '/auth/login';
          }
          break;
        case 403:
          customError.message = 'Acceso prohibido. No tienes permisos.';
          break;
        case 404:
          customError.message = 'Recurso no encontrado.';
          break;
        case 500:
          customError.message = 'Error del servidor. Intenta más tarde.';
          break;
        default:
          customError.message = `Error ${status}: ${error.response.statusText}`;
      }
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      customError.message = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    }

    return Promise.reject(customError);
  }
);

export default api;