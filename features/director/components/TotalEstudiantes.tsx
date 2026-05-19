'use client';

import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';

const chartData = [
  { grade: '1° Grado', students: 45 },
  { grade: '2° Grado', students: 38 },
  { grade: '3° Grado', students: 52 },
  { grade: '4° Grado', students: 41 },
  { grade: '5° Grado', students: 35 },
  { grade: '6° Grado', students: 44 },
];

const COLORS = [
  'var(--color-primary-500)',
  'var(--color-primary-400)',
  'var(--color-primary-300)',
  '#22C55E',
  '#F59E0B',
  '#8B5CF6',
];

export function TotalEstudiantes() {
  const totalStudents = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.students, 0);
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Total de Estudiantes</h3>
        <p className="text-body-sm" style={{ color: 'var(--color-secondary-600)' }}>
          Distribución por grado
        </p>
      </div>

      <div className="flex justify-center py-4">
        <PieChart width={280} height={280}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={3}
            dataKey="students"
            nameKey="grade"
            strokeWidth={2}
            stroke="white"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
          >
            <tspan
              dy="-0.5em"
              style={{
                fontSize: '2.25rem',
                fontWeight: 700,
                fill: 'var(--color-secondary-900)',
              }}
            >
              {totalStudents}
            </tspan>
            <tspan
              dy="1.8em"
              style={{
                fontSize: '0.875rem',
                fill: 'var(--color-secondary-500)',
              }}
            >
              Estudiantes
            </tspan>
          </text>
        </PieChart>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        {chartData.map((item, index) => (
          <div key={item.grade} className="flex items-center gap-1.5">
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: COLORS[index % COLORS.length],
                display: 'inline-block',
              }}
            />
            <span className="text-caption" style={{ color: 'var(--color-secondary-600)' }}>
              {item.grade} ({item.students})
            </span>
          </div>
        ))}
      </div>

      <div className="card-footer flex items-center gap-2">
        <span className="material-symbols-outlined text-[20px]" style={{ color: '#22C55E' }}>
          trending_up
        </span>
        <span className="text-body-sm" style={{ color: 'var(--color-secondary-600)' }}>
          255 estudiantes matriculados en total
        </span>
      </div>
    </div>
  );
}
