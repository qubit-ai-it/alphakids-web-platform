import { api } from '../../../shared/lib/api-client';

export interface SummaryCardsData {
  totalInstituciones: number;
  totalUsuarios: number;
  totalDocentes: number;
  totalAlumnos: number;
}

export interface ActiveStudentsData {
  totalActivos: number;
  percentageGrowth: number;
}

export interface RecentInstitution {
  id: string;
  nombre: string;
  usuarios: number;
  estado: string;
}

export class AdminMetricsService {
  async getSummaryCards(): Promise<SummaryCardsData> {
    return api.get<SummaryCardsData>('/admin-metrics/summary-cards');
  }

  async getActiveStudents(): Promise<ActiveStudentsData> {
    return api.get<ActiveStudentsData>('/admin-metrics/active-students');
  }

  async getRecentInstitutions(): Promise<RecentInstitution[]> {
    return api.get<RecentInstitution[]>('/admin-metrics/recent-institutions');
  }
}

export const adminMetricsService = new AdminMetricsService();
