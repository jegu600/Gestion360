import React from "react";
import "./Dashboard.css";
import logo from "../../assets/logo.png";
import { useAuth } from "../../context/AuthContext";
export const Dashboard: React.FC = () => {
  const { logout } = useAuth(); // función para salir

  return (
    <div className="dashboard-container">
      {/* NAVBAR SUPERIOR */}
      <nav className="navbar">
        <div className="navbar-left">
          <img src={logo} alt="Gestión 360" className="logo" />
          <h1></h1>
        </div>

        <div className="navbar-right">
          <div className="notification">
            <span className="bell">🔔</span>
            <span className="notif-dot">1</span>
          </div>

          <div className="user-info">
            <p className="user-name">Nombre Admin</p>
            <span className="user-role">Admin</span>
          </div>

          {/* Botón de salir */}
          <button className="logout-btn" onClick={logout}>
            ⏻ Salir
          </button>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <main className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <h2>Panel de Administración</h2>
            <p>Gestiona y asigna tareas a tu equipo</p>
          </div>
          <button className="new-task-btn">+ Nueva Tarea</button>
        </header>

        <section className="dashboard-body">
          <div className="empty-box">
            <p>No hay tareas creadas todavía</p>
          </div>
        </section>
      </main>
    </div>
  );
};
