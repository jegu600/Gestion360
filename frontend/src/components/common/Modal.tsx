/**
 * MODAL COMPONENT
 * 
 * Modal reutilizable con soporte para diferentes tamaños.
 * Incluye header, body y footer personalizables.
 */

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  showCloseButton = true,
}: ModalProps) => {
  /**
   * CERRAR CON TECLA ESC
   */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevenir scroll del body
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  /**
   * CERRAR AL HACER CLICK EN EL BACKDROP
   */
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Renderizar en portal para evitar problemas de z-index
  return createPortal(
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className={`modal-container modal-${size}`}>
        {/* HEADER */}
        {(title || showCloseButton) && (
          <div className="modal-header">
            {title && <h5 className="modal-title">{title}</h5>}
            {showCloseButton && (
              <button
                type="button"
                className="modal-close-btn"
                onClick={onClose}
                aria-label="Cerrar"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        )}

        {/* BODY */}
        <div className="modal-body">{children}</div>

        {/* FOOTER */}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
};