'use client';

import React, { useEffect, useState } from 'react';
import { adminMetricsService, RecentInstitution } from '../services/admin-metrics.service';

export function RecentInstitutionsTable() {
  const [institutions, setInstitutions] = useState<RecentInstitution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminMetricsService.getRecentInstitutions()
      .then(setInstitutions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="lg:col-span-3 bg-white rounded-[16px] border border-secondary-200 p-[24px] flex items-center justify-center min-h-[350px]">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="lg:col-span-3 bg-white rounded-[16px] border border-secondary-200 p-[24px]">
      <h3 className="text-[16px] font-semibold text-secondary-900 mb-[16px]">Últimas Instituciones</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-secondary-200">
              <th className="pb-[12px] text-[13px] font-medium text-secondary-500">Nombre</th>
              <th className="pb-[12px] text-[13px] font-medium text-secondary-500">Usuarios</th>
              <th className="pb-[12px] text-[13px] font-medium text-secondary-500">Estado</th>
            </tr>
          </thead>
          <tbody>
            {institutions.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-[24px] text-center text-secondary-500 text-[14px]">
                  No hay instituciones recientes.
                </td>
              </tr>
            ) : (
              institutions.map((inst) => (
                <tr key={inst.id} className="border-b border-secondary-100 last:border-0 hover:bg-secondary-50 transition-colors">
                  <td className="py-[12px] text-[14px] font-medium text-secondary-900">{inst.nombre}</td>
                  <td className="py-[12px] text-[14px] text-secondary-600">{inst.usuarios}</td>
                  <td className="py-[12px]">
                    <span
                      className={`inline-flex px-[10px] py-[2px] rounded-[6px] text-[12px] font-medium ${
                        inst.estado === 'Activo'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {inst.estado}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
