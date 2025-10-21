/**
 * TAREAS CONTEXT
 * 
 * Maneja el estado global de tareas.
 * Provee funciones CRUD y filtrado de tareas.
 * 
 * NUEVO: Archivo creado desde cero
 */

import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Tarea, TareasContextType, TareaFormData, EstadoTarea, FiltrosTareas } from '../types';
import * as tareasService from '../services/tareasService';

// ========================================
// CONTEXT
// ========================================

const TareasContext = createContext<TareasContextType | undefined>(undefined);

// ========================================
// PROVIDER
// ========================================

interface TareasProviderProps {
  children: ReactNode;
}

export const TareasProvider = ({ children }: TareasProviderProps) => {
  // Estado
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [tareaActual, setTareaActual] = useState<Tarea | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * OBTENER TODAS LAS TAREAS
   */
  const obtenerTareas = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await tareasService.obtenerTareas();
      setTareas(data);
    } catch (err: any) {
      setError(err.message || 'Error al obtener las tareas');
      console.error('Error al obtener tareas:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * OBTENER TAREA POR ID
   */
  const obtenerTareaPorId = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const tarea = await tareasService.obtenerTareaPorId(id);
      setTareaActual(tarea);
    } catch (err: any) {
      setError(err.message || 'Error al obtener la tarea');
      console.error('Error al obtener tarea:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * CREAR TAREA
   */
  const crearTarea = async (tareaData: TareaFormData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const nuevaTarea = await tareasService.crearTarea(tareaData);
      
      // Agregar la nueva tarea al estado
      setTareas(prev => [nuevaTarea, ...prev]);
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al crear la tarea');
      console.error('Error al crear tarea:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * ACTUALIZAR TAREA
   */
  const actualizarTarea = async (
    id: string,
    tareaData: Partial<TareaFormData>
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const tareaActualizada = await tareasService.actualizarTarea(id, tareaData);
      
      // Actualizar en el estado
      setTareas(prev =>
        prev.map(tarea => (tarea.id === id ? tareaActualizada : tarea))
      );
      
      // Si es la tarea actual, actualizarla también
      if (tareaActual?.id === id) {
        setTareaActual(tareaActualizada);
      }
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar la tarea');
      console.error('Error al actualizar tarea:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * CAMBIAR ESTADO DE TAREA
   */
  const cambiarEstado = async (id: string, estado: EstadoTarea): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const tareaActualizada = await tareasService.cambiarEstadoTarea(id, estado);
      
      // Actualizar en el estado
      setTareas(prev =>
        prev.map(tarea => (tarea.id === id ? tareaActualizada : tarea))
      );
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al cambiar el estado');
      console.error('Error al cambiar estado:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * ELIMINAR TAREA
   */
  const eliminarTarea = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await tareasService.eliminarTarea(id);
      
      // Eliminar del estado
      setTareas(prev => prev.filter(tarea => tarea.id !== id));
      
      // Si es la tarea actual, limpiarla
      if (tareaActual?.id === id) {
        setTareaActual(null);
      }
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la tarea');
      console.error('Error al eliminar tarea:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * FILTRAR TAREAS
   * 
   * Filtra las tareas localmente según los criterios.
   */
  const filtrarTareas = (filtros: FiltrosTareas): Tarea[] => {
    return tareasService.filtrarTareasLocal(tareas, filtros);
  };

  /**
   * LIMPIAR TAREA ACTUAL
   */
  const limpiarTareaActual = () => {
    setTareaActual(null);
  };

  // Valor del contexto
  const value: TareasContextType = {
    tareas,
    tareaActual,
    loading,
    error,
    obtenerTareas,
    obtenerTareaPorId,
    crearTarea,
    actualizarTarea,
    cambiarEstado,
    eliminarTarea,
    filtrarTareas,
    limpiarTareaActual,
  };

  return <TareasContext.Provider value={value}>{children}</TareasContext.Provider>;
};

// ========================================
// HOOK PERSONALIZADO
// ========================================

/**
 * useTareas Hook
 * 
 * Hook para acceder al contexto de tareas.
 */
export const useTareas = (): TareasContextType => {
  const context = useContext(TareasContext);

  if (!context) {
    throw new Error('useTareas debe usarse dentro de TareasProvider');
  }

  return context;
};