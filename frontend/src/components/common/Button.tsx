/**
 * BUTTON COMPONENT
 * 
 * Botón reutilizable con diferentes variantes y estados.
 * Soporte para loading, iconos y tamaños.
 * 
 * NUEVO: Componente creado desde cero
 */

import type { ButtonHTMLAttributes } from 'react';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: string; // Clase de Font Awesome
  iconPosition?: 'left' | 'right';
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  // Construir clases CSS
  const classes = [
    'custom-button',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth && 'btn-full-width',
    isLoading && 'btn-loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Cargando...
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <i className={`${icon} me-2`}></i>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <i className={`${icon} ms-2`}></i>
          )}
        </>
      )}
    </button>
  );
};