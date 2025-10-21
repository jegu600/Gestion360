/**
 * SERVICIO DE TAREAS
 * 
 * Maneja todas las peticiones HTTP relacionadas con tareas.
 * CRUD completo + cambio de estado.
 * 
 * NUEVO: Archivo creado desde cero
 */

import api from './api';
import type { Tarea, TareaFormData, TareasResponse, EstadoTarea } from '../types';

/**
 * OBTENER TODAS LAS TAREAS
 * 
 * Obtiene todas las tareas del usuario autenticado.
 */
export const obtenerTareas = async (): Promise<Tarea[]> => {
  try {
    const { data } = await api.get<TareasResponse>('/tareas');
    return data.tareas || [];
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    throw error;
  }
};

/**
 * OBTENER TAREA POR ID
 * 
 * Obtiene una tarea específica por su ID.
 */
export const obtenerTareaPorId = async (id: string): Promise<Tarea> => {
  try {
    const { data } = await api.get<TareasResponse>(`/tareas/${id}`);
    if (!data.tarea) {
      throw new Error('Tarea no encontrada');
    }
    return data.tarea;
  } catch (error) {
    console.error('Error al obtener tarea:', error);
    throw error;
  }
};

/**
 * OBTENER TAREAS POR ESTADO
 * 
 * Filtra tareas por estado específico.
 */
export const obtenerTareasPorEstado = async (estado: EstadoTarea): Promise<Tarea[]> => {
  try {
    const { data } = await api.get<TareasResponse>(`/tareas/estado/${estado}`);
    return data.tareas || [];
  } catch (error) {
    console.error('Error al filtrar tareas por estado:', error);
    throw error;
  }
};

/**
 * CREAR TAREA
 * 
 * Crea una nueva tarea.
 */
export const crearTarea = async (tareaData: TareaFormData): Promise<Tarea> => {
  try {
    const { data } = await api.post<TareasResponse>('/tareas', tareaData);
    if (!data.tarea) {
      throw new Error('Error al crear la tarea');
    }
    return data.tarea;
  } catch (error) {
    console.error('Error al crear tarea:', error);
    throw error;
  }
};

/**
 * ACTUALIZAR TAREA
 * 
 * Actualiza una tarea existente completa.
 */
export const actualizarTarea = async (
  id: string,
  tareaData: Partial<TareaFormData>
): Promise<Tarea> => {
  try {
    const { data } = await api.put<TareasResponse>(`/tareas/${id}`, tareaData);
    if (!data.tarea) {
      throw new Error('Error al actualizar la tarea');
    }
    return data.tarea;
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    throw error;
  }
};

/**
 * CAMBIAR ESTADO DE TAREA
 * 
 * Cambia solo el estado de una tarea (más rápido que actualizar completa).
 */
export const cambiarEstadoTarea = async (
  id: string,
  estado: EstadoTarea
): Promise<Tarea> => {
  try {
    const { data } = await api.patch<TareasResponse>(`/tareas/${id}/estado`, { estado });
    if (!data.tarea) {
      throw new Error('Error al cambiar el estado');
    }
    return data.tarea;
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    throw error;
  }
};

/**
 * ELIMINAR TAREA
 * 
 * Elimina una tarea del sistema.
 */
export const eliminarTarea = async (id: string): Promise<void> => {
  try {
    await api.delete(`/tareas/${id}`);
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    throw error;
  }
};

/**
 * HELPERS LOCALES PARA FILTRADO Y BÚSQUEDA
 * 
 * Estas funciones se ejecutan en el cliente para no sobrecargar el servidor.
 */

/**
 * Filtrar tareas localmente por múltiples criterios
 */
export const filtrarTareasLocal = (
  tareas: Tarea[],
  filtros: {
    estado?: EstadoTarea;
    prioridad?: string;
    busqueda?: string;
  }
): Tarea[] => {
  let resultado = [...tareas];

  // Filtrar por estado
  if (filtros.estado) {
    resultado = resultado.filter(t => t.estado === filtros.estado);
  }

  // Filtrar por prioridad
  if (filtros.prioridad) {
    resultado = resultado.filter(t => t.prioridad === filtros.prioridad);
  }

  // Filtrar por búsqueda (título o descripción)
  if (filtros.busqueda) {
    const busquedaLower = filtros.busqueda.toLowerCase();
    resultado = resultado.filter(
      t =>
        t.titulo.toLowerCase().includes(busquedaLower) ||
        t.descripcion.toLowerCase().includes(busquedaLower)
    );
  }

  return resultado;
};

/**
 * Ordenar tareas por fecha
 */
export const ordenarTareasPorFecha = (
  tareas: Tarea[],
  orden: 'asc' | 'desc' = 'desc'
): Tarea[] => {
  return [...tareas].sort((a, b) => {
    const fechaA = new Date(a.fechaLimite).getTime();
    const fechaB = new Date(b.fechaLimite).getTime();
    return orden === 'asc' ? fechaA - fechaB : fechaB - fechaA;
  });
};

/**
 * Obtener tareas próximas a vencer (próximos 3 días)
 */
export const obtenerTareasProximasAVencer = (tareas: Tarea[]): Tarea[] => {
  const hoy = new Date();
  const tresDias = new Date(hoy.getTime() + 3 * 24 * 60 * 60 * 1000);

  return tareas.filter(tarea => {
    if (tarea.estado === 'Completada' || tarea.estado === 'Cancelada') {
      return false;
    }
    const fechaLimite = new Date(tarea.fechaLimite);
    return fechaLimite >= hoy && fechaLimite <= tresDias;
  });
};