"use client";

import React, { useRef, useState } from 'react';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { Icon } from '@/shared/components/ui/Icon';
import { useAuth } from '@/shared/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { resizeImage } from '@/shared/lib/image';
import { useToast } from '@/shared/contexts/ToastContext';
import { getErrorMessage } from '@/shared/lib/errors';

interface ProfileFormProps {
    onClose?: () => void;
}

export function ProfileForm({ onClose }: ProfileFormProps) {
    const { user, logout, updateProfile } = useAuth();
    const router = useRouter();
    const { addToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [name, setName] = useState(user?.name ?? '');
    const [email, setEmail] = useState(user?.email ?? '');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const primaryRole = user?.roles[0]?.role.name ?? 'user';
    const roleName =
        primaryRole === 'admin'
            ? 'Administrador'
            : primaryRole === 'director'
                ? 'Director'
                : primaryRole === 'teacher'
                    ? 'Docente'
                    : primaryRole === 'parent'
                        ? 'Apoderado'
                        : 'Usuario';

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        const reader = new FileReader();
        reader.onload = () => setAvatarPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            let avatarUrl: string | undefined;
            if (avatarFile) {
                avatarUrl = await resizeImage(avatarFile, 200, 200, 0.85);
            }

            console.log('Perfil actualizado:', { name, email, avatarUrl });

            updateProfile({ name, avatarUrl });

            addToast('success', 'Perfil actualizado', 'Los cambios se han guardado correctamente.');
        } catch (err) {
            const { title, message } = getErrorMessage(err);
            addToast('error', title, message);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    const avatarSrc = avatarPreview;

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
                <button
                    type="button"
                    onClick={handleAvatarClick}
                    className="relative group cursor-pointer"
                >
                    <div
                        className="
              rounded-full 
              bg-secondary-200 
              flex 
              items-center 
              justify-center 
              overflow-hidden 
              border-4 
              border-white 
              shadow-md
              shrink-0
            "
                        style={{ width: 120, height: 120 }}
                    >
                        {avatarSrc ? (
                            <img
                                src={avatarSrc}
                                alt="Foto de perfil"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Icon name="account_circle" className="text-secondary-500 text-[80px]" />
                        )}
                    </div>
                    <div className="
              absolute 
              inset-0 
              rounded-full 
              bg-black/40 
              flex 
              items-center 
              justify-center 
              opacity-0 
              group-hover:opacity-100 
              transition-opacity 
              duration-200
            ">
                        <Icon name="add_a_photo" className="text-white text-[32px]" />
                    </div>
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                />
            </div>

            <div className="text-center mb-[32px]">
                <h1 className="text-[36px] font-bold text-secondary-900 leading-tight mb-[8px]">
                    Mi Perfil
                </h1>
                <div className="flex items-center justify-center gap-[8px] text-[16px] text-primary-600 font-medium bg-primary-100 w-fit mx-auto px-[16px] py-[4px] rounded-full">
                    <Icon name="badge" className="text-[20px]" />
                    {roleName}
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
                    <Button type="submit" variant="auth" disabled={saving}>
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </div>

                <div className="text-center mt-[8px]">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="text-[16px] text-secondary-500 font-semibold hover:text-red-500 transition-colors flex items-center justify-center gap-[8px] mx-auto cursor-pointer"
                    >
                        <Icon name="logout" className="text-[20px]" />
                        Cerrar Sesión
                    </button>
                </div>
            </form>
        </div>
    );
}
