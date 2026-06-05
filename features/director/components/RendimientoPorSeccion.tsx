'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const chartData = [
  { section: 'Sección A', rendimiento: 85 },
  { section: 'Sección B', rendimiento: 72 },
  { section: 'Sección C', rendimiento: 91 },
  { section: 'Sección D', rendimiento: 68 },
  { section: 'Sección E', rendimiento: 79 },
];

const barColors = [
  'var(--color-primary-500)',
  'var(--color-primary-400)',
  'var(--color-primary-500)',
  'var(--color-primary-400)',
  'var(--color-primary-500)',
];

export function RendimientoPorSeccion() {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Rendimiento por Sección</h3>
        <p className="text-body-sm" style={{ color: 'var(--color-secondary-600)' }}>
          Promedio general por sección
        </p>
      </div>

      <div className="py-4">
        <BarChart
          width={500}
          height={250}
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-secondary-200)" />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: 'var(--color-secondary-600)' }}
            axisLine={{ stroke: 'var(--color-secondary-200)' }}
            tickLine={false}
          />
          <YAxis
            dataKey="section"
            type="category"
            tick={{ fontSize: 13, fill: 'var(--color-secondary-800)' }}
            axisLine={false}
            tickLine={false}
          />
          <Bar
            dataKey="rendimiento"
            radius={[0, 4, 4, 0]}
            barSize={24}
            shape={(props: { fill?: string; x?: number; y?: number; width?: number; height?: number; index?: number }) => {
              const { x = 0, y = 0, width = 0, height = 0, index = 0 } = props;
              const color = barColors[index] ?? 'var(--color-primary-500)';
              return (
                <rect x={x} y={y} width={width} height={height} rx={4} ry={4} fill={color} />
              );
            }}
            label={{
              position: 'right',
              fontSize: 13,
              fill: 'var(--color-secondary-700)',
              fontWeight: 500,
              formatter: (value: unknown) => `${value}%`,
            }}
          />
        </BarChart>
      </div>

      <div className="card-footer flex items-center gap-2">
        <span className="material-symbols-outlined text-[20px]" style={{ color: 'var(--color-primary-500)' }}>
          trending_up
        </span>
        <span className="text-body-sm" style={{ color: 'var(--color-secondary-600)' }}>
          Sección C lidera con 91% de rendimiento promedio
        </span>
      </div>
    </div>
  );
}
