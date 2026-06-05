'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useMobileAction } from '@/shared/contexts/MobileActionContext';
import { Button } from '@/shared/components/ui/Button';
import logoAlphi from '@/app/assets/alphi.png';

interface MobileHeaderProps {
  onMenuToggle: () => void;
}

export function MobileHeader({ onMenuToggle }: MobileHeaderProps) {
  const { action } = useMobileAction();

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-white border-b border-secondary-200 flex items-center justify-between px-4">
      <button
        type="button"
        onClick={onMenuToggle}
        className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-secondary-100 transition-colors cursor-pointer shrink-0"
        aria-label="Abrir menú"
      >
        <span className="material-symbols-outlined text-[24px] text-secondary-700">menu</span>
      </button>

      <Link href="/dashboard" className="flex items-center gap-[8px]">
        <div className="w-[28px] h-[28px] rounded-[8px] flex items-center justify-center shrink-0 overflow-hidden">
          <Image src={logoAlphi} alt="AlphaKids" width={28} height={28} className="object-contain" />
        </div>
        <span className="text-[16px] font-bold text-secondary-900">AlphaKids</span>
      </Link>

      <div className="w-10 flex justify-end shrink-0">
        {action ? (
          <Button
            size="2xs"
            onClick={action.onClick}
            disabled={action.disabled}
          >
            <span className="material-symbols-outlined text-[16px]">
              {action.icon ?? 'add'}
            </span>
          </Button>
        ) : (
          <div className="w-10" />
        )}
      </div>
    </header>
  );
}
