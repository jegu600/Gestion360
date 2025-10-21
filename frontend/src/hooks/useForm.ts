/**
 * HOOK useForm
 * 
 * Hook personalizado para manejar formularios.
 * Maneja valores, validaciones, errores y estado de campos tocados.
 */

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { FormErrors, FormTouched } from '../types';

interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => FormErrors;
  onSubmit: (values: T) => void | Promise<void>;
}
interface UseFormReturn<T> {
  values: T;
  errors: FormErrors;
  touched: FormTouched;
  isSubmitting: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: string, error: string) => void;
  resetForm: () => void;
  setValues: (values: T) => void;
}


/**
 * useForm Hook
 * 
 * @param options - Configuración del formulario
 * @returns Funciones y estado del formulario
 */
export const useForm = <T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> => {
  // Estado del formulario
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * MANEJAR CAMBIOS EN LOS CAMPOS
   */
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    // Para checkboxes
    const fieldValue =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setValues(prev => ({
      ...prev,
      [name]: fieldValue,
    }));

    // Limpiar error del campo cuando cambia
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  /**
   * MANEJAR BLUR (cuando se sale del campo)
   */
  const handleBlur = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;

    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));

    // Validar campo individual si hay función de validación
    if (validate) {
      const validationErrors = validate(values);
      if (validationErrors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: validationErrors[name],
        }));
      }
    }
  };
  /**
   * MANEJAR SUBMIT DEL FORMULARIO
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Marcar todos los campos como tocados
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);

    // Validar formulario completo
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);

      // Si hay errores, no enviar
      if (Object.keys(validationErrors).length > 0) {
        return;
      }
    }

    // Enviar formulario
    try {
      setIsSubmitting(true);
      await onSubmit(values);
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * ESTABLECER VALOR DE UN CAMPO MANUALMENTE
   */
  const setFieldValue = (field: keyof T, value: any) => {
    setValues(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * ESTABLECER ERROR DE UN CAMPO MANUALMENTE
   */
  const setFieldError = (field: string, error: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: error,
    }));
  };

  /**
   * RESETEAR FORMULARIO
   */
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    resetForm,
    setValues,
  };
};

/**
 * VALIDACIONES COMUNES
 * 
 * Funciones helper para validaciones frecuentes.
 */

export const validaciones = {
  /**
   * Validar email
   */
  email: (value: string): string | undefined => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return 'El email es requerido';
    if (!emailRegex.test(value)) return 'Email inválido';
    return undefined;
  },

  /**
   * Validar campo requerido
   */
  requerido: (value: any, fieldName: string = 'Este campo'): string | undefined => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} es requerido`;
    }
    return undefined;
  },

  /**
   * Validar longitud mínima
   */
  minLength: (value: string, min: number, fieldName: string = 'Este campo'): string | undefined => {
    if (!value) return undefined;
    if (value.length < min) {
      return `${fieldName} debe tener al menos ${min} caracteres`;
    }
    return undefined;
  },

  /**
   * Validar longitud máxima
   */
  maxLength: (value: string, max: number, fieldName: string = 'Este campo'): string | undefined => {
    if (!value) return undefined;
    if (value.length > max) {
      return `${fieldName} no puede tener más de ${max} caracteres`;
    }
    return undefined;
  },

  /**
   * Validar que las contraseñas coincidan
   */
  matchPassword: (password: string, confirmPassword: string): string | undefined => {
    if (password !== confirmPassword) {
      return 'Las contraseñas no coinciden';
    }
    return undefined;
  },

  /**
   * Validar fecha futura
   */
  fechaFutura: (fecha: string): string | undefined => {
    if (!fecha) return 'La fecha es requerida';
    const fechaSeleccionada = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas

    if (fechaSeleccionada < hoy) {
      return 'La fecha debe ser futura';
    }
    return undefined;
  },
};