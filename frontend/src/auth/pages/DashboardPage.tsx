/**
 * DASHBOARD PAGE - REFACTORIZADO
 * 
 * Página principal del dashboard estilo mockup.
 * Panel limpio y minimalista usando componentes reutilizables.
 * 
 * CAMBIO: Refactorizado para usar componentes de common/
 * - Navbar, Card, Button, Input, Modal del common/
 * - Formulario con validación completa
 * - Integración con Context API
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTareas } from '../../context/TareasContext';
import { Navbar } from '../../components/common/Navbar';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/Loader';
import type { TareaFormData } from '../../types';
import './DashboardPage.css';

export const DashboardPage = () => {
  const auth = useAuth();
  const user = (auth as any).user;
  const { tareas, loading, obtenerTareas, crearTarea } = useTareas();

  // Estados para el modal y formulario
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<TareaFormData>({
    titulo: '',
    descripcion: '',
    responsable: '',
    fechaLimite: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar tareas al montar el componente
  useEffect(() => {
    obtenerTareas();
  }, []);

  // Calcular estadísticas
  const stats = {
    total: tareas.length,
    pendientes: tareas.filter(t => String(t.estado) === 'pendiente').length,
    enProgreso: tareas.filter(t => String(t.estado) === 'en-progreso').length,
    completadas: tareas.filter(t => String(t.estado) === 'completada').length,
  };

  // Tareas próximas a vencer (próximos 7 días)
  const tareasProximas = tareas
    .filter(t => {
      if (!t.fechaLimite || String(t.estado) === 'completada') return false;
      const diasRestantes = Math.ceil(
        (new Date(t.fechaLimite).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      return diasRestantes >= 0 && diasRestantes <= 7;
    })
    .sort((a, b) => new Date(a.fechaLimite!).getTime() - new Date(b.fechaLimite!).getTime())
    .slice(0, 5);

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando se modifica
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Marcar campo como tocado
  const handleBlur = (field: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  // Validar un campo específico
  const validateField = (field: string) => {
    const errors: Record<string, string> = {};

    if (field === 'titulo' && !formData.titulo.trim()) {
      errors.titulo = 'El título es requerido';
    } else if (field === 'titulo' && formData.titulo.trim().length < 3) {
      errors.titulo = 'El título debe tener al menos 3 caracteres';
    }

    if (field === 'descripcion' && !formData.descripcion.trim()) {
      errors.descripcion = 'La descripción es requerida';
    }

    if (field === 'fechaLimite' && !formData.fechaLimite) {
      errors.fechaLimite = 'La fecha límite es requerida';
    }

    setFormErrors(prev => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  // Validar todo el formulario
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.titulo.trim()) {
      errors.titulo = 'El título es requerido';
    } else if (formData.titulo.trim().length < 3) {
      errors.titulo = 'El título debe tener al menos 3 caracteres';
    }

    if (!formData.descripcion.trim()) {
      errors.descripcion = 'La descripción es requerida';
    }

    if (!formData.fechaLimite) {
      errors.fechaLimite = 'La fecha límite es requerida';
    }

    setFormErrors(errors);
    
    // Marcar todos los campos como tocados
    setTouchedFields({
      titulo: true,
      descripcion: true,
      fechaLimite: true,
    });

    return Object.keys(errors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await crearTarea(formData);
      
      // Resetear formulario y cerrar modal
      setFormData({
        titulo: '',
        descripcion: '',
        responsable: '',
        fechaLimite: '',
      });
      setFormErrors({});
      setTouchedFields({});
      setShowModal(false);
    } catch (error) {
      console.error('Error al crear tarea:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Abrir modal
  const handleNuevaTarea = () => {
    setShowModal(true);
  };

  // Cerrar modal y resetear
  const handleCloseModal = () => {
    if (!isSubmitting) {
      setShowModal(false);
      setFormData({
        titulo: '',
        descripcion: '',
        responsable: '',
        fechaLimite: '',
      });
      setFormErrors({});
      setTouchedFields({});
    }
  };

  // Formatear fecha
  const formatearFecha = (fecha: string | Date | undefined | null) => {
    if (!fecha) return '';
    const date = fecha instanceof Date ? fecha : new Date(fecha);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  // Calcular días restantes
  const calcularDiasRestantes = (fecha: string | Date | undefined | null) => {
    if (!fecha) return Infinity; // o devuelve null/undefined según tu UI
    const target = fecha instanceof Date ? fecha : new Date(fecha);
    if (isNaN(target.getTime())) return Infinity;
    const dias = Math.ceil(
      (target.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return dias;
  };

  if (loading) {
    return <Loader fullscreen message="Cargando dashboard..." />;
  }

  return (
    <div className="dashboard-page">
      <Navbar />

      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">
              Bienvenido, {user?.nombre}
            </h1>
            <p className="dashboard-subtitle">
              Gestiona tus tareas y proyectos de manera eficiente
            </p>
          </div>
          
          <Button
            variant="primary"
            size="lg"
            icon="fas fa-plus"
            onClick={handleNuevaTarea}
          >
            Nueva Tarea
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="stats-grid">
          <Card hoverable>
            <div className="stat-card">
              <div className="stat-icon stat-icon-total">
                <i className="fas fa-tasks"></i>
              </div>
              <div className="stat-content">
                <p className="stat-label">Total de Tareas</p>
                <h3 className="stat-value">{stats.total}</h3>
              </div>
            </div>
          </Card>

          <Card hoverable>
            <div className="stat-card">
              <div className="stat-icon stat-icon-pending">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-content">
                <p className="stat-label">Pendientes</p>
                <h3 className="stat-value">{stats.pendientes}</h3>
              </div>
            </div>
          </Card>

          <Card hoverable>
            <div className="stat-card">
              <div className="stat-icon stat-icon-progress">
                <i className="fas fa-spinner"></i>
              </div>
              <div className="stat-content">
                <p className="stat-label">En Progreso</p>
                <h3 className="stat-value">{stats.enProgreso}</h3>
              </div>
            </div>
          </Card>

          <Card hoverable>
            <div className="stat-card">
              <div className="stat-icon stat-icon-completed">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stat-content">
                <p className="stat-label">Completadas</p>
                <h3 className="stat-value">{stats.completadas}</h3>
              </div>
            </div>
          </Card>
        </div>

        {/* Tareas próximas a vencer */}
        {tareasProximas.length > 0 ? (
          <Card bordered>
            <div className="card-header mb-3">
              <h3 className="card-title">Tareas Próximas a Vencer</h3>
            </div>
            <div className="tareas-proximas">
              {tareasProximas.map(tarea => {
                const dias = calcularDiasRestantes(tarea.fechaLimite!);
                const urgente = dias <= 2;

                return (
                  <div 
                    key={tarea._id} 
                    className={`tarea-item ${urgente ? 'tarea-urgente' : ''}`}
                  >
                    <div className="tarea-info">
                      <h4 className="tarea-titulo">{tarea.titulo}</h4>
                      <p className="tarea-descripcion">{tarea.descripcion}</p>
                    </div>
                    
                    <div className="tarea-meta">
                      <span className={`tarea-badge ${urgente ? 'badge-urgente' : 'badge-normal'}`}>
                        <i className="far fa-calendar"></i>
                        {formatearFecha(tarea.fechaLimite!)}
                      </span>
                      <span className={`dias-restantes ${urgente ? 'dias-urgente' : ''}`}>
                        {dias === 0 ? 'Hoy' : dias === 1 ? 'Mañana' : `${dias} días`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ) : (
          <Card bordered>
            <div className="empty-state">
              <div className="empty-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <h3 className="empty-title">¡Todo bajo control!</h3>
              <p className="empty-message">
                No tienes tareas próximas a vencer. ¡Buen trabajo!
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Modal para crear tarea */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="Crear Nueva Tarea"
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          {/* Título */}
          <Input
            label="Título de la tarea"
            type="text"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            onBlur={() => handleBlur('titulo')}
            error={formErrors.titulo}
            touched={touchedFields.titulo}
            required
            icon="fas fa-heading"
            placeholder="Ej: Implementar login"
          />

          {/* Descripción */}
          <div className="mb-3">
            <label className="form-label fw-semibold">
              Descripción <span className="text-danger">*</span>
            </label>
            <textarea
              className={`form-control ${
                touchedFields.descripcion && formErrors.descripcion ? 'is-invalid' : ''
              }`}
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              onBlur={() => handleBlur('descripcion')}
              rows={4}
              placeholder="Describe la tarea..."
              required
            />
            {touchedFields.descripcion && formErrors.descripcion && (
              <div className="invalid-feedback d-block">
                {formErrors.descripcion}
              </div>
            )}
          </div>

          {/* Fecha límite */}
          <Input
            label="Fecha límite"
            type="date"
            name="fechaLimite"
            value={formData.fechaLimite}
            onChange={handleChange}
            onBlur={() => handleBlur('fechaLimite')}
            error={formErrors.fechaLimite}
            touched={touchedFields.fechaLimite}
            required
            icon="far fa-calendar"
            min={new Date().toISOString().split('T')[0]}
          />

          {/* Responsable (opcional) */}
          <Input
            label="Responsable (opcional)"
            type="text"
            name="responsable"
            value={formData.responsable}
            onChange={handleChange}
            icon="fas fa-user"
            placeholder="ID del usuario responsable"
            helperText="Deja vacío para asignarte a ti mismo"
          />

          {/* Botones */}
          <div className="d-flex gap-2 justify-content-end mt-4">
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              icon="fas fa-save"
            >
              Crear Tarea
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};