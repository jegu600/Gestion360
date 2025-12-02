// CONTEXT SIMPLIFICADO Y CONECTADO

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Tarea, TareaFormData, Usuario, EstadoTarea } from '../types';
import * as tareasService from '../services/tareasService';
import * as usuariosService from '../services/usuariosService';

interface TareasContextType {
  tareas: Tarea[];
  loading: boolean;
  error: string | null;
  usuarios: Usuario[];
  loadingUsuarios: boolean;

  obtenerTareas: () => Promise<void>;
  obtenerTareaPorId: (id: string) => Promise<Tarea | null>;
  crearTarea: (tarea: TareaFormData) => Promise<boolean>;
  actualizarTarea: (id: string, tarea: TareaFormData) => Promise<boolean>;
  cambiarEstadoTarea: (id: string, estado: EstadoTarea) => Promise<boolean>;
  eliminarTarea: (id: string) => Promise<boolean>;

  obtenerUsuarios: () => Promise<void>;
  filtrarPorEstado: (estado: EstadoTarea) => Tarea[];
  limpiarError: () => void;
}

const TareasContext = createContext<TareasContextType | undefined>(undefined);

export const TareasProvider = ({ children }: { children: ReactNode }) => {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const normalizeResponse = <T,>(res: any, field: string): T | null => {
    if (!res) return null;
    if (res.ok && res[field]) return res[field] as T;
    if (Array.isArray(res)) return res as T;
    return null;
  };

  const obtenerUsuarios = async () => {
    setLoadingUsuarios(true);
    try {
      const response = await usuariosService.obtenerUsuarios();
      const lista = normalizeResponse<Usuario[]>(response, 'usuarios');
      if (lista) setUsuarios(lista);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const obtenerTareas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await tareasService.obtenerTareas();
      const lista = normalizeResponse<Tarea[]>(response, 'tareas');
      if (lista) setTareas(lista);
    } catch {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const obtenerTareaPorId = async (id: string): Promise<Tarea | null> => {
    try {
      const response = await tareasService.obtenerTareaPorId(id);
      return normalizeResponse<Tarea>(response, 'tarea');
    } catch {
      setError('Error al conectar con el servidor');
      return null;
    }
  };

  const crearTarea = async (data: TareaFormData): Promise<boolean> => {
    try {
      const response = await tareasService.crearTarea(data);
      const nueva = normalizeResponse<Tarea>(response, 'tarea');
      if (nueva) {
        setTareas(prev => [nueva, ...prev]);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const actualizarTarea = async (id: string, data: TareaFormData): Promise<boolean> => {
    try {
      const response = await tareasService.actualizarTarea(id, data);
      const actualizada = normalizeResponse<Tarea>(response, 'tarea');
      if (!actualizada) return false;
      setTareas(prev => prev.map(t => t._id === id ? actualizada : t));
      return true;
    } catch {
      return false;
    }
  };

  const cambiarEstadoTarea = async (id: string, estado: EstadoTarea): Promise<boolean> => {
    try {
      const response = await tareasService.cambiarEstadoTarea(id, estado);
      const actualizada = normalizeResponse<Tarea>(response, 'tarea');
      if (!actualizada) return false;
      setTareas(prev => prev.map(t => t._id === id ? actualizada : t));
      return true;
    } catch {
      return false;
    }
  };

  const eliminarTarea = async (id: string): Promise<boolean> => {
    try {
      const response: any = await tareasService.eliminarTarea(id);
      if (response?.ok) {
        setTareas(prev => prev.filter(t => t._id !== id));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const filtrarPorEstado = (estado: EstadoTarea) => tareas.filter(t => t.estado === estado);

  const limpiarError = () => setError(null);

  return (
    <TareasContext.Provider value={{
      tareas,
      loading,
      error,
      usuarios,
      loadingUsuarios,

      obtenerTareas,
      obtenerTareaPorId,
      crearTarea,
      actualizarTarea,
      cambiarEstadoTarea,
      eliminarTarea,
      obtenerUsuarios,

      filtrarPorEstado,
      limpiarError
    }}>
      {children}
    </TareasContext.Provider>
  );
};

export const useTareas = () => {
  const ctx = useContext(TareasContext);
  if (!ctx) throw new Error('useTareas debe usarse dentro de TareasProvider');
  return ctx;
};
