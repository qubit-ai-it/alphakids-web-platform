'use client';

import React, { useEffect, useState } from 'react';
import { RadialBarChart, RadialBar, PolarGrid, PolarRadiusAxis, Label } from 'recharts';
import { adminMetricsService, ActiveStudentsData } from '../services/admin-metrics.service';
import { Icon } from '../../../shared/components/ui/Icon';

export function ActiveStudentsChart() {
  const [data, setData] = useState<ActiveStudentsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminMetricsService.getActiveStudents()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="lg:col-span-2 bg-white rounded-[16px] border border-secondary-200 p-[24px] flex flex-col items-center justify-center min-h-[350px]">
        <div className="spinner" />
      </div>
    );
  }

  if (!data) return null;

  const chartData = [{ name: 'Activos', value: data.totalActivos, fill: '#0199FD' }];
  
  const isPositive = data.percentageGrowth >= 0;
  const growthColor = isPositive ? 'text-emerald-600' : 'text-red-600';
  const growthIcon = isPositive ? 'trending_up' : 'trending_down';
  const growthPrefix = isPositive ? '+' : '';

  return (
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
                      {data.totalActivos.toLocaleString()}
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

      <div className={`flex items-center gap-[6px] mt-[8px] text-[13px] font-medium ${growthColor}`}>
        <Icon name={growthIcon} className="text-[16px]" />
        {growthPrefix}{data.percentageGrowth}% este mes
      </div>
    </div>
  );
}
