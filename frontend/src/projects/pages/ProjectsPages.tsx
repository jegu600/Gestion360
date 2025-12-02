import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import TaskBoard from '../components/TaskBoard';
import TaskForm from '../components/TaskForm';
import { Button } from '../../components/common/Button';
import { MainLayout } from '../../components/layout/MainLayout';
import './ProjectsPages.css';

export const ProjectsPages = () => {
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const boardRef = useRef<{ fetchTasks: () => void }>(null);

  const handleTaskCreated = () => {
    // Reload to refresh tasks
    window.location.reload();
  };

  return (
    <MainLayout>
      <div className="projects-page">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1">Panel de Administración</h2>
            <p className="text-muted mb-0">Gestiona y asigna tareas a tu equipo</p>
          </div>
          {!showCreateForm && user?.rol === 'admin' && (
            <Button
              variant="primary"
              onClick={() => setShowCreateForm(true)}
              style={{ backgroundColor: '#e76f51', borderColor: '#e76f51' }}
            >
              <i className="fas fa-plus me-2"></i>
              Nueva Tarea
            </Button>
          )}
        </div>

        {showCreateForm ? (
          <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '12px' }}>
            <h4 className="mb-4">Crear Nueva Tarea</h4>
            <TaskForm
              isOpen={true}
              onClose={() => setShowCreateForm(false)}
              onSuccess={handleTaskCreated}
              inline={true}
            />
          </div>
        ) : (
          <div className="page-content">
            <TaskBoard />
          </div>
        )}
      </div>
    </MainLayout>
  );
};