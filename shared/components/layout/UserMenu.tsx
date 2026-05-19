'use client';

import React, { useEffect, useRef } from 'react';

interface UserMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
}

export function UserMenu({ isOpen, onClose, onOpenProfile, onLogout }: UserMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const allMenus = document.querySelectorAll('.user-menu-dropdown');
      const clickedInsideMenu = Array.from(allMenus).some((menu) => menu.contains(target));
      if (!clickedInsideMenu) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div ref={menuRef} className="user-menu-dropdown">
      <button
        onClick={() => {
          onOpenProfile();
          onClose();
        }}
        className="user-menu-item"
      >
        <span className="material-symbols-outlined text-[18px]">settings</span>
        Configuraci&oacute;n
      </button>
      <button
        onClick={() => {
          onLogout();
          onClose();
        }}
        className="user-menu-item text-secondary-700 hover:bg-secondary-100"
      >
        <span className="material-symbols-outlined text-[18px]">logout</span>
        Cerrar sesi&oacute;n
      </button>
    </div>
  );
}
