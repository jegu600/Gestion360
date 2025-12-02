import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { Tarea, Usuario, PrioridadTarea } from '../../types';
import { obtenerUsuarios } from '../../services/usuariosService';
import { cambiarEstadoTarea, actualizarTarea, eliminarTarea } from '../../services/tareasService';
import './TaskCard.css';

interface TaskCardProps {
  tarea: Tarea;
  onUpdate: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ tarea, onUpdate }) => {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isEditingAssignee, setIsEditingAssignee] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    titulo: tarea.titulo,
    descripcion: tarea.descripcion,
    fechaLimite: tarea.fechaLimite,
    prioridad: tarea.prioridad || 'Media',
    responsable: typeof tarea.responsable === 'object' ? tarea.responsable.uid : tarea.responsable
  });

  useEffect(() => {
    if (isEditingAssignee || isEditing) {
      loadUsuarios();
    }
  }, [isEditingAssignee, isEditing]);

  const loadUsuarios = async () => {
    const response = await obtenerUsuarios();
    if (response.ok) {
      setUsuarios(response.usuarios);
    }
  };

  const handleAssigneeChange = async (userId: string) => {
    const response = await actualizarTarea(tarea.id || tarea._id as string, { ...tarea, responsable: userId } as any);
    if (response.ok) {
      setIsEditingAssignee(false);
      onUpdate();
    }
  };

  const handleSaveEdit = async () => {
    const response = await actualizarTarea(tarea.id || tarea._id as string, editData as any);
    if (response.ok) {
      setIsEditing(false);
      onUpdate();
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      titulo: tarea.titulo,
      descripcion: tarea.descripcion,
      fechaLimite: tarea.fechaLimite,
      prioridad: tarea.prioridad || 'Media',
      responsable: typeof tarea.responsable === 'object' ? tarea.responsable.uid : tarea.responsable
    });
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de eliminar esta tarea?')) {
      const response = await eliminarTarea(tarea.id || tarea._id as string);
      if (response.ok) {
        onUpdate();
      }
    }
  };

  const responsableName = (tarea.responsable && typeof tarea.responsable === 'object') ? tarea.responsable.nombre : 'Sin asignar';
  const isAdmin = user?.rol === 'admin';

  // Vista de edición
  if (isEditing && isAdmin) {
    return (
      <div className="task-card bg-white p-3 shadow-sm rounded mb-3 border-primary border-2">
        <div className="mb-3">
          <label className="form-label fw-bold small">Título</label>
          <input
            type="text"
            className="form-control form-control-sm"
            value={editData.titulo}
            onChange={(e) => setEditData({ ...editData, titulo: e.target.value })}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold small">Descripción</label>
          <textarea
            className="form-control form-control-sm"
            rows={3}
            value={editData.descripcion}
            onChange={(e) => setEditData({ ...editData, descripcion: e.target.value })}
          />
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label fw-bold small">Prioridad</label>
            <select
              className="form-select form-select-sm"
              value={editData.prioridad}
              onChange={(e) => setEditData({ ...editData, prioridad: e.target.value as PrioridadTarea })}
            >
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
              <option value="Urgente">Urgente</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold small">Fecha Límite</label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={editData.fechaLimite ? new Date(editData.fechaLimite).toISOString().split('T')[0] : ''}
              onChange={(e) => setEditData({ ...editData, fechaLimite: e.target.value })}
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold small">Responsable</label>
          <select
            className="form-select form-select-sm"
            value={editData.responsable}
            onChange={(e) => setEditData({ ...editData, responsable: e.target.value })}
          >
            <option value="">Seleccionar...</option>
            {usuarios.map(u => (
              <option key={u.uid} value={u.uid}>{u.nombre}</option>
            ))}
          </select>
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-primary btn-sm flex-grow-1" onClick={handleSaveEdit}>
            <i className="fas fa-save me-1"></i> Guardar
          </button>
          <button className="btn btn-secondary btn-sm flex-grow-1" onClick={handleCancelEdit}>
            <i className="fas fa-times me-1"></i> Cancelar
          </button>
        </div>
      </div>
    );
  }

  // Vista normal
  return (
    <div className="task-card bg-white p-3 shadow-sm rounded mb-3 border-0">
      <h5 className="task-title fw-bold mb-2">{tarea.titulo}</h5>

      <div className="d-flex gap-2 mb-3">
        <span className={`badge rounded-pill px-3 ${tarea.prioridad === 'Alta' || tarea.prioridad === 'Urgente' ? 'bg-danger' : tarea.prioridad === 'Media' ? 'bg-warning text-dark' : 'bg-success'}`}>
          {tarea.prioridad || 'Media'}
        </span>
        <span className="badge bg-light text-dark border rounded-pill px-3">
          {tarea.estado}
        </span>
      </div>

      <p className="task-description text-muted small mb-3">{tarea.descripcion}</p>

      <div className="mb-3">
        <div className="d-flex align-items-center gap-2 mb-2">
          <i className="fas fa-user text-secondary"></i>
          {isEditingAssignee && isAdmin ? (
            <select
              autoFocus
              className="form-select form-select-sm"
              onBlur={() => setIsEditingAssignee(false)}
              onChange={(e) => handleAssigneeChange(e.target.value)}
              defaultValue={typeof tarea.responsable === 'object' ? tarea.responsable.uid : tarea.responsable}
            >
              <option value="">Seleccionar...</option>
              {usuarios.map(u => (
                <option key={u.uid} value={u.uid}>{u.nombre}</option>
              ))}
            </select>
          ) : (
            <span
              className={`fw-bold ${isAdmin ? 'cursor-pointer' : ''}`}
              onClick={() => isAdmin && setIsEditingAssignee(true)}
              title={isAdmin ? "Click para cambiar asignación" : "Responsable"}
            >
              {responsableName}
            </span>
          )}
        </div>
        <div className="d-flex align-items-center gap-2 text-muted small">
          <i className="far fa-clock"></i>
          <span>{new Date(tarea.fechaLimite).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      <div className="mt-3">
        <select
          className="form-select form-select-sm bg-light border-0 mb-2"
          value={tarea.estado}
          onChange={async (e) => {
            await cambiarEstadoTarea(tarea.id || tarea._id as string, e.target.value as any);
            onUpdate();
          }}
        >
          <option value="Pendiente">Pendiente</option>
          <option value="En_progreso">En Progreso</option>
          <option value="Completada">Completada</option>
        </select>
        {isAdmin && (
          <div className="d-flex gap-2">
            <button
              className="btn btn-primary w-50 btn-sm"
              onClick={() => setIsEditing(true)}
              title="Editar tarea"
            >
              <i className="fas fa-edit me-1"></i> Editar
            </button>
            <button className="btn btn-danger w-50 btn-sm" onClick={handleDelete}>
              <i className="fas fa-trash me-1"></i> Eliminar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;

