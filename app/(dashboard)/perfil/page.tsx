"use client";

import React, { useState } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { ProfileForm } from '@/features/profile/components/ProfileForm';
import { Button } from '@/shared/components/ui/Button';

export default function ProfilePage() {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="w-full min-h-screen bg-secondary-50 p-[40px] font-sans relative">

            <div className="max-w-[1200px] mx-auto opacity-40 blur-[2px] pointer-events-none transition-all duration-500">
                <header className="flex justify-between items-center mb-[40px] pb-[20px] border-b border-secondary-200">
                    <h2 className="text-[24px] font-bold text-secondary-900">AlphaKids Dashboard</h2>
                    <div className="w-[40px] h-[40px] bg-secondary-300 rounded-full"></div>
                </header>

                <main className="grid grid-cols-3 gap-[24px]">
                    <div className="h-[200px] bg-white rounded-[24px] shadow-sm"></div>
                    <div className="h-[200px] bg-white rounded-[24px] shadow-sm"></div>
                    <div className="h-[200px] bg-white rounded-[24px] shadow-sm"></div>
                </main>
            </div>

            {isOpen && (
                <Modal>
                    <ProfileForm onClose={() => setIsOpen(false)} />
                </Modal>
            )}

            {!isOpen && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Button onClick={() => setIsOpen(true)}>Ver Mi Perfil</Button>
                </div>
            )}

        </div>
    );
}