'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/shared/hooks/useAuth';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const roleNavMap: Record<string, NavItem[]> = {
  admin: [
    { href: '/dashboard/admin/instituciones', label: 'Instituciones', icon: 'apartment' },
    { href: '/dashboard/admin/usuarios', label: 'Usuarios', icon: 'group' },
    { href: '/dashboard/admin/metricas', label: 'Métricas', icon: 'monitoring' },
  ],
  director: [
    { href: '/dashboard/director/grados', label: 'Grados', icon: 'school' },
    { href: '/dashboard/director/secciones', label: 'Secciones', icon: 'view_column' },
    { href: '/dashboard/director/docentes', label: 'Docentes', icon: 'person' },
    { href: '/dashboard/director/metricas', label: 'Métricas', icon: 'monitoring' },
  ],
  teacher: [
    { href: '/dashboard/docente/aula', label: 'Aula', icon: 'meeting_room' },
    { href: '/dashboard/docente/alumnos', label: 'Alumnos', icon: 'child_care' },
  ],
  parent: [],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-100">
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (!user) return null;

  const primaryRole = user.roles[0]?.role.name ?? 'user';
  const navItems = roleNavMap[primaryRole] ?? [];
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

  return (
    <div className="min-h-screen flex bg-secondary-100">
      <aside className="w-[260px] bg-white border-r border-secondary-200 flex flex-col shrink-0">
        <div className="p-[24px] border-b border-secondary-200">
          <Link href="/dashboard" className="flex items-center gap-[12px]">
            <div className="w-[36px] h-[36px] bg-primary-500 rounded-[10px] flex items-center justify-center">
              <span className="text-white font-bold text-[18px]">A</span>
            </div>
            <span className="text-[20px] font-bold text-secondary-900">
              AlphaKids
            </span>
          </Link>
        </div>

        <nav className="flex-1 py-[16px] px-[12px]">
          <ul className="flex flex-col gap-[4px]">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-[12px] px-[16px] py-[10px] rounded-[10px] text-[14px] font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-[16px] border-t border-secondary-200">
          <div className="flex items-center gap-[12px] mb-[12px]">
            <div className="w-[40px] h-[40px] rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-700 font-semibold text-[16px]">
                {user.name?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-secondary-900 truncate">
                {user.name ?? user.email}
              </p>
              <p className="text-[12px] text-secondary-600">{roleName}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="w-full flex items-center gap-[8px] px-[12px] py-[8px] rounded-[8px] text-[14px] text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">
              logout
            </span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-[32px]">{children}</div>
      </main>
    </div>
  );
}
