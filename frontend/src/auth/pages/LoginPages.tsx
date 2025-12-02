/**
 * LOGIN PAGE
 * 
 * Página de inicio de sesión con validación y manejo de errores.
 * 
 * SIMPLIFICADO: Muestra directamente el mensaje de error del backend
 */

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm, validaciones } from '../../hooks/useForm';
import type { LoginData, FormErrors } from '../../types';
import './LoginPages.css';
import { Button } from '../../components/common/Button';

export const LoginPages = () => {
  const navigate = useNavigate();
  const { login, authState, clearError } = useAuth();
  const [loginError, setLoginError] = useState<string>('');

  // Limpiar error al montar el componente
  useEffect(() => {
    clearError();
  }, []);

  /**
   * VALIDACIÓN DEL FORMULARIO
   */
  const validate = (values: LoginData): FormErrors => {
    const errors: FormErrors = {};

    // Validar email
    const emailError = validaciones.email(values.correo);
    if (emailError) errors.correo = emailError;

    // Validar password
    const passwordError = validaciones.minLength(values.password, 8, 'La contraseña');
    if (passwordError) errors.password = passwordError;

    return errors;
  };
  
  /**
   * SUBMIT DEL FORMULARIO
   */
  const handleLogin = async (values: LoginData) => {
    // Limpiar errores anteriores
    setLoginError('');
    clearError();

    console.log('🔐 Intentando login...');
    
    const success = await login(values);
    
    if (success) {
      console.log('✅ Login exitoso, redirigiendo...');
      // Redirigir al dashboard después de login exitoso
      navigate('/', { replace: true });
    } else {
      console.error('❌ Login fallido');
      
      // Mostrar mensaje de error específico
      const errorMsg = authState.errorMessage || 'Credenciales incorrectas';
      
      // Personalizar mensaje según el error
      if (errorMsg.toLowerCase().includes('correo') || errorMsg.toLowerCase().includes('email')) {
        setLoginError('El correo electrónico no está registrado');
      } else if (errorMsg.toLowerCase().includes('contraseña') || errorMsg.toLowerCase().includes('password')) {
        setLoginError('La contraseña es incorrecta');
      } else if (errorMsg.toLowerCase().includes('credenciales')) {
        setLoginError('Correo o contraseña incorrectos');
      } else {
        setLoginError(errorMsg);
      }
    }
  };

  // Hook de formulario
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm<LoginData>({
    initialValues: {
      correo: '',
      password: '',
    },
    validate,
    onSubmit: handleLogin,
  });

  return (
    <div className="login-page">
      <div className="login-card">
        {/* LOGO */}
        <div className="logo-container">
          <img 
            src="/src/assets/logo.png" 
            alt="Gestión 360 Logo" 
            className="login-logo"
          />
        </div>

        {/* HEADER */}
        <div className="login-header">
          <h1 className="login-title">Iniciar Sesión</h1>
          <p className="login-subtitle">Ingresa tus credenciales para acceder</p>
        </div>
        {/* MENSAJE DE ERROR DE LOGIN */}
        {(loginError || authState.errorMessage) && (
          <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
            <i className="fas fa-exclamation-circle me-2"></i>
            <strong>Error:</strong> {loginError || authState.errorMessage}
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setLoginError('');
                clearError();
              }}
              aria-label="Close"
            ></button>
          </div>
        )}
        

        <form onSubmit={handleSubmit} className="login-form">
          {/* CAMPO EMAIL */}
          <div className="form-group">
            <label htmlFor="correo" className="form-label">
              <i className="fas fa-envelope me-2"></i>
              Email
            </label>
            <input
              type="email"
              className={`form-input ${
                touched.correo && errors.correo ? 'input-error' : ''
              } ${loginError && loginError.includes('correo') ? 'input-error' : ''}`}
              id="correo"
              name="correo"
              placeholder="ejemplo@empresa.com"
              value={values.correo}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              autoComplete="email"
            />
            {touched.correo && errors.correo && (
              <span className="error-message">
                <i className="fas fa-exclamation-triangle me-1"></i>
                {errors.correo}
              </span>
            )}
          </div>

          {/* CAMPO PASSWORD */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <i className="fas fa-lock me-2"></i>
              Contraseña
            </label>
            <input
              type="password"
              className={`form-input ${
                touched.password && errors.password ? 'input-error' : ''
              } ${loginError && loginError.includes('contraseña') ? 'input-error' : ''}`}
              id="password"
              name="password"
              placeholder="••••••••"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              autoComplete="current-password"
            />
            {touched.password && errors.password && (
              <span className="error-message">
                <i className="fas fa-exclamation-triangle me-1"></i>
                {errors.password}
              </span>
            )}
          </div>

          {/* BOTÓN SUBMIT */}
          <Button
            type="submit"
            variant="primary"
            className="btn-submit w-100"
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>

          {/* LINK A REGISTRO */}
          <div className="login-footer">
            <p className="register-text">
              ¿No tienes cuenta?{' '}
              <Link to="/auth/registro" className="register-link">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

