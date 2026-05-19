"use client";

import React, { useState } from 'react';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Icon } from '@/shared/components/ui/Icon';

interface ProfileFormProps {
    onClose?: () => void;
}

export function ProfileForm({ onClose }: ProfileFormProps) {
    // Simulacion de los datos del usuario 
    const [name, setName] = useState('Juan Pérez');
    const [email, setEmail] = useState('juan.perez@alphakids.edu');
    const role = 'Docente';

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Perfil actualizado:', { name, email });
    };

    return (
        <div className="
      w-full 
      max-w-[604px] 
      bg-white 
      p-[32px] 
      sm:p-[48px] 
      rounded-[32px] 
      shadow-xl 
      flex 
      flex-col 
      relative 
      font-sans
    ">
            <button
                type="button"
                onClick={onClose}
                className="
          absolute 
          top-[32px] 
          right-[32px] 
          text-secondary-900 
          hover:text-secondary-600 
          active:scale-90 
          transition-all 
          duration-200 
          cursor-pointer 
        "
            >
                <Icon name="close" className="text-[28px]" />
            </button>

            <div className="flex justify-center mb-[16px] mt-[8px]">
                <Avatar size={120} />
            </div>

            <div className="text-center mb-[32px]">
                <h1 className="text-[36px] font-bold text-secondary-900 leading-tight mb-[8px]">
                    Mi Perfil
                </h1>
                <div className="flex items-center justify-center gap-[8px] text-[16px] text-primary-600 font-medium bg-primary-100 w-fit mx-auto px-[16px] py-[4px] rounded-full">
                    <Icon name="badge" className="text-[20px]" />
                    {role}
                </div>
            </div>

            <form className="w-full flex flex-col gap-[24px]" onSubmit={handleSave}>
                <div className="flex flex-col gap-[20px]">
                    <Input
                        label="Nombre Completo"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <Input
                        label="Correo Electrónico"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="mt-[8px]">
                    <Button type="submit" variant="auth">Guardar Cambios</Button>
                </div>

                <div className="text-center mt-[8px]">
                    <button
                        type="button"
                        className="text-[16px] text-secondary-500 font-semibold hover:text-red-500 transition-colors flex items-center justify-center gap-[8px] mx-auto"
                    >
                        <Icon name="logout" className="text-[20px]" />
                        Cerrar Sesión
                    </button>
                </div>
            </form>
        </div>
    );
}