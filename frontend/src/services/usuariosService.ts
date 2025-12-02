/**
 * SERVICIO DE USUARIOS
 * 
 * Maneja todas las peticiones HTTP relacionadas con usuarios.
 * Obtener lista de usuarios para asignar tareas.
 * 
 * NUEVO: Archivo creado para gestión de usuarios
 */

import api from './api';
import type { Usuario } from '../types';

/**
 * Respuesta de obtener usuarios
 */
interface ObtenerUsuariosResponse {
  ok: boolean;
  usuarios: Usuario[];
  msg?: string;
}

/**
 * Respuesta de obtener usuario por ID
 */
interface ObtenerUsuarioPorIdResponse {
  ok: boolean;
  usuario?: Usuario;
  msg?: string;
}

/**
 * OBTENER TODOS LOS USUARIOS
 * 
 * Obtiene la lista de todos los usuarios del sistema
 * para poder asignarlos como responsables de tareas.
 * 
 * @returns Promise con array de usuarios
 */
export const obtenerUsuarios = async (): Promise<ObtenerUsuariosResponse> => {
  try {
    const { data } = await api.get('/usuarios');
    
    return {
      ok: true,
      usuarios: data.usuarios as Usuario[],
    };
  } catch (error: any) {
    console.error('Error al obtener usuarios:', error);
    
    return {
      ok: false,
      msg: error.response?.data?.msg || 'Error al obtener usuarios',
      usuarios: [],
    };
  }
};

/**
 * OBTENER USUARIO POR ID
 * 
 * Obtiene información de un usuario específico.
 * 
 * @param id - ID del usuario
 * @returns Promise con datos del usuario
 */
export const obtenerUsuarioPorId = async (id: string): Promise<ObtenerUsuarioPorIdResponse> => {
  try {
    const { data } = await api.get(`/usuarios/${id}`);
    
    return {
      ok: true,
      usuario: data.usuario as Usuario,
    };
  } catch (error: any) {
    console.error('Error al obtener usuario:', error);
    
    return {
      ok: false,
      msg: error.response?.data?.msg || 'Error al obtener usuario',
    };
  }
};