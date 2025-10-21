/**
 * LOGIN PAGE
 * 
 * Página de inicio de sesión con validación y manejo de errores.
 * 
 * CAMBIO: Agregada lógica completa de login con useAuth y useForm
 */

import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm, validaciones } from '../../hooks/useForm';
import type { LoginData, FormErrors } from '../../types';
import './LoginPages.css';

export const LoginPages = () => {
  const navigate = useNavigate();
  const { login, authState, clearError } = useAuth();

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
    const success = await login(values);
    
    if (success) {
      // Redirigir al dashboard después de login exitoso
      navigate('/', { replace: true });
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
        <div className="logo-container">
          <img 
            src="/src/assets/logo.png" 
            alt="Gestión 360 Logo" 
            className="login-logo"
          />
        </div>
        <div className="login-header">

          <h1 className="login-title">Iniciar Sesión</h1>
          <p className="login-subtitle">Ingresa tus credenciales para acceder</p>
        </div>

        {/* MENSAJE DE ERROR GLOBAL */}
        {authState.errorMessage && (
          <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
            <i className="fas fa-exclamation-circle me-2"></i>
            {authState.errorMessage}
            <button
              type="button"
              className="btn-close"
              onClick={clearError}
              aria-label="Close"
            ></button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          {/* CAMPO EMAIL */}
          <div className="form-group">
            <label htmlFor="correo" className="form-label">
              Email
            </label>
            <input
              type="email"
              className={`form-input ${
                touched.correo && errors.correo ? 'input-error' : ''
              }`}
              id="correo"
              name="correo"
              placeholder="ejemplo@empresa.com"
              value={values.correo}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
            />
            {touched.correo && errors.correo && (
              <span className="error-message">{errors.correo}</span>
            )}
          </div>

          {/* CAMPO PASSWORD */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <input
              type="password"
              className={`form-input ${
                touched.password && errors.password ? 'input-error' : ''
              }`}
              id="password"
              name="password"
              placeholder="••••••••"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
            />
            {touched.password && errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          {/* BOTÓN SUBMIT */}
          <button
            type="submit"
            className="btn-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>

          {/* LINK A REGISTRO */}
          <div className="login-footer">
            <p className="register-text">
              ¿No tienes cuenta?{' '}
              <Link to="/auth/registro" className="register-link">
                Regístrate
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};