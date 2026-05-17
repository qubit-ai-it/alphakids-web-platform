import React from 'react';

interface ModalProps {
  children: React.ReactNode;
}

export function Modal({ children }: ModalProps) {
  return (
    <div className="
      fixed 
      inset-0 
      z-50 
      flex 
      items-center 
      justify-center 
      bg-slate-900/40 
      backdrop-blur-sm 
      p-4
    ">
      {children}
    </div>
  );
}