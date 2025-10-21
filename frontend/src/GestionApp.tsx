import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './router';
import { AuthProvider } from './context/AuthContext';
import { TareasProvider } from './context/TareasContext';
import { NotificacionesProvider } from './context/NotificacionesContext';

/**
 * ORDEN DE PROVIDERS:
 * 
 * 1. AuthProvider (más externo) - Maneja autenticación
 * 2. TareasProvider - Depende de estar autenticado
 * 3. NotificacionesProvider - Depende de estar autenticado
 * 
 * Todos dentro de BrowserRouter para tener acceso a rutas
 */
export const GestionApp = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TareasProvider>
          <NotificacionesProvider>
            <AppRouter />
          </NotificacionesProvider>
        </TareasProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};
