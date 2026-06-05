'use client';

import React from 'react';
import {
  RadialBarChart,
  RadialBar,
  PolarGrid,
  PolarRadiusAxis,
  Label,
} from 'recharts';

const totalInstituciones = 12;
const totalUsuarios = 248;
const totalDocentes = 86;
const totalAlumnos = 3124;

const chartData = [{ name: 'Activos', value: 3124, fill: '#0199FD' }];

const statCards = [
  { label: 'Instituciones', value: totalInstituciones, icon: 'apartment', color: 'bg-blue-50 text-blue-600' },
  { label: 'Usuarios', value: totalUsuarios, icon: 'group', color: 'bg-emerald-50 text-emerald-600' },
  { label: 'Docentes', value: totalDocentes, icon: 'person', color: 'bg-amber-50 text-amber-600' },
  { label: 'Alumnos', value: totalAlumnos, icon: 'child_care', color: 'bg-violet-50 text-violet-600' },
];

const ultimasInstituciones = [
  { nombre: 'Colegio San José', usuarios: 45, estado: 'Activo' },
  { nombre: 'Escuela Primavera', usuarios: 32, estado: 'Activo' },
  { nombre: 'Liceo Los Andes', usuarios: 28, estado: 'Activo' },
  { nombre: 'Instituto Belén', usuarios: 19, estado: 'Pendiente' },
  { nombre: 'Colegio del Sol', usuarios: 61, estado: 'Activo' },
];

export default function AdminMetricasPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Métricas</h1>
        <p className="page-subtitle">Panel de métricas globales del sistema</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px] mb-[24px]">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-[16px] p-[20px] border border-secondary-200 flex items-center gap-[16px]"
          >
            <div className={`w-[48px] h-[48px] rounded-[12px] flex items-center justify-center shrink-0 ${card.color}`}>
              <span className="material-symbols-outlined text-[24px]">{card.icon}</span>
            </div>
            <div>
              <p className="text-[13px] text-secondary-600 font-medium">{card.label}</p>
              <p className="text-[24px] font-bold text-secondary-900">{card.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-[16px] mb-[24px]">
        <div className="lg:col-span-2 bg-white rounded-[16px] border border-secondary-200 p-[24px] flex flex-col items-center">
          <h3 className="text-[16px] font-semibold text-secondary-900 mb-[4px]">Alumnos Activos</h3>
          <p className="text-[13px] text-secondary-500 mb-[16px]">Total del sistema</p>

          <RadialBarChart
            width={220}
            height={220}
            data={chartData}
            startAngle={90}
            endAngle={-270}
            innerRadius={65}
            outerRadius={100}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              polarRadius={[90, 78]}
            />
            <RadialBar
              dataKey="value"
              background={{ fill: '#F0F0F0' }}
              cornerRadius={10}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 6}
                          className="text-[28px] font-bold"
                          fill="#2B2B2B"
                        >
                          {chartData[0].value.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 18}
                          className="text-[12px]"
                          fill="#828282"
                        >
                          Alumnos
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>

          <div className="flex items-center gap-[6px] mt-[8px] text-[13px] text-emerald-600 font-medium">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            +12.5% este mes
          </div>
        </div>

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
                {ultimasInstituciones.map((inst) => (
                  <tr key={inst.nombre} className="border-b border-secondary-100 last:border-0">
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
