/**
 * NOTIFICACIONES CONTEXT
 * 
 * Maneja el estado global de notificaciones.
 * Incluye polling automático para actualizar el contador.
 * 
 * NUEVO: Archivo creado desde cero
 */

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Notificacion, NotificacionesContextType } from '../types';
import * as notificacionesService from '../services/notificacionesService';

// ========================================
// CONTEXT
// ========================================

const NotificacionesContext = createContext<NotificacionesContextType | undefined>(undefined);

// ========================================
// PROVIDER
// ========================================

interface NotificacionesProviderProps {
  children: ReactNode;
}

export const NotificacionesProvider = ({ children }: NotificacionesProviderProps) => {
  // Estado
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [noLeidas, setNoLeidas] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * POLLING: Actualizar contador cada 30 segundos
   * 
   * Solo cuando el usuario está autenticado.
   */
  useEffect(() => {
    // Obtener contador inicial
    obtenerContador();

    // Configurar polling cada 30 segundos
    const interval = setInterval(() => {
      obtenerContador();
    }, 30000); // 30 segundos

    // Limpiar interval al desmontar
    return () => clearInterval(interval);
  }, []);

  /**
   * OBTENER TODAS LAS NOTIFICACIONES
   */
  const obtenerNotificaciones = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await notificacionesService.obtenerNotificaciones();
      setNotificaciones(data.notificaciones);
      setNoLeidas(data.noLeidas);
    } catch (err) {
      console.error('Error al obtener notificaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * OBTENER SOLO EL CONTADOR
   * 
   * Más ligero que obtener todas las notificaciones.
   */
  const obtenerContador = async (): Promise<void> => {
    try {
      const count = await notificacionesService.obtenerContadorNoLeidas();
      setNoLeidas(count);
    } catch (err) {
      console.error('Error al obtener contador:', err);
    }
  };

  /**
   * MARCAR COMO LEÍDA
   */
  const marcarComoLeida = async (id: string): Promise<void> => {
    try {
      await notificacionesService.marcarComoLeida(id);
      
      // Actualizar en el estado
      setNotificaciones(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, leida: true } : notif
        )
      );
      
      // Decrementar contador
      setNoLeidas(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error al marcar como leída:', err);
    }
  };

  /**
   * MARCAR TODAS COMO LEÍDAS
   */
  const marcarTodasLeidas = async (): Promise<void> => {
    try {
      await notificacionesService.marcarTodasComoLeidas();
      
      // Actualizar estado: todas como leídas
      setNotificaciones(prev =>
        prev.map(notif => ({ ...notif, leida: true }))
      );
      
      // Contador a cero
      setNoLeidas(0);
    } catch (err) {
      console.error('Error al marcar todas como leídas:', err);
    }
  };

  /**
   * ELIMINAR NOTIFICACIÓN
   */
  const eliminarNotificacion = async (id: string): Promise<void> => {
    try {
      // Verificar si era no leída antes de eliminar
      const notif = notificaciones.find(n => n.id === id);
      const eraNoLeida = notif && !notif.leida;

      await notificacionesService.eliminarNotificacion(id);
      
      // Eliminar del estado
      setNotificaciones(prev => prev.filter(notif => notif.id !== id));
      
      // Si era no leída, decrementar contador
      if (eraNoLeida) {
        setNoLeidas(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error al eliminar notificación:', err);
    }
  };

  // Valor del contexto
  const value: NotificacionesContextType = {
    notificaciones,
    noLeidas,
    loading,
    obtenerNotificaciones,
    obtenerContador,
    marcarComoLeida,
    marcarTodasLeidas,
    eliminarNotificacion,
  };

  return (
    <NotificacionesContext.Provider value={value}>
      {children}
    </NotificacionesContext.Provider>
  );
};

// ========================================
// HOOK PERSONALIZADO
// ========================================

/**
 * useNotificaciones Hook
 * 
 * Hook para acceder al contexto de notificaciones.
 */
export const useNotificaciones = (): NotificacionesContextType => {
  const context = useContext(NotificacionesContext);

  if (!context) {
    throw new Error('useNotificaciones debe usarse dentro de NotificacionesProvider');
  }

  return context;
};