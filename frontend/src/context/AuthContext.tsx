/**
 * AUTH CONTEXT
 * 
 * Maneja el estado global de autenticación.
 * Provee funciones para login, register, logout y verificación de sesión.
 */

import type { ReactNode } from 'react';
import { createContext, useContext, useReducer, useEffect } from 'react';
import type { AuthState, AuthContextType, LoginData, RegisterData, Usuario } from '../types';
import * as authService from '../services/authService';

// ========================================
// ESTADO INICIAL
// ========================================

const initialState: AuthState = {
  status: 'checking', // checking | authenticated | not-authenticated
  user: null,
  token: null,
  errorMessage: null,
};

// ========================================
// ACTIONS
// ========================================

type AuthAction =
  | { type: 'LOGIN'; payload: { user: Usuario; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'CHECKING' }
  | { type: 'NOT_AUTHENTICATED' };

// ========================================
// REDUCER
// ========================================

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        status: 'authenticated',
        user: action.payload.user,
        token: action.payload.token,
        errorMessage: null,
      };

    case 'LOGOUT':
      return {
        ...state,
        status: 'not-authenticated',
        user: null,
        token: null,
        errorMessage: null,
      };

    case 'SET_ERROR':
      return {
        ...state,
        status: 'not-authenticated',
        user: null,
        token: null,
        errorMessage: action.payload,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        errorMessage: null,
      };

    case 'CHECKING':
      return {
        ...state,
        status: 'checking',
      };

    case 'NOT_AUTHENTICATED':
      return {
        ...state,
        status: 'not-authenticated',
      };

    default:
      return state;
  }
};

// ========================================
// CONTEXT
// ========================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ========================================
// PROVIDER
// ========================================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, dispatch] = useReducer(authReducer, initialState);

  /**
   * VERIFICAR AUTENTICACIÓN AL CARGAR LA APP
   * 
   * Intenta renovar el token al cargar la aplicación.
   * Si falla, el usuario debe hacer login nuevamente.
   */
  useEffect(() => {
     //Se añade una condición para evitar la verificación del token
    // en las rutas de autenticación (ej: /auth/login, /auth/register).
     const currentPath = window.location.pathname;
    if (currentPath.startsWith('/auth')) {
        // Si estamos en una ruta de autenticación, simplemente marcamos
        // el estado como 'not-authenticated' y no hacemos nada más.
        dispatch({ type: 'NOT_AUTHENTICATED' });
        return;
        
    }
    checkAuth();
  }, []);

  /**
   * CHECK AUTH
   * 
   * Verifica si hay un token válido y lo renueva.
   */
  const checkAuth = async () => {
    const token = authService.getTokenFromStorage();

    if (!token) {
      dispatch({ type: 'NOT_AUTHENTICATED' });
      return;
    }

    try {
      dispatch({ type: 'CHECKING' });
      
      // Intentar renovar el token
      const response = await authService.renewToken();

      if (response.ok && response.token) {
        const user: Usuario = {
          uid: response.uid!,
          nombre: response.nombre!,
          correo: '', // El backend no devuelve el correo en renew
          rol: response.rol!,
        };

        dispatch({
          type: 'LOGIN',
          payload: { user, token: response.token },
        });
      } else {
        dispatch({ type: 'NOT_AUTHENTICATED' });
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      dispatch({ type: 'NOT_AUTHENTICATED' });
    }
  };

  /**
   * LOGIN
   * 
   * Inicia sesión con correo y contraseña.
   */
  const login = async (credentials: LoginData): Promise<boolean> => {
    try {
      dispatch({ type: 'CHECKING' });

      const response = await authService.login(credentials);

      if (response.ok && response.token) {
        const user: Usuario = {
          uid: response.uid!,
          nombre: response.nombre!,
          correo: credentials.correo,
          rol: response.rol!,
        };

        dispatch({
          type: 'LOGIN',
          payload: { user, token: response.token },
        });

        return true;
      } else {
        dispatch({
          type: 'SET_ERROR',
          payload: response.msg || 'Error al iniciar sesión',
        });
        return false;
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Error al iniciar sesión';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      return false;
    }
  };

  /**
   * REGISTER
   * 
   * Registra un nuevo usuario.
   */
  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      dispatch({ type: 'CHECKING' });

      const response = await authService.register(userData);

      if (response.ok && response.token) {
        const user: Usuario = {
          uid: response.uid!,
          nombre: response.nombre!,
          correo: userData.correo,
          rol: response.rol!,
        };

        dispatch({
          type: 'LOGIN',
          payload: { user, token: response.token },
        });

        return true;
      } else {
        dispatch({
          type: 'SET_ERROR',
          payload: response.msg || 'Error al registrarse',
        });
        return false;
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Error al registrarse';
      dispatch({ type: 'SET_ERROR', payload: errorMsg });
      return false;
    }
  };

  /**
   * LOGOUT
   * 
   * Cierra la sesión del usuario.
   */
  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  /**
   * CLEAR ERROR
   * 
   * Limpia el mensaje de error.
   */
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Valor del contexto
  const value: AuthContextType = {
    authState,
    login,
    register,
    logout,
    checkAuth,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ========================================
// HOOK PERSONALIZADO
// ========================================

/**
 * useAuth Hook
 * 
 * Hook para acceder al contexto de autenticación.
 * Lanza error si se usa fuera del Provider.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }

  return context;
};