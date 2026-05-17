"use client";

import React from 'react';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { PasswordInput } from './PasswordInput';
import { SocialButton } from './SocialButton';
import { Icon } from '../../../shared/components/ui/Icon';
import logoKids from '../../../app/favicon.png';

export function LoginForm() {
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

      <h1 className="text-[36px] font-bold text-secondary-900 text-center leading-tight mb-[32px]">
        Iniciar Sesión
      </h1>

      <form className="w-full flex flex-col gap-[24px]" onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col gap-[20px]">
          <Input
            label="Correo"
            placeholder="Escriba su correo electrónico"
            type="email"
            required
          />
          <PasswordInput
            label="Contraseña"
            placeholder="Escriba su contraseña"
            required
          />
        </div>

        <div className="mt-[8px]">
          <Button type="submit">Iniciar Sesión</Button>
        </div>

        <div className="w-full flex gap-[16px]">
          <SocialButton provider="google" />
          <SocialButton provider="apple" />
        </div>
      </form>
    </div>
  );
}