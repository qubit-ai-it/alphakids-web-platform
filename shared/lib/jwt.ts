interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  memberships?: { institutionId: string; role: { id: string; name: string } }[];
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
