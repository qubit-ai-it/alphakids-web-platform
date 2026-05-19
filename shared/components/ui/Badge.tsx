import React from 'react';

type BadgeVariant = 'admin' | 'director' | 'teacher' | 'parent' | 'success' | 'warning' | 'error' | 'secondary';

const variantClasses: Record<BadgeVariant, string> = {
  admin: 'badge-primary',
  director: 'bg-blue-50 text-blue-700 border border-blue-200 px-[10px] py-[2px] rounded-[6px] text-[12px] font-medium',
  teacher: 'bg-green-50 text-green-700 border border-green-200 px-[10px] py-[2px] rounded-[6px] text-[12px] font-medium',
  parent: 'bg-purple-50 text-purple-700 border border-purple-200 px-[10px] py-[2px] rounded-[6px] text-[12px] font-medium',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  secondary: 'badge-secondary',
};

const roleVariantMap: Record<string, BadgeVariant> = {
  admin: 'admin',
  director: 'director',
  teacher: 'teacher',
  parent: 'parent',
};

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  director: 'Director',
  teacher: 'Docente',
  parent: 'Apoderado',
};

interface BadgeProps {
  variant?: BadgeVariant;
  role?: string;
  children?: React.ReactNode;
  className?: string;
}

export function Badge({ variant, role, children, className = '' }: BadgeProps) {
  const resolvedVariant = variant ?? (role ? roleVariantMap[role] ?? 'secondary' : 'secondary');
  const label = children ?? (role ? roleLabels[role] ?? role : '');

  return (
    <span className={`badge ${variantClasses[resolvedVariant]} ${className}`}>
      {label}
    </span>
  );
}
