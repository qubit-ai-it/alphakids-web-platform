import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, errors as joseErrors } from 'jose';

interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  exp: number;
  sessionId?: string;
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

export function getJwtSecret(): Uint8Array | null {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    // Fail closed: if the secret is missing or too short, we cannot verify tokens.
    // The function returns null and the proxy will reject every request.
    return null;
  }
  return new TextEncoder().encode(secret);
}

/**
 * Verifies the JWT signature, algorithm, and expiration against JWT_SECRET.
 * Returns the payload only if the token is valid. Returns null otherwise.
 *
 * This replaces the previous decode-only path, which let any client forge a
 * token with arbitrary roles and bypass the dashboard gating.
 */
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  const secret = getJwtSecret();
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
    });
    if (
      typeof payload.sub !== 'string' ||
      typeof payload.email !== 'string' ||
      !Array.isArray(payload.roles) ||
      typeof payload.exp !== 'number'
    ) {
      return null;
    }
    return {
      sub: payload.sub,
      email: payload.email,
      roles: payload.roles as string[],
      exp: payload.exp,
      sessionId: typeof payload.sessionId === 'string' ? payload.sessionId : undefined,
    };
  } catch (err) {
    if (err instanceof joseErrors.JWTExpired) return null;
    if (err instanceof joseErrors.JWTInvalid || err instanceof joseErrors.JWSInvalid) {
      return null;
    }
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public and static routes
  if (publicRoutes.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // Skip non-dashboard routes
  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  // Misconfigured server: no JWT_SECRET set. Fail closed.
  if (!getJwtSecret()) {
    return NextResponse.redirect(new URL('/error/500', request.url));
  }

  // Get token from cookie
  const token = request.cookies.get('access_token')?.value;
  if (!token) {
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify JWT signature and expiration
  const payload = await verifyToken(token);
  if (!payload) {
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
    return NextResponse.redirect(new URL('/error/403', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/setup-password',
  ],
};
