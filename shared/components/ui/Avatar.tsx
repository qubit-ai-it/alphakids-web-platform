import React from 'react';
import { Icon } from './Icon';

interface AvatarProps {
    src?: string;
    alt?: string;
    size?: number;
}

export function Avatar({ src, alt = "Foto de perfil", size = 100 }: AvatarProps) {
    return (
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
            style={{ width: size, height: size }}
        >
            {src ? (
                <img src={src} alt={alt} className="w-full h-full object-cover" />
            ) : (
                <Icon name="account_circle" className="text-secondary-500 text-[48px]" />
            )}
        </div>
    );
}