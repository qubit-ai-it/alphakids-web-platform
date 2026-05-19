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
  createdAt: string;
  updatedAt: string;
  roles: UserRole[];
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
