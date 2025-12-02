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
import type { TareaFormData } from '../../types';
import './DashboardPage.css';

export const DashboardPage = () => {
  const auth = useAuth();
  const user = (auth as any).user;
  const { tareas, crearTarea, usuarios, loadingUsuarios, obtenerTareas } = useTareas();

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

  // Abrir modal
  const handleNuevaTarea = () => {
    setShowModal(true);
  };

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
      console.log('❌ Formulario inválido');
      return;
    }

    console.log('📤 Datos del formulario a enviar:', formData);

    setIsSubmitting(true);

    try {
      const result = await crearTarea(formData);
      console.log('📥 Resultado de crear tarea:', result);
      
      if (result) {
        console.log('✅ Tarea creada exitosamente');
        
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
        
        // Recargar las tareas
        await obtenerTareas();
      } else {
        console.error('❌ No se pudo crear la tarea');
      }
    } catch (error) {
      console.error('❌ Error al crear tarea:', error);
    } finally {
      setIsSubmitting(false);
    }
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

  // Renderizar el estado vacío
  const renderEmptyState = () => (
    <Card>
      <div className="empty-state">
        <div className="empty-icon">
          <i className="fas fa-clipboard-list"></i>
        </div>
        <h3 className="empty-title">No hay tareas creadas todavía</h3>
        <p className="empty-text">Haz clic en "Nueva Tarea" para comenzar</p>
      </div>
    </Card>
  );

  // Renderizar lista de tareas (cuando existan)
  const renderTareasList = () => (
    <div className="tareas-grid">
      {tareas.map(tarea => {
        // Obtener información del responsable
        const responsable = typeof tarea.responsable === 'object' 
          ? tarea.responsable 
          : usuarios.find(u => u.uid === tarea.responsable);

        return (
          <Card key={tarea._id} hoverable>
            <div className="tarea-card">
              <div className="tarea-header">
                <h3 className="tarea-titulo">{tarea.titulo}</h3>
                <span className={`tarea-badge badge-${tarea.estado}`}>
                  {tarea.estado}
                </span>
              </div>
              <p className="tarea-descripcion">{tarea.descripcion}</p>
              
              {/* Información del responsable */}
              {responsable && (
                <div className="tarea-responsable">
                  <i className="fas fa-user-circle me-2"></i>
                  <span className="text-muted">{responsable.nombre}</span>
                </div>
              )}
              
              {tarea.fechaLimite && (
                <div className="tarea-footer">
                  <span className="tarea-fecha">
                    <i className="far fa-calendar"></i>
                    {new Date(tarea.fechaLimite).toLocaleDateString('es-ES')}
                  </span>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="dashboard-page">
      <Navbar />

      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-text">
            <h1 className="dashboard-title">Panel de Administración</h1>
            <p className="dashboard-subtitle">Gestiona y asigna tareas a tu equipo</p>
            <p className="dashboard-user">Hola, {user?.nombre || 'Usuario'}</p>
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

        {/* Estadísticas rápidas */}
        {tareas.length > 0 && (
          <div className="stats-row">
            <Card hoverable>
              <div className="stat-item">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Total</span>
              </div>
            </Card>
            <Card hoverable>
              <div className="stat-item">
                <span className="stat-value">{stats.pendientes}</span>
                <span className="stat-label">Pendientes</span>
              </div>
            </Card>
            <Card hoverable>
              <div className="stat-item">
                <span className="stat-value">{stats.enProgreso}</span>
                <span className="stat-label">En Progreso</span>
              </div>
            </Card>
            <Card hoverable>
              <div className="stat-item">
                <span className="stat-value">{stats.completadas}</span>
                <span className="stat-label">Completadas</span>
              </div>
            </Card>
          </div>
        )}

        {/* Contenido principal */}
        <div className="dashboard-body">
          {tareas.length === 0 ? renderEmptyState() : renderTareasList()}
        </div>
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
            placeholder="Ej: Implementar módulo de usuarios"
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
              placeholder="Describe los detalles de la tarea..."
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
            label="Fecha de vencimiento"
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

          {/* Responsable (select de usuarios) */}
          <div className="mb-3">
            <label className="form-label fw-semibold">
              Asignar a
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="fas fa-user"></i>
              </span>
              <select
                className="form-select"
                name="responsable"
                value={formData.responsable}
                onChange={handleChange}
                disabled={loadingUsuarios}
              >
                <option value="">Asignarme a mí</option>
                {usuarios.map(usuario => (
                  <option key={usuario.uid} value={usuario.uid}>
                    {usuario.nombre} ({usuario.correo})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-text">
              <i className="fas fa-info-circle me-1"></i>
              Si no seleccionas ninguno, la tarea se te asignará automáticamente
            </div>
          </div>

          {/* Botones */}
          <div className="d-flex gap-2 justify-content-end mt-4">
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              disabled={isSubmitting}
            >
              ✕ Cancelar
            </Button>
            
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              icon="fas fa-check"
            >
              Crear Tarea
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};