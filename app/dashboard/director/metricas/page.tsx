import { RendimientoPorSeccion } from '@/features/director/components/RendimientoPorSeccion';
import { TotalEstudiantes } from '@/features/director/components/TotalEstudiantes';

export default function DirectorMetricasPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Métricas</h1>
        <p className="page-subtitle">Panel de métricas institucionales</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RendimientoPorSeccion />
        <TotalEstudiantes />
      </div>
    </div>
  );
}
