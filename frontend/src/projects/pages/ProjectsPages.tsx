/**
 * PROJECTS PAGES
 * 
 * Router para las páginas del módulo de proyectos/tareas.
 * Maneja las rutas internas de la aplicación autenticada.
 * 
 * CAMBIO: Actualizado para usar estructura correcta con rutas
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage } from '../../auth/pages/DashboardPage';

export const ProjectsPages = () => {
  return (
    <Routes>
      {/* Ruta principal - Dashboard */}
      <Route path="/" element={<DashboardPage />} />
      
      {/* Rutas de tareas - Por implementar */}
      {/* <Route path="/tareas" element={<TareasPage />} /> */}
      {/* <Route path="/tareas/crear" element={<CrearTareaPage />} /> */}
      {/* <Route path="/tareas/:id" element={<DetallesTareaPage />} /> */}
      
      {/* Rutas de notificaciones - Por implementar */}
      {/* <Route path="/notificaciones" element={<NotificacionesPage />} /> */}
      
      {/* Rutas de perfil - Por implementar */}
      {/* <Route path="/perfil" element={<PerfilPage />} /> */}
      
      {/* Cualquier otra ruta redirige al dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};