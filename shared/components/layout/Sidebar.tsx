'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { UserMenu } from './UserMenu';
import { useMobileAction } from '@/shared/contexts/MobileActionContext';
import logoAlphi from '@/app/assets/alphi.png';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface SidebarProps {
  user: { name: string | null; email: string; avatarUrl?: string | null };
  navItems: NavItem[];
  roleName: string;
  institutionName: string | null;
  onOpenProfile: () => void;
  onLogout: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({
  user,
  navItems,
  roleName,
  institutionName,
  onOpenProfile,
  onLogout,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { action } = useMobileAction();

  const handleMobileClose = useCallback(() => {
    onMobileClose?.();
  }, [onMobileClose]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const sidebarContent = (
    <>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="sidebar-toggle-btn hidden md:flex"
        aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
      >
        <span className="material-symbols-outlined text-[16px]">
          {collapsed ? 'chevron_right' : 'chevron_left'}
        </span>
      </button>

      <div
        className={`p-[24px] border-b border-secondary-200 flex items-center ${
          collapsed ? 'md:justify-center md:px-[16px]' : ''
        }`}
      >
          <Link href="/dashboard" className="flex items-center gap-[12px]">
            <div className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center shrink-0 overflow-hidden">
              <Image src={logoAlphi} alt="AlphaKids" width={36} height={36} className="object-contain" />
            </div>
          <span
            className={`text-[20px] font-bold text-secondary-900 whitespace-nowrap ${
              collapsed ? 'md:hidden' : ''
            }`}
          >
            AlphaKids
          </span>
        </Link>
      </div>

      {action && (
        <div className={`px-[12px] pt-[16px] ${collapsed ? 'md:px-[8px] md:pt-[12px]' : ''}`}>
          <button
            type="button"
            onClick={action.onClick}
            disabled={action.disabled}
            title={collapsed ? action.label : undefined}
            className={`w-full flex items-center gap-[10px] rounded-[10px] bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              collapsed ? 'md:justify-center md:p-[10px]' : 'px-[16px] py-[10px]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px] shrink-0">
              {action.icon ?? 'add'}
            </span>
            <span className={`text-[14px] whitespace-nowrap ${collapsed ? 'md:hidden' : ''}`}>
              {action.label}
            </span>
          </button>
        </div>
      )}

      <nav className="py-[16px] px-[12px]">
        <ul className="flex flex-col gap-[4px]">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={handleMobileClose}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-[12px] px-[16px] py-[10px] rounded-[10px] text-[14px] font-medium transition-colors ${
                    collapsed ? 'md:justify-center md:px-[12px]' : ''
                  } ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] shrink-0">
                    {item.icon}
                  </span>
                  <span
                    className={`whitespace-nowrap ${collapsed ? 'md:hidden' : ''}`}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex-1" />

      <div className="relative p-[16px] border-t border-secondary-200">
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className={`w-full flex items-center gap-[12px] rounded-[8px] hover:bg-secondary-100 transition-colors cursor-pointer ${
            collapsed ? 'md:justify-center md:p-[8px]' : 'p-[8px]'
          }`}
        >
          <div className="w-[40px] h-[40px] rounded-full bg-primary-100 flex items-center justify-center shrink-0 overflow-hidden">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name ?? user.email}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-primary-700 font-semibold text-[16px]">
                {user.name?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
              </span>
            )}
          </div>
          <div
            className={`flex-1 min-w-0 text-left ${collapsed ? 'md:hidden' : ''}`}
          >
            <p className="text-[14px] font-medium text-secondary-900 truncate">
              {user.name ?? user.email}
            </p>
            <p className="text-[12px] text-secondary-600">{roleName}</p>
            {institutionName && (
              <p className="text-[11px] text-primary-600 truncate">
                {institutionName}
              </p>
            )}
          </div>
          <span
            className={`material-symbols-outlined text-[18px] text-secondary-500 shrink-0 ${
              collapsed ? 'md:hidden' : ''
            }`}
          >
            {userMenuOpen ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        <UserMenu
          isOpen={userMenuOpen}
          onClose={() => setUserMenuOpen(false)}
          onOpenProfile={onOpenProfile}
          onLogout={onLogout}
        />
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`sidebar-container hidden md:flex bg-white border-r border-secondary-200 flex-col shrink-0 transition-all duration-300 ${
          collapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar-mobile-overlay md:hidden" onClick={handleMobileClose} />
      )}
      <aside
        className={`sidebar-mobile md:hidden fixed inset-y-0 left-0 z-50 w-[280px] bg-white flex flex-col transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={handleMobileClose}
          className="absolute top-[16px] right-[16px] w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary-100 cursor-pointer transition-colors"
          aria-label="Cerrar menú"
        >
          <span className="material-symbols-outlined text-[20px] text-secondary-600">close</span>
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}
