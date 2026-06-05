"use client";

import React, { useState } from 'react';
import Link from 'next/link';
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
      modal-md
      bg-white 
      p-[24px] 
      sm:p-[36px] 
      rounded-[24px] 
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
          top-[24px] 
          right-[24px] 
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
                <Icon name="close" className="text-[24px]" />
            </button>

            <div className="flex justify-center mb-[16px] mt-[8px]">
                <img
                    src={logoKids.src}
                    alt="AlphaKids Logo"
                    className="w-[64px] h-[64px] object-contain rounded-[16px]"
                />
            </div>

            <div className="text-center mb-[20px]">
                <h1 className="text-[28px] font-bold text-secondary-900 leading-tight mb-[6px]">
                    Crea tu Cuenta
                </h1>
                <p className="text-[14px] text-secondary-600">
                    Únete a la plataforma de AlphaKids
                </p>
            </div>

            <form className="w-full flex flex-col gap-[16px]" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-[12px]">
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
                    <Button type="submit" variant="primary" size="fluid">Registrarse</Button>
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
                        <Link href="/" className="text-primary-500 font-semibold hover:text-primary-600 transition-colors">
                            Inicia sesión aquí
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
}