/**
 * SERVICIO DE NOTIFICACIONES
 * 
 * Maneja todas las peticiones HTTP relacionadas con notificaciones.
 * Obtener, marcar como leídas, eliminar.
 * 
 * NUEVO: Archivo creado desde cero
 */

import api from './api';
import type { Notificacion, NotificacionesResponse } from '../types';

/**
 * OBTENER TODAS LAS NOTIFICACIONES
 * 
 * Obtiene todas las notificaciones del usuario.
 * Opcionalmente puede filtrar por estado (leída/no leída).
 */
export const obtenerNotificaciones = async (
  filtros?: { leida?: boolean; limit?: number }
): Promise<{ notificaciones: Notificacion[]; noLeidas: number }> => {
  try {
    const params = new URLSearchParams();
    if (filtros?.leida !== undefined) {
      params.append('leida', String(filtros.leida));
    }
    if (filtros?.limit) {
      params.append('limit', String(filtros.limit));
    }

    const { data } = await api.get<NotificacionesResponse>(
      `/notificaciones?${params.toString()}`
    );

    return {
      notificaciones: data.notificaciones || [],
      noLeidas: data.noLeidas || 0,
    };
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    throw error;
  }
};

/**
 * OBTENER NOTIFICACIONES NO LEÍDAS
 * 
 * Obtiene solo las notificaciones no leídas (máximo 10).
 */
export const obtenerNotificacionesNoLeidas = async (): Promise<Notificacion[]> => {
  try {
    const { data } = await api.get<NotificacionesResponse>('/notificaciones/no-leidas');
    return data.notificaciones || [];
  } catch (error) {
    console.error('Error al obtener notificaciones no leídas:', error);
    throw error;
  }
};

/**
 * OBTENER CONTADOR DE NO LEÍDAS
 * 
 * Obtiene solo el número de notificaciones no leídas.
 * Endpoint ligero ideal para polling.
 */
export const obtenerContadorNoLeidas = async (): Promise<number> => {
  try {
    const { data } = await api.get<NotificacionesResponse>('/notificaciones/contador');
    return data.noLeidas || 0;
  } catch (error) {
    console.error('Error al obtener contador:', error);
    throw error;
  }
};

/**
 * MARCAR NOTIFICACIÓN COMO LEÍDA
 * 
 * Marca una notificación específica como leída.
 */
export const marcarComoLeida = async (id: string): Promise<void> => {
  try {
    await api.patch(`/notificaciones/${id}/leida`);
  } catch (error) {
    console.error('Error al marcar como leída:', error);
    throw error;
  }
};

/**
 * MARCAR TODAS COMO LEÍDAS
 * 
 * Marca todas las notificaciones del usuario como leídas.
 */
export const marcarTodasComoLeidas = async (): Promise<void> => {
  try {
    await api.patch('/notificaciones/marcar-todas-leidas');
  } catch (error) {
    console.error('Error al marcar todas como leídas:', error);
    throw error;
  }
};

/**
 * ELIMINAR NOTIFICACIÓN
 * 
 * Elimina una notificación específica.
 */
export const eliminarNotificacion = async (id: string): Promise<void> => {
  try {
    await api.delete(`/notificaciones/${id}`);
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    throw error;
  }
};

/**
 * LIMPIAR NOTIFICACIONES LEÍDAS
 * 
 * Elimina todas las notificaciones leídas del usuario.
 */
export const limpiarNotificacionesLeidas = async (): Promise<void> => {
  try {
    await api.delete('/notificaciones/limpiar-leidas');
  } catch (error) {
    console.error('Error al limpiar notificaciones:', error);
    throw error;
  }
};