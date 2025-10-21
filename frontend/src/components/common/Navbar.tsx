/**
 * NAVBAR COMPONENT
 * 
 * Barra de navegación principal con:
 * - Logo y nombre de la app
 * - Notificaciones con badge
 * - Menú de usuario con dropdown
 * - Botón de logout
 */

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotificaciones } from '../../context/NotificacionesContext';
import './Navbar.css';

export const Navbar = () => {
  const { authState, logout } = useAuth();
  const { notificaciones, noLeidas, obtenerNotificaciones, marcarComoLeida } = useNotificaciones();
  
  // Estados locales
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Referencias para cerrar dropdowns al hacer click fuera
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  /**
   * CARGAR NOTIFICACIONES AL MONTAR
   */
  useEffect(() => {
    obtenerNotificaciones();
  }, []);

  /**
   * CERRAR DROPDOWNS AL HACER CLICK FUERA
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * TOGGLE NOTIFICACIONES
   */
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowUserMenu(false);
    if (!showNotifications) {
      obtenerNotificaciones();
    }
  };

  /**
   * TOGGLE MENÚ DE USUARIO
   */
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    setShowNotifications(false);
  };

  /**
   * MANEJAR CLICK EN NOTIFICACIÓN
   */
  const handleNotificationClick = async (notifId: string, tareaId?: string) => {
    await marcarComoLeida(notifId);
    setShowNotifications(false);
    
    // Si tiene tarea asociada, redirigir
    if (tareaId) {
      window.location.href = `/tareas/${tareaId}`;
    }
  };

  /**
   * MANEJAR LOGOUT
   */
  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  // Obtener solo las últimas 5 notificaciones no leídas para el dropdown
  const notificacionesRecientes = notificaciones
    .filter(n => !n.leida)
    .slice(0, 5);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container-fluid">
        {/* LOGO Y NOMBRE */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <i className="fas fa-tasks me-2 fs-4"></i>
          <span className="fw-bold">Gestión360</span>
        </Link>

        {/* BOTÓN MOBILE */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* CONTENIDO DEL NAVBAR */}
        <div className="collapse navbar-collapse" id="navbarContent">
          {/* ENLACES DE NAVEGACIÓN */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                <i className="fas fa-home me-1"></i>
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/tareas">
                <i className="fas fa-list me-1"></i>
                Tareas
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/crear-tarea">
                <i className="fas fa-plus-circle me-1"></i>
                Nueva Tarea
              </Link>
            </li>
          </ul>

          {/* SECCIÓN DERECHA: NOTIFICACIONES Y USUARIO */}
          <div className="d-flex align-items-center gap-3">
            
            {/* NOTIFICACIONES DROPDOWN */}
            <div className="position-relative" ref={notifRef}>
              <button
                className="btn btn-link text-white position-relative p-2"
                onClick={toggleNotifications}
                aria-label="Notificaciones"
              >
                <i className="fas fa-bell fs-5"></i>
                {noLeidas > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {noLeidas > 99 ? '99+' : noLeidas}
                  </span>
                )}
              </button>

              {/* DROPDOWN DE NOTIFICACIONES */}
              {showNotifications && (
                <div className="notification-dropdown shadow-lg">
                  <div className="notification-header">
                    <h6 className="mb-0">
                      <i className="fas fa-bell me-2"></i>
                      Notificaciones
                    </h6>
                    {noLeidas > 0 && (
                      <span className="badge bg-danger">{noLeidas} nuevas</span>
                    )}
                  </div>

                  <div className="notification-body">
                    {notificacionesRecientes.length > 0 ? (
                      <>
                        {notificacionesRecientes.map((notif) => (
                          <div
                            key={notif.id}
                            className="notification-item"
                            onClick={() => handleNotificationClick(notif.id, notif.tarea_id as string)}
                          >
                            <div className="notification-icon">
                              <i className={`fas fa-${notif.tipo === 'tarea_asignada' ? 'tasks' : 'info-circle'}`}></i>
                            </div>
                            <div className="notification-content">
                              <p className="notification-text">{notif.mensaje}</p>
                              <small className="notification-time">
                                {new Date(notif.fecha).toLocaleString('es-ES', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  day: '2-digit',
                                  month: 'short'
                                })}
                              </small>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="text-center py-4 text-muted">
                        <i className="fas fa-inbox fa-2x mb-2"></i>
                        <p className="mb-0">No hay notificaciones nuevas</p>
                      </div>
                    )}
                  </div>

                  {notificacionesRecientes.length > 0 && (
                    <div className="notification-footer">
                      <Link to="/notificaciones" onClick={() => setShowNotifications(false)}>
                        Ver todas las notificaciones
                        <i className="fas fa-arrow-right ms-2"></i>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* USUARIO DROPDOWN */}
            <div className="position-relative" ref={userRef}>
              <button
                className="btn btn-link text-white d-flex align-items-center gap-2 p-2 text-decoration-none"
                onClick={toggleUserMenu}
              >
                <div className="user-avatar">
                  {authState.user?.nombre?.charAt(0).toUpperCase()}
                </div>
                <span className="d-none d-md-inline">{authState.user?.nombre}</span>
                <i className="fas fa-chevron-down small"></i>
              </button>

              {/* DROPDOWN DE USUARIO */}
              {showUserMenu && (
                <div className="user-dropdown shadow-lg">
                  <div className="user-dropdown-header">
                    <div className="user-avatar-large">
                      {authState.user?.nombre?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h6 className="mb-0">{authState.user?.nombre}</h6>
                      <small className="text-muted">{authState.user?.correo}</small>
                      <div>
                        <span className={`badge ${authState.user?.rol === 'admin' ? 'bg-warning' : 'bg-info'} mt-1`}>
                          {authState.user?.rol === 'admin' ? 'Administrador' : 'Usuario'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="dropdown-divider"></div>

                  <Link to="/perfil" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                    <i className="fas fa-user me-2"></i>
                    Mi Perfil
                  </Link>

                  <Link to="/configuracion" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                    <i className="fas fa-cog me-2"></i>
                    Configuración
                  </Link>

                  <div className="dropdown-divider"></div>

                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt me-2"></i>
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};