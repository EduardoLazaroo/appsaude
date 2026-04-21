'use client';

import { useEffect } from 'react';

interface ToastProps {
  id: number;
  message: string;
  type?: 'default' | 'success' | 'error' | 'warning';
  onClose?: () => void;
  duration?: number;
}

export function Toast({
  id,
  message,
  type = 'default',
  onClose,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const typeClasses = {
    default: 'toast default',
    success: 'toast success',
    error: 'toast error',
    warning: 'toast warning',
  };

  return (
    <div className={`toast ${typeClasses[type]}`}>
      {message}
    </div>
  );
}

interface ToastContainerProps {
  toasts: Array<{ id: number; message: string; type?: 'default' | 'success' | 'error' | 'warning' }>;
  onRemove: (id: number) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
}
