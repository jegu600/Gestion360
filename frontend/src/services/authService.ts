/**
 * SERVICIO DE AUTENTICACIÓN
 * 
 * Maneja todas las peticiones HTTP relacionadas con autenticación.
 * Endpoints: login, register, renewToken
 * 
 * NUEVO: Archivo creado desde cero
 */

import api from './api';
import type { LoginData, RegisterData, AuthResponse } from '../types';

/**
 * LOGIN
 * 
 * Inicia sesión con correo y contraseña.
 * Retorna token y datos del usuario.
 */
export const login = async (credentials: LoginData): Promise<AuthResponse> => {
  try {
    const { data } = await api.post<AuthResponse>('/auth', credentials);
    
    // Guardar token en localStorage si el login fue exitoso
    if (data.ok && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        uid: data.uid,
        nombre: data.nombre,
        rol: data.rol,
      }));
    }
    
    return data;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

/**
 * REGISTER
 * 
 * Registra un nuevo usuario en el sistema.
 * Retorna token y datos del usuario recién creado.
 */
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    const { data } = await api.post<AuthResponse>('/auth/register', userData);
    
    // Guardar token en localStorage si el registro fue exitoso
    if (data.ok && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        uid: data.uid,
        nombre: data.nombre,
        rol: data.rol,
      }));
    }
    
    return data;
  } catch (error) {
    console.error('Error en registro:', error);
    throw error;
  }
};

/**
 * RENEW TOKEN
 * 
 * Renueva el token JWT usando el token actual.
 * Se debe llamar al cargar la aplicación para verificar si el usuario
 * sigue autenticado.
 */
export const renewToken = async (): Promise<AuthResponse> => {
  try {
    const { data } = await api.get<AuthResponse>('/auth/renew');
    
    // Actualizar token en localStorage
    if (data.ok && data.token) {
      localStorage.setItem('token', data.token);
      // El user ya debería estar en localStorage, pero lo actualizamos por si acaso
      const currentUser = localStorage.getItem('user');
      if (currentUser) {
        const user = JSON.parse(currentUser);
        localStorage.setItem('user', JSON.stringify({
          ...user,
          uid: data.uid || user.uid,
          nombre: data.nombre || user.nombre,
          rol: data.rol || user.rol,
        }));
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error al renovar token:', error);
    // Limpiar localStorage si falla la renovación
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw error;
  }
};

/**
 * LOGOUT
 * 
 * Cierra sesión del usuario.
 * Limpia el token y datos del usuario del localStorage.
 */
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * GET USER FROM STORAGE
 * 
 * Obtiene los datos del usuario guardados en localStorage.
 */
export const getUserFromStorage = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error al parsear usuario de localStorage:', error);
      return null;
    }
  }
  return null;
};

/**
 * GET TOKEN FROM STORAGE
 * 
 * Obtiene el token guardado en localStorage.
 */
export const getTokenFromStorage = (): string | null => {
  return localStorage.getItem('token');
};