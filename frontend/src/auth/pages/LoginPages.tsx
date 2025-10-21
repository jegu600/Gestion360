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
    <div className="fondo-imagen d-flex align-items-center justify-content-center vh-100">
      <div className="login-container p-5 shadow-lg rounded-4 bg-light">
        <h2 className="text-center mb-4 fw-bold text-dark">Iniciar Sesión</h2>

        {/* MENSAJE DE ERROR GLOBAL */}
        {authState.errorMessage && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
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

        <form onSubmit={handleSubmit}>
          {/* CAMPO EMAIL */}
          <div className="mb-3">
            <label htmlFor="correo" className="form-label fw-semibold">
              Correo Electrónico
            </label>
            <input
              type="email"
              className={`form-control form-control-lg ${
                touched.correo && errors.correo ? 'is-invalid' : ''
              }`}
              id="correo"
              name="correo"
              placeholder="ejemplo@correo.com"
              value={values.correo}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
            />
            {touched.correo && errors.correo && (
              <div className="invalid-feedback">{errors.correo}</div>
            )}
          </div>

          {/* CAMPO PASSWORD */}
          <div className="mb-4">
            <label htmlFor="password" className="form-label fw-semibold">
              Contraseña
            </label>
            <input
              type="password"
              className={`form-control form-control-lg ${
                touched.password && errors.password ? 'is-invalid' : ''
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
              <div className="invalid-feedback">{errors.password}</div>
            )}
          </div>

          {/* BOTÓN SUBMIT */}
          <div className="d-grid">
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt me-2"></i>
                  Iniciar Sesión
                </>
              )}
            </button>
          </div>

          {/* LINK A RECUPERAR CONTRASEÑA */}
          <div className="text-center mt-4">
            <a href="#" className="text-decoration-none">
              <i className="fas fa-key me-1"></i>
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {/* LINK A REGISTRO */}
          <div className="text-center mt-3">
            <p className="mb-0">
              ¿No tienes cuenta?{' '}
              <Link to="/auth/registro" className="fw-bold text-decoration-none">
                 Regístrate aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};