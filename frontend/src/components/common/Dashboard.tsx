import React, { useState } from "react";
import "./Dashboard.css";
import logo from "../../assets/logo.png";
import { useAuth } from "../../context/AuthContext";

// Componente del formulario de creación de tareas
interface CrearTareaFormProps {
  onSubmit: (data: {
    titulo: string;
    descripcion: string;
    usuario: string;
    fechaVencimiento: string;
  }) => void;
  onCancel: () => void;
  initialData?: {
    titulo: string;
    descripcion: string;
    usuario: string;
    fechaVencimiento: string;
  };
}

const CrearTareaForm: React.FC<CrearTareaFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
}) => {
  const [titulo, setTitulo] = useState(initialData?.titulo || "");
  const [descripcion, setDescripcion] = useState(initialData?.descripcion || "");
  const [usuario, setUsuario] = useState(initialData?.usuario || "");
  const [fechaVencimiento, setFechaVencimiento] = useState(
    initialData?.fechaVencimiento || ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ titulo, descripcion, usuario, fechaVencimiento });

    // Limpiar formulario
    setTitulo("");
    setDescripcion("");
    setUsuario("");
    setFechaVencimiento("");
  };

  return (
    <div className="crear-tarea-container">
      <h2>Crear Nueva Tarea</h2>
      <form className="crear-tarea-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="titulo">Título</label>
          <input
            type="text"
            id="titulo"
            placeholder="Título de la tarea"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            placeholder="Describe los detalles de la tarea..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="usuario">Asignar a</label>
          <select
            id="usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          >
            <option value="">Selecciona un usuario</option>
            <option value="usuario1">Usuario 1</option>
            <option value="usuario2">Usuario 2</option>
            <option value="usuario3">Usuario 3</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="fechaVencimiento">Fecha de vencimiento</label>
          <input
            type="date"
            id="fechaVencimiento"
            value={fechaVencimiento}
            onChange={(e) => setFechaVencimiento(e.target.value)}
            required
          />
        </div>

        <div className="form-buttons">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            ✖ Cancelar
          </button>
          <button type="submit" className="save-btn">
            Crear Tarea
          </button>
        </div>
      </form>
    </div>
  );
};

// Componente principal del Dashboard
export const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const [crearTareaVisible, setCrearTareaVisible] = useState(false);

  const handleLogout = () => logout();

  const handleCrearTarea = (data: {
    titulo: string;
    descripcion: string;
    usuario: string;
    fechaVencimiento: string;
  }) => {
    console.log(data);
    alert("Tarea creada!");
    setCrearTareaVisible(false);
  };

  return (
    <div className="dashboard-container">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-left">
          <img src={logo} alt="Gestión 360" className="logo" />
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

          <button className="logout-btn" onClick={handleLogout}>
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

          <button
            className="new-task-btn"
            onClick={() => setCrearTareaVisible(true)}
          >
            + Nueva Tarea
          </button>
        </header>

        <section className="dashboard-body">
          {crearTareaVisible ? (
            <CrearTareaForm
              onSubmit={handleCrearTarea}
              onCancel={() => setCrearTareaVisible(false)}
            />
          ) : (
            <div className="empty-box">
              <p>No hay tareas creadas todavía</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};