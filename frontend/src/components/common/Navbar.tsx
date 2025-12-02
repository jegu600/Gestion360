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
import logo from '../../assets/logo.png';
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
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
      <div className="container-fluid px-4">
        {/* LOGO Y NOMBRE */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img
            id="logo"
            src={logo}
            alt="Gestión 360 Logo"
            style={{ height: '50px', marginRight: '1px' }}
          />

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
        <div className="collapse navbar-collapse justify-content-end" id="navbarContent">

          {/* SECCIÓN DERECHA: NOTIFICACIONES Y USUARIO */}
          <div className="d-flex align-items-center gap-3">

            {/* NOTIFICACIONES DROPDOWN */}
            <div className="position-relative" ref={notifRef}>
              <button
                className="btn btn-light rounded-circle position-relative p-2 border"
                onClick={toggleNotifications}
                aria-label="Notificaciones"
                style={{ width: '40px', height: '40px' }}
              >
                <i className="fas fa-bell text-secondary"></i>
                {noLeidas > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {noLeidas > 99 ? '99+' : noLeidas}
                  </span>
                )}
              </button>

              {/* DROPDOWN DE NOTIFICACIONES */}
              {showNotifications && (
                <div className="notification-dropdown shadow-lg bg-white rounded border" style={{ position: 'absolute', right: 0, top: '120%', width: '300px', zIndex: 1000 }}>
                  <div className="notification-header p-3 border-bottom">
                    <h6 className="mb-0 fw-bold">Notificaciones</h6>
                  </div>

                  <div className="notification-body p-3 text-center">
                    {notificacionesRecientes.length > 0 ? (
                      <>
                        {notificacionesRecientes.map((notif) => (
                          <div
                            key={notif.id}
                            className="notification-item text-start p-2 mb-2 rounded hover-bg-light cursor-pointer"
                            onClick={() => handleNotificationClick(notif.id, notif.tarea_id as string)}
                          >
                            <div className="d-flex align-items-center gap-2">
                              <i className={`fas fa-${notif.tipo === 'tarea_asignada' ? 'tasks' : 'info-circle'} text-primary`}></i>
                              <div>
                                <p className="mb-0 small">{notif.mensaje}</p>
                                <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                  {new Date(notif.fecha).toLocaleString()}
                                </small>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="text-center py-4 text-muted">
                        <i className="fas fa-bell-slash fa-2x mb-2 text-secondary opacity-50"></i>
                        <p className="mb-0 small">No tienes notificaciones</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* USUARIO DROPDOWN */}
            <div className="position-relative" ref={userRef}>
              <div className="d-flex align-items-center gap-2 cursor-pointer" onClick={toggleUserMenu}>
                <div className="text-end d-none d-md-block">
                  <div className="fw-bold small text-dark">{authState.user?.nombre || 'Nombre Admin'}</div>
                  <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{authState.user?.rol || 'Admin'}</div>
                </div>
                <button className="btn btn-outline-secondary d-flex align-items-center gap-2 px-3 rounded-pill">
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Salir</span>
                </button>
              </div>

              {/* DROPDOWN DE USUARIO */}
              {showUserMenu && (
                <div className="user-dropdown shadow-lg bg-white rounded border" style={{ position: 'absolute', right: 0, top: '120%', width: '200px', zIndex: 1000 }}>
                  <div className="p-3 border-bottom">
                    <h6 className="mb-0">{authState.user?.nombre}</h6>
                    <small className="text-muted">{authState.user?.correo}</small>
                  </div>
                  <div className="p-2">
                    <Link to="/perfil" className="dropdown-item p-2 rounded hover-bg-light" onClick={() => setShowUserMenu(false)}>
                      <i className="fas fa-user me-2"></i> Mi Perfil
                    </Link>
                    <Link to="/configuracion" className="dropdown-item p-2 rounded hover-bg-light" onClick={() => setShowUserMenu(false)}>
                      <i className="fas fa-cog me-2"></i> Configuración
                    </Link>
                    <div className="dropdown-divider my-2"></div>
                    <button className="dropdown-item text-danger p-2 rounded hover-bg-light w-100 text-start" onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt me-2"></i> Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};