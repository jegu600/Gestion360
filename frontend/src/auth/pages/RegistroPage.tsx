
/**
 * REGISTRO PAGE
 * 
 * Página de registro de nuevos usuarios.
 * Incluye validación completa y manejo de errores.
 * 
 */

import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm, validaciones } from '../../hooks/useForm';
import type { RegisterData, FormErrors } from '../../types';
import './RegistroPage.css';

// Interfaz extendida para incluir confirmación de contraseña
interface RegisterFormData extends RegisterData {
  confirmarPassword: string;
}

export const RegistroPage = () => {
  const navigate = useNavigate();
  const { register, authState, clearError } = useAuth();

  // Limpiar error al montar el componente
  useEffect(() => {
    clearError();
  }, []);

  /**
   * VALIDACIÓN DEL FORMULARIO
   */
  const validate = (values: RegisterFormData): FormErrors => {
    const errors: FormErrors = {};

    // Validar nombre
    const nombreError = validaciones.requerido(values.nombre, 'El nombre');
    if (nombreError) errors.nombre = nombreError;
    else {
      const minError = validaciones.minLength(values.nombre, 3, 'El nombre');
      if (minError) errors.nombre = minError;
    }

    // Validar email
    const emailError = validaciones.email(values.correo);
    if (emailError) errors.correo = emailError;

    // Validar password
    const passwordError = validaciones.requerido(values.password, 'La contraseña');
    if (passwordError) {
      errors.password = passwordError;
    } else {
      const minError = validaciones.minLength(values.password, 8, 'La contraseña');
      if (minError) errors.password = minError;
    }

    // Validar confirmación de password
    const confirmarError = validaciones.requerido(values.confirmarPassword, 'La confirmación');
    if (confirmarError) {
      errors.confirmarPassword = confirmarError;
    } else {
      const matchError = validaciones.matchPassword(values.password, values.confirmarPassword);
      if (matchError) errors.confirmarPassword = matchError;
    }

    // Validar rol
    if (!values.rol) {
      errors.rol = 'Debes seleccionar un rol';
    }

    return errors;
  };

  /**
   * SUBMIT DEL FORMULARIO
   */
  const handleRegister = async (values: RegisterFormData) => {
    // Crear objeto sin el campo confirmarPassword
    const { confirmarPassword, ...registerData } = values;

    const success = await register(registerData);

    if (success) {
      // Redirigir al dashboard después de registro exitoso
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
  } = useForm<RegisterFormData>({
    initialValues: {
      nombre: '',
      correo: '',
      password: '',
      confirmarPassword: '',
      rol: 'usuario', // Por defecto usuario
    },
    validate,
    onSubmit: handleRegister,
  });

  return (
    <div className="fondo-imagen-registro d-flex align-items-center justify-content-center min-vh-100 py-4">
      <div className="registro-container p-4 p-md-5 shadow-lg rounded-4 bg-light">
        <div className="text-center mb-4">
          <i className="fas fa-user-plus fa-3x text-primary mb-3"></i>
          <h2 className="fw-bold text-dark">Crear Cuenta</h2>
          <p className="text-muted">Completa el formulario para registrarte</p>
        </div>

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
          {/* CAMPO NOMBRE */}
          <div className="mb-3">
            <label htmlFor="nombre" className="form-label fw-semibold">
              <i className="fas fa-user me-2"></i>
              Nombre Completo
            </label>
            <input
              type="text"
              className={`form-control ${touched.nombre && errors.nombre ? 'is-invalid' : ''
                }`}
              id="nombre"
              name="nombre"
              placeholder="Juan Pérez"
              value={values.nombre}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
            />
            {touched.nombre && errors.nombre && (
              <div className="invalid-feedback">{errors.nombre}</div>
            )}
          </div>

          {/* CAMPO EMAIL */}
          <div className="mb-3">
            <label htmlFor="correo" className="form-label fw-semibold">
              <i className="fas fa-envelope me-2"></i>
              Correo Electrónico
            </label>
            <input
              type="email"
              className={`form-control ${touched.correo && errors.correo ? 'is-invalid' : ''
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

          {/* CAMPO ROL */}
          <div className="mb-3">
            <label htmlFor="rol" className="form-label fw-semibold">
              <i className="fas fa-user-tag me-2"></i>
              Rol
            </label>
            <select
              className={`form-select ${touched.rol && errors.rol ? 'is-invalid' : ''
                }`}
              id="rol"
              name="rol"
              value={values.rol}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
            >
              <option value="">Selecciona un rol</option>
              <option value="usuario">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
            {touched.rol && errors.rol && (
              <div className="invalid-feedback">{errors.rol}</div>
            )}
            <small className="text-muted">
              <i className="fas fa-info-circle me-1"></i>
              Los usuarios pueden gestionar tareas. Los administradores tienen permisos adicionales.
            </small>
          </div>

          {/* CAMPO PASSWORD */}
          <div className="mb-3">
            <label htmlFor="password" className="form-label fw-semibold">
              <i className="fas fa-lock me-2"></i>
              Contraseña
            </label>
            <input
              type="password"
              className={`form-control ${touched.password && errors.password ? 'is-invalid' : ''
                }`}
              id="password"
              name="password"
              placeholder="Mínimo 8 caracteres"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
            />
            {touched.password && errors.password && (
              <div className="invalid-feedback">{errors.password}</div>
            )}
          </div>

          {/* CAMPO CONFIRMAR PASSWORD */}
          <div className="mb-4">
            <label htmlFor="confirmarPassword" className="form-label fw-semibold">
              <i className="fas fa-lock me-2"></i>
              Confirmar Contraseña
            </label>
            <input
              type="password"
              className={`form-control ${touched.confirmarPassword && errors.confirmarPassword ? 'is-invalid' : ''
                }`}
              id="confirmarPassword"
              name="confirmarPassword"
              placeholder="Repite tu contraseña"
              value={values.confirmarPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
            />
            {touched.confirmarPassword && errors.confirmarPassword && (
              <div className="invalid-feedback">{errors.confirmarPassword}</div>
            )}
          </div>

          {/* BOTÓN SUBMIT */}
          <div className="d-grid mb-3">
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Registrando...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus me-2"></i>
                  Registrarse
                </>
              )}
            </button>
          </div>

          {/* TÉRMINOS Y CONDICIONES */}
          <div className="text-center mb-3">
            <small className="text-muted">
              Al registrarte, aceptas nuestros{' '}
              <a href="#" className="text-decoration-none">Términos y Condiciones</a>
              {' '}y{' '}
              <a href="#" className="text-decoration-none">Política de Privacidad</a>
            </small>
          </div>

          {/* LINK A LOGIN */}
          <div className="text-center">
            <p className="mb-0">
              ¿Ya tienes cuenta?{' '}
              <Link to="/auth/login" className="fw-bold text-decoration-none">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
