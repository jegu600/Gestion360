/**
 * LOADER COMPONENT
 * 
 * Spinner de carga con diferentes tamaños y mensajes.
 * Puede usarse como fullscreen o inline.
 */

import './Loader.css';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  fullscreen?: boolean;
  message?: string;
  variant?: 'primary' | 'secondary' | 'light' | 'dark';
}

export const Loader = ({
  size = 'md',
  fullscreen = false,
  message,
  variant = 'primary',
}: LoaderProps) => {
  const loaderClasses = ['custom-loader', `loader-${size}`, `loader-${variant}`]
    .filter(Boolean)
    .join(' ');

  const content = (
    <div className="loader-content">
      <div className={loaderClasses}>
        <div className="spinner"></div>
      </div>
      {message && <p className="loader-message">{message}</p>}
    </div>
  );

  if (fullscreen) {
    return <div className="loader-fullscreen">{content}</div>;
  }

  return <div className="loader-inline">{content}</div>;
};