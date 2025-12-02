/**
 * SERVICIO DE TAREAS - CORREGIDO
 * 
 * Maneja todas las peticiones HTTP relacionadas con tareas.
 * CRUD completo + cambio de estado.
 * 
 * CORREGIDO: Agregados logs para debug y manejo mejorado de errores
 */

import api from './api';
import type { Tarea, TareaFormData, TareasResponse } from '../types';

// Local single-tarea response type (backend shape: { ok, tarea?, msg? })
type TareaResponse = {
  ok: boolean;
  tarea?: Tarea;
  msg?: string;
};

/**
 * OBTENER TODAS LAS TAREAS
 * Obtiene las tareas del usuario autenticado
 */
export const obtenerTareas = async (): Promise<TareasResponse> => {
  try {
    console.log('📋 Obteniendo tareas...');
    const { data } = await api.get('/tareas');

    console.log('✅ Tareas obtenidas:', data.tareas?.length || 0);

    return {
      ok: true,
      tareas: data.tareas as Tarea[],
    };
  } catch (error: any) {
    console.error('❌ Error al obtener tareas:', error);
    return {
      ok: false,
      msg: error.data?.msg || error.message || 'Error al obtener tareas',
      tareas: [],
    };
  }
};

/**
 * OBTENER TAREA POR ID
 */
export const obtenerTareaPorId = async (id: string): Promise<TareaResponse> => {
  try {
    console.log('🔍 Obteniendo tarea:', id);
    const { data } = await api.get(`/tareas/${id}`);

    console.log('✅ Tarea obtenida:', data.tarea);

    return {
      ok: true,
      tarea: data.tarea as Tarea,
    };
  } catch (error: any) {
    console.error('❌ Error al obtener tarea:', error);
    return {
      ok: false,
      msg: error.data?.msg || error.message || 'Error al obtener tarea',
    };
  }
};

/**
 * CREAR TAREA
 */
export const crearTarea = async (tareaData: TareaFormData): Promise<TareaResponse> => {
  try {
    console.log('📝 Creando tarea con datos:', tareaData);

    // Preparar datos para enviar
    const dataToSend = {
      titulo: tareaData.titulo.trim(),
      descripcion: tareaData.descripcion.trim(),
      fechaLimite: tareaData.fechaLimite || undefined,
      responsable: tareaData.responsable?.trim() || undefined,
      prioridad: tareaData.prioridad || 'Media',
    };

    console.log('📤 Datos a enviar al backend:', dataToSend);

    const { data } = await api.post('/tareas', dataToSend);

    console.log('✅ Respuesta del backend:', data);

    return {
      ok: true,
      tarea: data.tarea as Tarea,
      msg: data.msg,
    };
  } catch (error: any) {
    console.error('❌ Error completo:', error);
    console.error('❌ Error data:', error.data);
    console.error('❌ Error message:', error.message);

    return {
      ok: false,
      msg: error.data?.msg || error.message || 'Error al crear tarea',
    };
  }
};

/**
 * ACTUALIZAR TAREA
 */
export const actualizarTarea = async (
  id: string,
  tareaData: TareaFormData
): Promise<TareaResponse> => {
  try {
    console.log('✏️ Actualizando tarea:', id, tareaData);

    const { data } = await api.put(`/tareas/${id}`, tareaData);

    console.log('✅ Tarea actualizada:', data.tarea);

    return {
      ok: true,
      tarea: data.tarea as Tarea,
      msg: data.msg,
    };
  } catch (error: any) {
    console.error('❌ Error al actualizar tarea:', error);
    return {
      ok: false,
      msg: error.data?.msg || error.message || 'Error al actualizar tarea',
    };
  }
};

/**
 * CAMBIAR ESTADO DE TAREA
 */
export const cambiarEstadoTarea = async (
  id: string,
  estado: string
): Promise<TareaResponse> => {
  try {
    console.log('🔄 Cambiando estado de tarea:', id, 'a', estado);

    const { data } = await api.patch(`/tareas/${id}/estado`, { estado });

    console.log('✅ Estado cambiado:', data.tarea);

    return {
      ok: true,
      tarea: data.tarea as Tarea,
      msg: data.msg,
    };
  } catch (error: any) {
    console.error('❌ Error al cambiar estado:', error);
    return {
      ok: false,
      msg: error.data?.msg || error.message || 'Error al cambiar estado',
    };
  }
};

/**
 * ELIMINAR TAREA
 */
export const eliminarTarea = async (id: string): Promise<{ ok: boolean; msg?: string }> => {
  try {
    console.log('🗑️ Eliminando tarea:', id);

    const { data } = await api.delete(`/tareas/${id}`);

    console.log('✅ Tarea eliminada');

    return {
      ok: true,
      msg: data.msg,
    };
  } catch (error: any) {
    console.error('❌ Error al eliminar tarea:', error);
    return {
      ok: false,
      msg: error.data?.msg || error.message || 'Error al eliminar tarea',
    };
  }
};