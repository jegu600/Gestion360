/**
 * INPUT COMPONENT
 * 
 * Input reutilizable con label, validación y estados de error.
 * Soporte para diferentes tipos de input.
 */

import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  touched?: boolean;
  helperText?: string;
  icon?: string; // Clase de Font Awesome
  iconPosition?: 'left' | 'right';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      touched,
      helperText,
      icon,
      iconPosition = 'left',
      className = '',
      type = 'text',
      ...props
    },
    ref
  ) => {
    const hasError = touched && error;
    const inputClasses = [
      'custom-input',
      hasError && 'input-error',
      icon && 'input-with-icon',
      icon && `icon-${iconPosition}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="input-wrapper">
        {/* LABEL */}
        {label && (
          <label className="input-label">
            {label}
            {props.required && <span className="text-danger ms-1">*</span>}
          </label>
        )}

        {/* INPUT CON ÍCONO */}
        <div className="input-container">
          {icon && iconPosition === 'left' && (
            <i className={`input-icon icon-left ${icon}`}></i>
          )}

          <input
            ref={ref}
            type={type}
            className={inputClasses}
            {...props}
          />

          {icon && iconPosition === 'right' && (
            <i className={`input-icon icon-right ${icon}`}></i>
          )}
        </div>

        {/* MENSAJES DE ERROR O AYUDA */}
        {hasError ? (
          <div className="input-error-message">
            <i className="fas fa-exclamation-circle me-1"></i>
            {error}
          </div>
        ) : (
          helperText && (
            <div className="input-helper-text">
              <i className="fas fa-info-circle me-1"></i>
              {helperText}
            </div>
          )
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';