import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  exp: number;
}

const roleRouteMap: Record<string, string> = {
  admin: '/dashboard/admin',
  director: '/dashboard/director',
  teacher: '/dashboard/docente',
};

const roleLandingMap: Record<string, string> = {
  admin: '/dashboard/admin/instituciones',
  director: '/dashboard/director/grados',
  teacher: '/dashboard/docente/aula',
};

const publicRoutes = [
  '/',
  '/auth/callback',
  '/forgot-password',
  '/reset-password',
  '/setup-password',
  '/register',
  '/error',
  '/_next/static',
  '/favicon.ico',
];

function decodeToken(token: string): JwtPayload | null {
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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public and static routes
  if (publicRoutes.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // Skip non-dashboard routes
  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  // Get token from cookie
  const token = request.cookies.get('access_token')?.value;
  if (!token) {
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Decode JWT to get role
  const payload = decodeToken(token);
  if (!payload) {
    const loginUrl = new URL('/', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Check token expiration
  if (payload.exp * 1000 < Date.now()) {
    const loginUrl = new URL('/', request.url);
    return NextResponse.redirect(loginUrl);
  }

  const primaryRole = payload.roles?.[0];
  if (!primaryRole) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const allowedPrefix = roleRouteMap[primaryRole];
  if (!allowedPrefix) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Allow /dashboard itself (client-side page.tsx handles role redirect)
  if (pathname === '/dashboard') {
    return NextResponse.next();
  }

  // Check if current path is allowed for this role
  if (!pathname.startsWith(allowedPrefix)) {
    return NextResponse.redirect(new URL('/forbidden', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
