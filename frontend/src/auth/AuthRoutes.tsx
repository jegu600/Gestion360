import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPages } from './pages/LoginPages';
import { RegistroPage } from './pages/RegistroPage';

export const AuthRoutes = () => {
  return (
    <Routes>
      {/* Ruta de login */}
      <Route path="login" element={<LoginPages />} />
      
      {/* Ruta de registro */}
      <Route path="registro" element={<RegistroPage />} />
      
      {/* Redirigir /auth a /auth/login por defecto */}
      <Route path="/" element={<Navigate to="/auth/login" replace />} />
      
      {/* Cualquier otra ruta redirige a login */}
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  );
};