/**
 * SERVICIO DE AUTENTICACIÓN - CORREGIDO
 * 
 * Maneja todas las peticiones HTTP relacionadas con autenticación.
 * Endpoints: login, register, renewToken
 * 
 * CORREGIDO: Guarda token correctamente en localStorage
 */

import api from './api';
import type { LoginData, RegisterData, AuthResponse } from '../types';

/**
 * LOGIN
 * 
 * Inicia sesión con correo y contraseña.
 * Guarda el token en localStorage si es exitoso.
 * 
 * @param credentials - Correo y contraseña
 * @returns Promise con respuesta de autenticación
 */
export const login = async (credentials: LoginData): Promise<AuthResponse> => {
  try {
    console.log('🔐 Intentando login con:', credentials.correo);
    
    const { data } = await api.post('/auth', credentials);
    
    console.log('✅ Login exitoso:', data);

    // Guardar token en localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      console.log('✅ Token guardado en localStorage');
    }

    return {
      ok: true,
      token: data.token,
      uid: data.uid,
      nombre: data.nombre,
      rol: data.rol,
    };
  } catch (error: any) {
    console.error('❌ Error en login:', error);
    
    return {
      ok: false,
      msg: error.data?.msg || error.message || 'Error al iniciar sesión',
    };
  }
};

/**
 * REGISTER
 * 
 * Registra un nuevo usuario.
 * Guarda el token en localStorage si es exitoso.
 * 
 * @param userData - Datos del nuevo usuario
 * @returns Promise con respuesta de autenticación
 */
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    console.log('📝 Intentando registro con:', userData.correo);
    
    const { data } = await api.post('/auth/register', userData);
    
    console.log('✅ Registro exitoso:', data);

    // Guardar token en localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      console.log('✅ Token guardado en localStorage');
    }

    return {
      ok: true,
      token: data.token,
      uid: data.uid,
      nombre: data.nombre,
      rol: data.rol,
    };
  } catch (error: any) {
    console.error('❌ Error en registro:', error);
    
    return {
      ok: false,
      msg: error.data?.msg || error.message || 'Error al registrar usuario',
    };
  }
};

/**
 * RENOVAR TOKEN
 * 
 * Renueva el token JWT usando el token actual.
 * Actualiza el token en localStorage.
 * 
 * @returns Promise con respuesta de autenticación
 */
export const renewToken = async (): Promise<AuthResponse> => {
  try {
    console.log('🔄 Renovando token...');
    
    const { data } = await api.get('/auth/renew');
    
    console.log('✅ Token renovado:', data);

    // Actualizar token en localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      console.log('✅ Token actualizado en localStorage');
    }

    return {
      ok: true,
      token: data.token,
      uid: data.uid,
      nombre: data.nombre,
      rol: data.rol,
    };
  } catch (error: any) {
    console.error('❌ Error al renovar token:', error);
    
    // Si el token no es válido, limpiar localStorage
    localStorage.removeItem('token');
    
    return {
      ok: false,
      msg: error.data?.msg || error.message || 'Error al renovar token',
    };
  }
};

/**
 * LOGOUT
 * 
 * Cierra sesión eliminando el token del localStorage.
 */
export const logout = (): void => {
  console.log('👋 Cerrando sesión...');
  localStorage.removeItem('token');
  console.log('✅ Token eliminado de localStorage');
};

/**
 * GET TOKEN FROM STORAGE
 * 
 * Obtiene el token almacenado en localStorage.
 * 
 * @returns Token JWT o null si no existe
 */
export const getTokenFromStorage = (): string | null => {
  const token = localStorage.getItem('token');
  
  if (token) {
    console.log('✅ Token encontrado en localStorage');
  } else {
    console.warn('⚠️ No hay token en localStorage');
  }
  
  return token;
};