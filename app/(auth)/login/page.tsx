"use client";

import React, { useState } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { Button } from '@/shared/components/ui/Button';

export default function LoginPage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="w-full min-h-screen bg-secondary-50 p-[40px] font-sans relative">

      <div className="max-w-[1200px] mx-auto">
        <header className="flex justify-between items-center mb-[40px] pb-[20px] border-b border-secondary-200">
          <h2 className="text-[24px] font-bold text-secondary-900">AlphaKids Plataforma</h2>
          <nav className="flex gap-[20px] text-secondary-600 font-medium">
            <span className="cursor-pointer hover:text-secondary-900">Inicio</span>
            <span className="cursor-pointer hover:text-secondary-900">Cursos</span>
            <span className="cursor-pointer hover:text-secondary-900">Contacto</span>
          </nav>
        </header>

        <main className="text-center py-[60px]">
          <h1 className="text-[48px] font-extrabold text-secondary-900 mb-[16px] leading-tight">
            ¡Bienvenidos al Portal de Aprendizaje!
          </h1>
          <p className="text-[18px] text-secondary-600 max-w-[600px] mx-auto mb-[32px]">
            Explora un mundo lleno de retos, medallas y conocimientos diseñados especialmente para ti.
          </p>

          <div className="max-w-[240px] mx-auto">
            <Button onClick={() => setIsOpen(true)}>
              Abrir Formulario
            </Button>
          </div>
        </main>
      </div>

      {isOpen && (
        <Modal>
          <LoginForm onClose={() => setIsOpen(false)} />
        </Modal>
      )}

    </div>
  );
}