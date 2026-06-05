interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  memberships?: {
    institutionId: string;
    institution?: { name: string };
    role: { id: string; name: string };
  }[];
  sectionAssignments?: {
    sectionId: string;
    sectionName: string;
    gradeId: string;
  }[];
  iat: number;
  exp: number;
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const json = decodeURIComponent(
      decoded
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getInstitutionId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const token = localStorage.getItem('access_token');
  if (!token) return undefined;
  const payload = decodeToken(token);
  return payload?.memberships?.[0]?.institutionId;
}

export function getInstitutionName(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const token = localStorage.getItem('access_token');
  if (!token) return undefined;
  const payload = decodeToken(token);
  return payload?.memberships?.[0]?.institution?.name;
}

export function getTeacherSectionIds(): string[] {
  if (typeof window === 'undefined') return [];
  const token = localStorage.getItem('access_token');
  if (!token) return [];
  const payload = decodeToken(token);
  return payload?.sectionAssignments?.map((a) => a.sectionId) ?? [];
}

export function setTokenCookie(token: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `access_token=${token}; path=/; max-age=86400; SameSite=Lax`;
}

export function removeTokenCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = 'access_token=; path=/; max-age=0; SameSite=Lax';
}
