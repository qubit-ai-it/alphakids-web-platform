'use client';

import React from 'react';
import { StatCards } from '@/features/admin/components/StatCards';
import { ActiveStudentsChart } from '@/features/admin/components/ActiveStudentsChart';
import { RecentInstitutionsTable } from '@/features/admin/components/RecentInstitutionsTable';

export default function AdminMetricasPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Métricas</h1>
        <p className="page-subtitle">Panel de métricas globales del sistema</p>
      </div>

      <StatCards />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-[16px] mb-[24px]">
        <ActiveStudentsChart />
        <RecentInstitutionsTable />
      </div>
    </div>
  );
}
