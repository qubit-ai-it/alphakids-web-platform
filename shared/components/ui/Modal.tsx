import React from 'react';

interface ModalProps {
  children: React.ReactNode;
}

export function Modal({ children }: ModalProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="
        w-[604px] 
        bg-white 
        p-[16px] 
        rounded-[16px] 
        shadow-lg 
        flex flex-col 
        min-h-[500px] 
      ">
        <div className="flex-grow">
          {children}
        </div>
      </div>
    </div>
  );
}