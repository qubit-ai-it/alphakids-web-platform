"use client";

import React, { useState } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { Button } from '@/shared/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const [isOpen, setIsOpen] = useState(true);
    const router = useRouter();

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <div className="w-full min-h-screen bg-secondary-50 p-[40px] font-sans relative">

            <div className="max-w-[1200px] mx-auto opacity-50 blur-sm pointer-events-none transition-all duration-500">
                <header className="flex justify-between items-center mb-[40px] pb-[20px] border-b border-secondary-200">
                    <h2 className="text-[24px] font-bold text-secondary-900">AlphaKids Plataforma</h2>
                </header>

                <main className="text-center py-[60px]">
                    <h1 className="text-[48px] font-extrabold text-secondary-900 mb-[16px] leading-tight">
                        Únete a la Aventura
                    </h1>
                </main>
            </div>

            {isOpen && (
                <Modal>
                    <RegisterForm onClose={handleClose} />
                </Modal>
            )}

            {!isOpen && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Button onClick={() => setIsOpen(true)}>Abrir Registro</Button>
                </div>
            )}

        </div>
    );
}