/**
 * APP ROUTER
 * 
 * Router principal de la aplicación.
 * Maneja rutas públicas y privadas según el estado de autenticación.
 * 
 * CAMBIO: Reemplazado authStatus hardcodeado por useAuth real
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthRoutes } from '../auth/AuthRoutes';
import { ProjectsPages } from '../projects';

/**
 * LOADER COMPONENT
 * 
 * Se muestra mientras se verifica la autenticación.
 */
const LoadingScreen = () => (
  <div className="d-flex justify-content-center align-items-center vh-100">
    <div className="text-center">
      <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
        <span className="visually-hidden">Cargando...</span>
      </div>
      <p className="mt-3 text-muted">Verificando autenticación...</p>
    </div>
  </div>
);

export const AppRouter = () => {
  // Obtener estado de autenticación del contexto
  const { authState } = useAuth();
  const { status } = authState;

  // Mostrar loader mientras se verifica la autenticación
  if (status === 'checking') {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/*
        Regla #1: Manejo de Rutas de Autenticación (públicas, ej: /auth/login)
        Esta regla se aplica a cualquier URL que comience con "/auth/".
      */}
      <Route
        path="/auth/*"
        element={
          status === 'authenticated'
            // Si el usuario YA está autenticado, no debe ver el login/registro.
            // Lo redirigimos a la página principal de la aplicación.
            ? <Navigate to="/" />
            // Si NO está autenticado, le permitimos ver las páginas de Auth (login, registro).
            : <AuthRoutes />
        }
      />

      {/*
        Regla #2: Manejo de Rutas de la Aplicación (privadas, ej: /dashboard)
        Esta regla "atrapa-todo" se aplica a CUALQUIER OTRA URL que no empezó con "/auth/".
      */}
      <Route
        path="/*"
        element={
          status === 'authenticated'
            // Si el usuario está autenticado, puede ver las páginas protegidas.
            ? <ProjectsPages />
            // Si NO está autenticado e intenta entrar, lo redirigimos al login.
            : <Navigate to="/auth/login" />
        }
      />
    </Routes>
  );
};