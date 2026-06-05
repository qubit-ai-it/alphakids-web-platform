'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setTokenCookie } from '@/shared/lib/jwt';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const token = searchParams.get('access_token');

    if (!token) {
      router.replace('/?error=no_token');
      return;
    }

    localStorage.setItem('access_token', token);
    setTokenCookie(token);
    window.location.href = '/dashboard';
  }, [searchParams, router]);

  return null;
}

export default function OAuthCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-100">
      <div className="text-center">
        <div className="spinner spinner-lg mb-[16px]" />
        <p className="text-secondary-600 text-[14px]">Iniciando sesión...</p>
        <Suspense fallback={null}>
          <CallbackHandler />
        </Suspense>
      </div>
    </div>
  );
}
