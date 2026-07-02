'use client';

import React, { useEffect, useState } from 'react';
import { adminMetricsService, SummaryCardsData } from '../services/admin-metrics.service';
import { Icon } from '../../../shared/components/ui/Icon';

export function StatCards() {
  const [data, setData] = useState<SummaryCardsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminMetricsService.getSummaryCards()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px] mb-[24px]">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-[16px] p-[20px] border border-secondary-200 flex items-center gap-[16px] animate-pulse">
            <div className="w-[48px] h-[48px] rounded-[12px] bg-secondary-100 shrink-0"></div>
            <div className="flex-1 space-y-[8px]">
              <div className="h-[12px] bg-secondary-100 rounded w-[60%]"></div>
              <div className="h-[24px] bg-secondary-100 rounded w-[40%]"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const statCardsConfig = [
    { label: 'Instituciones', value: data.totalInstituciones, icon: 'apartment', color: 'bg-blue-50 text-blue-600' },
    { label: 'Usuarios', value: data.totalUsuarios, icon: 'group', color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Docentes', value: data.totalDocentes, icon: 'person', color: 'bg-amber-50 text-amber-600' },
    { label: 'Alumnos', value: data.totalAlumnos, icon: 'child_care', color: 'bg-violet-50 text-violet-600' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px] mb-[24px]">
      {statCardsConfig.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-[16px] p-[20px] border border-secondary-200 flex items-center gap-[16px]"
        >
          <div className={`w-[48px] h-[48px] rounded-[12px] flex items-center justify-center shrink-0 ${card.color}`}>
            <Icon name={card.icon} className="text-[24px]" />
          </div>
          <div>
            <p className="text-[13px] text-secondary-600 font-medium">{card.label}</p>
            <p className="text-[24px] font-bold text-secondary-900">{card.value.toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
