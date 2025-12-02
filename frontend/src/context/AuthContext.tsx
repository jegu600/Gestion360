/**
 * AUTH CONTEXT - CORREGIDO
 * 
 * Maneja el estado global de autenticación.
 * Provee funciones para login, register, logout y verificación de sesión.
 * 
 * CORREGIDO: Manejo mejorado de mensajes de error
 */

import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { Usuario, LoginData, RegisterData } from '../types';
import * as authService from '../services/authService';

// Estado de autenticación
type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';

interface AuthState {
  status: AuthStatus;
  user: Usuario | null;
  token: string | null;
  errorMessage: string | null;
}

// Acciones del reducer
type AuthAction =
  | { type: 'CHECKING' }
  | { type: 'LOGIN'; payload: { user: Usuario; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'NOT_AUTHENTICATED' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

// Contexto
interface AuthContextType {
  authState: AuthState;
  login: (credentials: LoginData) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  user: Usuario | null;
}

// Estado inicial
const initialState: AuthState = {
  status: 'checking',
  user: null,
  token: null,
  errorMessage: null,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'CHECKING':
      return {
        ...state,
        status: 'checking',
      };

    case 'LOGIN':
      return {
        status: 'authenticated',
        user: action.payload.user,
        token: action.payload.token,
        errorMessage: null,
      };

    case 'LOGOUT':
    case 'NOT_AUTHENTICATED':
      return {
        status: 'not-authenticated',
        user: null,
        token: null,
        errorMessage: null,
      };

    case 'SET_ERROR':
      return {
        ...state,
        errorMessage: action.payload,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        errorMessage: null,
      };

    default:
      return state;
  }
};

// Crear contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, dispatch] = useReducer(authReducer, initialState);

  // Verificar autenticación al montar
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * LOGIN
   * Inicia sesión con correo y contraseña
   */
  const login = async (credentials: LoginData): Promise<boolean> => {
    try {
      console.log('🔐 AuthContext: Iniciando login...');
      
      dispatch({ type: 'CHECKING' });

      const response = await authService.login(credentials);

      console.log('📥 AuthContext: Respuesta de login:', response);

      if (response.ok && response.token) {
        const user: Usuario = {
          uid: response.uid!,
          nombre: response.nombre!,
          correo: credentials.correo, // Usar el correo del formulario
          rol: response.rol!,
        };

        dispatch({
          type: 'LOGIN',
          payload: { user, token: response.token },
        });

        console.log('✅ AuthContext: Login exitoso');
        return true;
      } else {
        console.error('❌ AuthContext: Login fallido -', response.msg);
        
        // Establecer mensaje de error
        dispatch({
          type: 'SET_ERROR',
          payload: response.msg || 'Error al iniciar sesión',
        });
        
        dispatch({ type: 'NOT_AUTHENTICATED' });
        return false;
      }
    } catch (error: any) {
      console.error('❌ AuthContext: Error en login:', error);
      
      dispatch({
        type: 'SET_ERROR',
        payload: error.message || 'Error de conexión',
      });
      
      dispatch({ type: 'NOT_AUTHENTICATED' });
      return false;
    }
  };

  /**
   * REGISTER
   * Registra un nuevo usuario
   */
  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      console.log('📝 AuthContext: Iniciando registro...');
      
      dispatch({ type: 'CHECKING' });

      const response = await authService.register(userData);

      console.log('📥 AuthContext: Respuesta de registro:', response);

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

        console.log('✅ AuthContext: Registro exitoso');
        return true;
      } else {
        console.error('❌ AuthContext: Registro fallido -', response.msg);
        
        dispatch({
          type: 'SET_ERROR',
          payload: response.msg || 'Error al registrar usuario',
        });
        
        dispatch({ type: 'NOT_AUTHENTICATED' });
        return false;
      }
    } catch (error: any) {
      console.error('❌ AuthContext: Error en registro:', error);
      
      dispatch({
        type: 'SET_ERROR',
        payload: error.message || 'Error de conexión',
      });
      
      dispatch({ type: 'NOT_AUTHENTICATED' });
      return false;
    }
  };

  /**
   * LOGOUT
   * Cierra sesión y limpia el token
   */
  const logout = () => {
    console.log('👋 AuthContext: Cerrando sesión...');
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  /**
   * CHECK AUTH
   * Verifica si el usuario tiene una sesión activa
   */
  const checkAuth = async () => {
    const token = authService.getTokenFromStorage();

    if (!token) {
      dispatch({ type: 'NOT_AUTHENTICATED' });
      return;
    }

    try {
      console.log('🔄 AuthContext: Verificando sesión...');
      
      dispatch({ type: 'CHECKING' });

      const response = await authService.renewToken();

      if (response.ok && response.token) {
        const user: Usuario = {
          uid: response.uid!,
          nombre: response.nombre!,
          correo: '', // No tenemos el correo en el renovar token
          rol: response.rol!,
        };

        dispatch({
          type: 'LOGIN',
          payload: { user, token: response.token },
        });

        console.log('✅ AuthContext: Sesión válida');
      } else {
        console.warn('⚠️ AuthContext: Token inválido');
        dispatch({ type: 'NOT_AUTHENTICATED' });
      }
    } catch (error) {
      console.error('❌ AuthContext: Error al verificar sesión:', error);
      dispatch({ type: 'NOT_AUTHENTICATED' });
    }
  };

  /**
   * CLEAR ERROR
   * Limpia el mensaje de error
   */
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    authState,
    login,
    register,
    logout,
    checkAuth,
    clearError,
    user: authState.user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * HOOK PERSONALIZADO
 * Hook para usar el contexto de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};