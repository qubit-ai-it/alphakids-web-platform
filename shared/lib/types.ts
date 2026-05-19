export interface UserRole {
  role: {
    id: string;
    name: string;
    description: string | null;
  };
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  roles: UserRole[];
}

export interface InstitutionMember {
  id: string;
  institutionId: string;
  userId: string;
  roleId: string;
  joinedAt: string;
  leftAt: string | null;
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
  role?: {
    id: string;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  gender: Gender | null;
  avatarUrl: string | null;
  institutionId: string | null;
  sectionId: string | null;
  isActive: boolean;
  registeredById: string;
  registeredBy?: {
    id: string;
    email: string;
    name: string | null;
  };
  section?: {
    id: string;
    name: string;
  };
  institution?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type WordAssignmentStatus = 'PENDING' | 'COMPLETED' | 'EXPIRED';

export interface WordAssignment {
  id: string;
  wordId: string;
  studentId: string;
  assignedById: string;
  status: WordAssignmentStatus;
  scheduledAt: string | null;
  expiresAt: string | null;
  word?: {
    id: string;
    text: string;
    difficultyLabel: string;
  };
  student?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  assignedBy?: {
    id: string;
    email: string;
    name: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Institution {
  id: string;
  name: string;
  slug: string;
  ruc: string;
  address: string;
  phone: string | null;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface RegisterResponse {
  access_token: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

export interface PaginatedParams {
  skip?: number;
  take?: number;
  where?: Record<string, unknown>;
}

export interface Grade {
  id: string;
  name: string;
  institutionId: string;
  ageRangeMin: number;
  ageRangeMax: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    sections: number;
  };
  sections?: Section[];
  institution?: {
    id: string;
    name: string;
  };
}

export interface Section {
  id: string;
  name: string;
  gradeId: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
  grade?: {
    id: string;
    name: string;
    institutionId: string;
  };
}

export type DifficultyLabel = 'INICIAL' | 'BASICO' | 'INTERMEDIO' | 'AVANZADO' | 'EXPERTO';

export interface Word {
  id: string;
  text: string;
  difficultyLabel: DifficultyLabel;
  imageUrl: string | null;
  audioUrl: string | null;
  isActive: boolean;
  createdById: string;
  createdBy?: {
    id: string;
    email: string;
    name: string | null;
  };
  createdAt: string;
  updatedAt: string;
}
