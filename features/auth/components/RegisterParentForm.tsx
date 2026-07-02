"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { PasswordInput } from '../../../shared/components/auth/PasswordInput';
import { Icon } from '../../../shared/components/ui/Icon';
import { useAuth } from '../../../shared/hooks/useAuth';
import logoKids from '../../../app/favicon.png';

const registerSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  email: z
    .string()
    .min(1, 'El correo es requerido')
    .email('Ingrese un correo válido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'Mínimo 8 caracteres'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterParentFormProps {
  onClose?: () => void;
  onSwitchToLogin?: () => void;
}

export function RegisterParentForm({ onClose, onSwitchToLogin }: RegisterParentFormProps) {
  const router = useRouter();
  const { register: registerParent, isLoading, error: authError, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerParent(data.email, data.password, data.name);
      router.push('/welcome');
    } catch {
      // error is handled by auth context
    }
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

      <h1 className="text-[28px] font-bold text-secondary-900 text-center leading-tight mb-[8px]">
        Registro de Padres
      </h1>
      <p className="text-secondary-600 text-center text-[14px] mb-[20px]">
        Crea una cuenta para registrar a tus hijos.
      </p>

      {authError && (
        <div className="mb-[12px] p-[10px] bg-red-100 text-red-700 rounded-[8px] text-[13px]">
          {authError}
        </div>
      )}

      <form noValidate className="w-full flex flex-col gap-[16px]" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-[12px]">
          <Input
            label="Nombre y Apellidos"
            placeholder="Escriba su nombre completo"
            type="text"
            disabled={isLoading}
            {...register('name')}
            onChange={(e) => {
              register('name').onChange(e);
              if (authError) clearError();
            }}
          />
          {errors.name && (
            <span className="text-red-600 text-[12px] -mt-[12px]">
              {errors.name.message}
            </span>
          )}

          <Input
            label="Correo"
            placeholder="Escriba su correo electrónico"
            type="email"
            disabled={isLoading}
            {...register('email')}
            onChange={(e) => {
              register('email').onChange(e);
              if (authError) clearError();
            }}
          />
          {errors.email && (
            <span className="text-red-600 text-[12px] -mt-[12px]">
              {errors.email.message}
            </span>
          )}

          <PasswordInput
            label="Contraseña"
            placeholder="Escriba su contraseña"
            disabled={isLoading}
            {...register('password')}
            onChange={(e) => {
              register('password').onChange(e);
              if (authError) clearError();
            }}
          />
          {errors.password && (
            <span className="text-red-600 text-[12px] -mt-[12px]">
              {errors.password.message}
            </span>
          )}
        </div>

        <div className="mt-[8px] w-full">
          <Button type="submit" variant="primary" size="fluid" disabled={isLoading}>
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </Button>
        </div>

        <div className="w-full text-center mt-2">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-[13px] text-primary-500 hover:text-primary-600 font-medium"
          >
            ¿Ya tienes cuenta? Inicia sesión
          </button>
        </div>
      </form>
    </div>
  );
}
