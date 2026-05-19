"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { PasswordInput } from '../../../shared/components/auth/PasswordInput';
import { SocialButton } from '../../../shared/components/auth/SocialButton';
import { Icon } from '../../../shared/components/ui/Icon';
import { useAuth } from '../../../shared/hooks/useAuth';
import logoKids from '../../../app/favicon.png';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es requerido')
    .email('Ingrese un correo válido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'Mínimo 8 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onClose?: () => void;
}

export function LoginForm({ onClose }: LoginFormProps) {
  const router = useRouter();
  const { login, isLoading, error: authError, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      router.push('/dashboard');
    } catch {
      // error is handled by auth context
    }
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

      <h1 className="text-[36px] font-bold text-secondary-900 text-center leading-tight mb-[32px]">
        Iniciar Sesión
      </h1>

      {authError && (
        <div className="mb-[16px] p-[12px] bg-red-100 text-red-700 rounded-[8px] text-[14px]">
          {authError}
        </div>
      )}

      <form className="w-full flex flex-col gap-[24px]" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-[20px]">
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
          <Button type="submit" variant="auth" disabled={isLoading}>
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </div>

        <div className="w-full flex gap-[16px]">
          <SocialButton provider="google" />
          <SocialButton provider="apple" />
        </div>

        <div className="text-center mt-[8px]">
          <p className="text-[14px] text-secondary-600">
            ¿No tienes una cuenta?{' '}
            <Link href="/register" className="text-primary-500 font-semibold hover:text-primary-600 transition-colors">
              Regístrate aquí
            </Link>
          </p>
        </div>

      </form>
    </div>
  );
}
