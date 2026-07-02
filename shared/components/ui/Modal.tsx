import React from 'react';

interface ModalProps {
  children: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Modal({ children, isOpen = true, onClose }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-auth-overlay" onClick={(e) => {
      if (e.target === e.currentTarget && onClose) onClose();
    }}>
      {children}
    </div>
  );
}