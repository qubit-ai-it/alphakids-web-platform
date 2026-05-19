"use client";

import React, { useState } from 'react';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { PasswordInput } from '@/shared/components/auth/PasswordInput';
import { SocialButton } from '@/shared/components/auth/SocialButton';
import { Icon } from '@/shared/components/ui/Icon';
import logoKids from '@/app/favicon.png';

interface RegisterFormProps {
    onClose?: () => void;
}

export function RegisterForm({ onClose }: RegisterFormProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Intento de registro:', { name, email, password });
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
          flex 
          items-center 
          justify-center
        "
            >
                <Icon name="close" className="text-[28px]" />
            </button>

            <div className="flex justify-center mb-[24px] mt-[16px]">
                <img
                    src={logoKids.src}
                    alt="AlphaKids Logo"
                    className="w-[80px] h-[80px] object-contain rounded-[20px]"
                />
            </div>

            <div className="text-center mb-[32px]">
                <h1 className="text-[36px] font-bold text-secondary-900 leading-tight mb-[8px]">
                    Crea tu Cuenta
                </h1>
                <p className="text-[16px] text-secondary-600">
                    Únete a la plataforma de AlphaKids
                </p>
            </div>

            <form className="w-full flex flex-col gap-[24px]" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-[20px]">
                    <Input
                        label="Nombre Completo"
                        placeholder="Escriba su nombre"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <Input
                        label="Correo"
                        placeholder="Escriba su correo electrónico"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <PasswordInput
                        label="Contraseña"
                        placeholder="Cree una contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="mt-[8px]">
                    <Button type="submit">Registrarse</Button>
                </div>

                <div className="flex items-center w-full">
                    <div className="flex-1 border-t border-secondary-300"></div>
                    <span className="px-[12px] text-[14px] text-secondary-500 font-medium">o regístrate con</span>
                    <div className="flex-1 border-t border-secondary-300"></div>
                </div>

                <div className="w-full flex gap-[16px]">
                    <SocialButton provider="google" />
                    <SocialButton provider="apple" />
                </div>

                <div className="text-center mt-[8px]">
                    <p className="text-[14px] text-secondary-600">
                        ¿Ya tienes una cuenta?{' '}
                        <a href="/login" className="text-primary-500 font-semibold hover:text-primary-600 transition-colors">
                            Inicia sesión aquí
                        </a>
                    </p>
                </div>
            </form>
        </div>
    );
}