/**
 * CARD COMPONENT
 * 
 * Card reutilizable con header, body y footer opcionales.
 * Soporte para diferentes estilos y hover effects.
 */

import type{ ReactNode } from 'react';
import './Card.css';

interface CardProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
  hoverable?: boolean;
  bordered?: boolean;
  onClick?: () => void;
}

export const Card = ({
  children,
  header,
  footer,
  className = '',
  hoverable = false,
  bordered = true,
  onClick,
}: CardProps) => {
  const classes = [
    'custom-card',
    hoverable && 'card-hoverable',
    bordered && 'card-bordered',
    onClick && 'card-clickable',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} onClick={onClick}>
      {header && <div className="card-header">{header}</div>}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};