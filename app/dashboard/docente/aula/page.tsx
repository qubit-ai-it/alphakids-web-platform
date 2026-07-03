'use client';

import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/shared/hooks/useAuth';
import {
  getInstitutionName,
  getTeacherSectionAssignments,
} from '@/shared/lib/jwt';

interface SectionData {
  sectionId: string;
  sectionName: string;
  gradeId: string;
  gradeName?: string;
}

interface GradeGroup {
  gradeId: string;
  gradeName: string;
  sections: SectionData[];
}

export default function DocenteAulaPage() {
  const { user } = useAuth();
  const institutionName = getInstitutionName();

  const assignments = useMemo(() => getTeacherSectionAssignments(), []);

  // Group sections by grade
  const gradeGroups = useMemo<GradeGroup[]>(() => {
    const map = new Map<string, GradeGroup>();
    for (const a of assignments) {
      const key = a.gradeId;
      let group = map.get(key);
      if (!group) {
        group = {
          gradeId: a.gradeId,
          gradeName: a.gradeName ?? `Grado`,
          sections: [],
        };
        map.set(key, group);
      }
      group.sections.push(a);
    }
    return [...map.values()].sort((a, b) => a.gradeName.localeCompare(b.gradeName));
  }, [assignments]);

  const totalSections = assignments.length;

  // ── Empty State ──────────────────────────────────────────

  if (assignments.length === 0) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Aula</h1>
          <p className="page-subtitle">Tus grados y secciones</p>
        </div>
        <div className="card">
          <div className="empty-state">
            <p className="empty-state-title">Sin asignaciones</p>
            <p className="empty-state-description">
              Aún no tienes grados o secciones asignadas. Contacta al director.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Content ──────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {user?.name ? `Hola, ${user.name.split(' ')[0]} 👋` : 'Aula'}
          </h1>
          <p className="page-subtitle">
            {institutionName && `${institutionName} · `}
            {gradeGroups.length} grado{gradeGroups.length !== 1 ? 's' : ''} · {totalSections} seccion{totalSections !== 1 ? 'es' : ''}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-[24px]">
        {gradeGroups.map((group) => (
          <section key={group.gradeId}>
            {/* Grade Header */}
            <div className="flex items-center gap-[8px] mb-[12px]">
              <span className="material-symbols-outlined text-[22px] text-primary-600">
                school
              </span>
              <h2 className="text-[18px] font-semibold text-secondary-900">
                {group.gradeName}
              </h2>
              <span className="text-[13px] text-secondary-400 ml-auto">
                {group.sections.length} seccion{group.sections.length !== 1 ? 'es' : ''}
              </span>
            </div>

            {/* Section Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[12px]">
              {group.sections
                .sort((a, b) => a.sectionName.localeCompare(b.sectionName))
                .map((section) => (
                  <div
                    key={section.sectionId}
                    className="card hover:shadow-md transition-shadow"
                  >
                    <div className="card-body p-[16px] flex flex-col gap-[12px]">
                      {/* Section Name */}
                      <div className="flex items-center gap-[8px]">
                        <span className="material-symbols-outlined text-[20px] text-secondary-500">
                          view_column
                        </span>
                        <h3 className="text-[15px] font-semibold text-secondary-900">
                          {section.sectionName}
                        </h3>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-[8px] pt-[4px] border-t border-secondary-100">
                        <Link
                          href="/dashboard/docente/alumnos"
                          className="btn btn-xs btn-ghost text-primary-700 gap-[4px]"
                        >
                          <span className="material-symbols-outlined text-[14px]">visibility</span>
                          Ver alumnos
                        </Link>
                        <Link
                          href="/dashboard/docente/asignaciones"
                          className="btn btn-xs btn-ghost text-secondary-600 gap-[4px]"
                        >
                          <span className="material-symbols-outlined text-[14px]">assignment</span>
                          Asignaciones
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        ))}

        {/* Quick Actions */}
        <section className="mt-[8px]">
          <h2 className="text-[16px] font-semibold text-secondary-900 mb-[12px]">
            Acciones rápidas
          </h2>
          <div className="flex flex-wrap gap-[12px]">
            <Link
              href="/dashboard/docente/alumnos"
              className="btn btn-secondary gap-[8px]"
            >
              <span className="material-symbols-outlined text-[18px]">child_care</span>
              Todos los alumnos
            </Link>
            <Link
              href="/dashboard/docente/asignaciones"
              className="btn btn-secondary gap-[8px]"
            >
              <span className="material-symbols-outlined text-[18px]">assignment_add</span>
              Nueva asignación
            </Link>
            <Link
              href="/dashboard/docente/palabras"
              className="btn btn-secondary gap-[8px]"
            >
              <span className="material-symbols-outlined text-[18px]">spellcheck</span>
              Palabras
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
