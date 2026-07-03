'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/shared/hooks/useAuth';
import {
  getInstitutionName,
  getTeacherSectionAssignments,
} from '@/shared/lib/jwt';
import { aulaService, type TeacherAulaResponse } from '@/features/docente/services/aula.service';

interface SectionDisplay {
  id: string;
  name: string;
  studentCount: number | null;
  pendingAssignments: number | null;
}

interface GradeDisplay {
  id: string;
  name: string;
  ageRangeMin: number;
  ageRangeMax: number;
  sections: SectionDisplay[];
}

/** Build grade/section tree from JWT assignments (fallback) */
function buildFromJwt(): GradeDisplay[] {
  const assignments = getTeacherSectionAssignments();
  const map = new Map<string, GradeDisplay>();

  for (const a of assignments) {
    let grade = map.get(a.gradeId);
    if (!grade) {
      grade = {
        id: a.gradeId,
        name: a.gradeName ?? 'Grado',
        ageRangeMin: 0,
        ageRangeMax: 0,
        sections: [],
      };
      map.set(a.gradeId, grade);
    }
    grade.sections.push({
      id: a.sectionId,
      name: a.sectionName,
      studentCount: null,
      pendingAssignments: null,
    });
  }

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Map API response to our display structure */
function fromApi(data: TeacherAulaResponse): GradeDisplay[] {
  return data.grades.map((g) => ({
    id: g.id,
    name: g.name,
    ageRangeMin: g.ageRangeMin,
    ageRangeMax: g.ageRangeMax,
    sections: g.sections.map((s) => ({
      id: s.id,
      name: s.name,
      studentCount: s.studentCount,
      pendingAssignments: s.pendingAssignments,
    })),
  }));
}

export default function DocenteAulaPage() {
  const { user } = useAuth();
  const institutionName = getInstitutionName();

  const [grades, setGrades] = useState<GradeDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usingApi, setUsingApi] = useState(false);
  const [apiError, setApiError] = useState(false);

  const initialized = useRef(false);

  const loadData = useCallback(async () => {
    // 1. Always build from JWT first (instant, no network)
    const jwtData = buildFromJwt();
    setGrades(jwtData);

    if (jwtData.length === 0) {
      setIsLoading(false);
      return;
    }

    // 2. Try the API
    try {
      const data = await aulaService.getAula();
      setGrades(fromApi(data));
      setUsingApi(true);
      setApiError(false);
    } catch {
      // Keep JWT data, show subtle hint
      setUsingApi(false);
      setApiError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    loadData();
  }, [loadData]);

  // ── Derived ──────────────────────────────────────────────

  const totalSections = grades.reduce((sum, g) => sum + g.sections.length, 0);
  const totalStudents = grades.reduce(
    (sum, g) => sum + g.sections.reduce((s, sec) => s + (sec.studentCount ?? 0), 0),
    0,
  );
  const totalPending = grades.reduce(
    (sum, g) => sum + g.sections.reduce((s, sec) => s + (sec.pendingAssignments ?? 0), 0),
    0,
  );

  // ── Empty State ──────────────────────────────────────────

  if (!isLoading && grades.length === 0) {
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
            {grades.length} grado{grades.length !== 1 ? 's' : ''} · {totalSections} seccion{totalSections !== 1 ? 'es' : ''}
            {usingApi && totalStudents > 0 && ` · ${totalStudents} alumno${totalStudents !== 1 ? 's' : ''}`}
            {usingApi && totalPending > 0 && ` · ${totalPending} pendiente${totalPending !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Fallback banner */}
      {apiError && (
        <div className="mb-[16px] px-[16px] py-[10px] bg-amber-50 border border-amber-200 rounded-[10px] text-[13px] text-amber-800 flex items-center gap-[8px]">
          <span className="material-symbols-outlined text-[18px] text-amber-500">info</span>
          No se pudieron cargar los datos completos. Mostrando información parcial.
        </div>
      )}

      {isLoading ? (
        <div className="card">
          <div className="flex items-center justify-center py-[48px]">
            <div className="spinner spinner-lg" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-[24px]">
          {grades.map((grade) => (
            <section key={grade.id}>
              {/* Grade Header */}
              <div className="flex items-center gap-[8px] mb-[12px]">
                <span className="material-symbols-outlined text-[22px] text-primary-600">
                  school
                </span>
                <h2 className="text-[18px] font-semibold text-secondary-900">
                  {grade.name}
                </h2>
                {grade.ageRangeMin > 0 && (
                  <span className="text-[13px] text-secondary-500">
                    ({grade.ageRangeMin}-{grade.ageRangeMax} años)
                  </span>
                )}
                <span className="text-[13px] text-secondary-400 ml-auto">
                  {grade.sections.length} seccion{grade.sections.length !== 1 ? 'es' : ''}
                </span>
              </div>

              {/* Section Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[12px]">
                {grade.sections
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((section) => (
                    <div
                      key={section.id}
                      className="card hover:shadow-md transition-shadow"
                    >
                      <div className="card-body p-[16px] flex flex-col gap-[12px]">
                        {/* Section Name */}
                        <div className="flex items-center gap-[8px]">
                          <span className="material-symbols-outlined text-[20px] text-secondary-500">
                            view_column
                          </span>
                          <h3 className="text-[15px] font-semibold text-secondary-900">
                            {section.name}
                          </h3>
                        </div>

                        {/* Stats (only when API is available) */}
                        {usingApi && (
                          <div className="flex items-center gap-[16px]">
                            <div className="flex items-center gap-[4px]">
                              <span className="material-symbols-outlined text-[16px] text-secondary-400">
                                child_care
                              </span>
                              <span className="text-[13px] text-secondary-600">
                                {section.studentCount} alumno{section.studentCount !== 1 ? 's' : ''}
                              </span>
                            </div>
                            {(section.pendingAssignments ?? 0) > 0 && (
                              <div className="flex items-center gap-[4px]">
                                <span className="material-symbols-outlined text-[16px] text-amber-500">
                                  assignment_late
                                </span>
                                <span className="text-[13px] text-amber-600 font-medium">
                                  {section.pendingAssignments} pendiente{section.pendingAssignments !== 1 ? 's' : ''}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

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
      )}
    </div>
  );
}
