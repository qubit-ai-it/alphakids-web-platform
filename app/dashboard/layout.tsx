'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/shared/hooks/useAuth';
import { getInstitutionName } from '@/shared/lib/jwt';
import { Sidebar } from '@/shared/components/layout/Sidebar';
import { MobileHeader } from '@/shared/components/layout/MobileHeader';
import { MobileActionProvider } from '@/shared/contexts/MobileActionContext';
import { ProfileModal } from '@/features/profile/components/ProfileModal';

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
    { href: '/dashboard/director/alumnos', label: 'Alumnos', icon: 'child_care' },
    { href: '/dashboard/director/metricas', label: 'Métricas', icon: 'monitoring' },
  ],
  teacher: [
    { href: '/dashboard/docente/aula', label: 'Aula', icon: 'meeting_room' },
    { href: '/dashboard/docente/alumnos', label: 'Alumnos', icon: 'child_care' },
    { href: '/dashboard/docente/palabras', label: 'Palabras', icon: 'spellcheck' },
    { href: '/dashboard/docente/asignaciones', label: 'Asignaciones', icon: 'assignment' },
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
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isLoading, isAuthenticated, router]);

  // Role-based route guard
  React.useEffect(() => {
    if (!user || isLoading) return;

    const primaryRole = user.roles[0]?.role.name;
    const rolePrefixes: Record<string, string> = {
      admin: '/dashboard/admin',
      director: '/dashboard/director',
      teacher: '/dashboard/docente',
    };

    // Allow /dashboard root (page.tsx handles role redirect)
    if (pathname === '/dashboard') return;

    const allowedPrefix = rolePrefixes[primaryRole];
    if (allowedPrefix && !pathname.startsWith(allowedPrefix) && !pathname.startsWith('/forbidden')) {
      router.replace('/forbidden');
    }
  }, [user, isLoading, pathname, router]);

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

  const institutionName = getInstitutionName();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <MobileActionProvider>
      <div className="h-screen flex bg-secondary-100 overflow-hidden">
        <MobileHeader onMenuToggle={() => setMobileSidebarOpen(true)} />

        <Sidebar
          user={{ name: user.name, email: user.email, avatarUrl: user.avatarUrl }}
          navItems={navItems}
          roleName={roleName}
          institutionName={institutionName ?? null}
          onOpenProfile={() => setProfileOpen(true)}
          onLogout={handleLogout}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto pt-14 md:pt-0 sidebar-scroll">
          <div className="p-[16px] md:p-[32px]">{children}</div>
        </main>

        <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      </div>
    </MobileActionProvider>
  );
}
