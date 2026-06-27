'use client';

import { useState, useEffect, useCallback } from 'react';

const ROLES = [
  { value: 'padre', label: 'Padre / Madre de familia' },
  { value: 'docente', label: 'Docente' },
  { value: 'director', label: 'Director / Coordinador' },
  { value: 'otro', label: 'Otro' },
] as const;

function detectSource(): string {
  if (typeof window === 'undefined') return 'directo';
  const url = new URL(window.location.href);
  const ref = url.searchParams.get('ref');
  if (ref) return ref;
  const referrer = document.referrer || '';
  if (referrer.includes('instagram')) return 'instagram';
  if (referrer.includes('tiktok')) return 'tiktok';
  if (referrer.includes('facebook')) return 'facebook';
  if (referrer.includes('google')) return 'google';
  return 'directo';
}

export default function LeadForm() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('padre');
  const [count, setCount] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submittedEmail, setSubmittedEmail] = useState('');

  const source = detectSource();

  /** Fetch lead count on mount */
  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      setCount(data.count);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setStatus('loading');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, role, source }),
      });

      if (!res.ok) {
        setStatus('error');
        return;
      }

      const data = await res.json();
      setCount(data.count);
      setSubmittedEmail(trimmed);
      setEmail('');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="lead-form" className="bg-secondary-50 py-[80px] md:py-[100px]">
      <div className="mx-auto max-w-[600px] px-[24px] space-y-[24px]">
        {/* ─── Counter Card ─── */}
        {count !== null && (
          <div className="card py-[32px] md:py-[40px] px-[32px]">
            <div className="text-center">
              <div className="flex items-center justify-center gap-[16px] mb-[12px]">
                <span className="text-[72px] md:text-[96px] font-extrabold text-primary-500 leading-none">
                  {count}
                </span>
                <span className="text-[32px] md:text-[40px] font-extrabold text-secondary-900">
                  {count === 1 ? 'Familia' : 'Familias'}
                </span>
                <span className="material-symbols-outlined text-[40px] md:text-[48px] text-primary-400">
                  group
                </span>
              </div>
              <p className="text-[18px] md:text-[22px] text-secondary-600 font-medium">
                que prefieren{' '}
                <span className="font-semibold text-primary-500">AlphaKids</span>
              </p>
            </div>
          </div>
        )}

        {/* ─── Form Card ─── */}
        <div className="card text-center py-[60px]">
          <span className="material-symbols-outlined mb-[16px] text-[56px] text-primary-500">
            auto_stories
          </span>

          <h2 className="mb-[8px] text-[28px] font-bold text-secondary-900 md:text-[32px]">
            ¿Querés probar una demo?
          </h2>

          <p className="text-[15px] text-secondary-600 mb-[28px] max-w-[400px] mx-auto">
            Dejanos tu correo y te contactamos para coordinar una demo gratuita.
          </p>

          {/* Success feedback */}
          {status === 'success' && (
            <div className="mb-[24px] px-[20px] py-[12px] bg-green-50 text-green-700 rounded-[10px] text-[14px] font-medium">
              ¡Gracias, <span className="font-bold">{submittedEmail}</span>! Te escribimos pronto.
            </div>
          )}

          {/* Error feedback */}
          {status === 'error' && (
            <div className="mb-[24px] px-[20px] py-[12px] bg-red-50 text-red-600 rounded-[10px] text-[14px] font-medium">
              Algo salió mal. ¿Podés intentar de nuevo?
            </div>
          )}

          <form onSubmit={handleSubmit} className="max-w-[480px] mx-auto flex flex-col gap-[16px]">
            {/* Role selector */}
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={status === 'loading'}
              className="w-full px-[16px] py-[14px] rounded-[10px] border border-secondary-200 bg-white text-secondary-900 text-[15px] outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 appearance-none"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>

            {/* Email + submit row */}
            <div className="flex flex-col sm:flex-row gap-[12px]">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                disabled={status === 'loading'}
                className="flex-1 px-[16px] py-[14px] rounded-[10px] border border-secondary-200 bg-white text-secondary-900 text-[15px] outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder:text-secondary-400 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === 'loading' || !email.trim()}
                className="btn btn-primary btn-lg whitespace-nowrap inline-flex items-center justify-center gap-[8px] disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <>
                    <span className="spinner spinner-sm" />
                    Enviando…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">send</span>
                    Enviar
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Source badge (informational, hidden on small) */}
          {source !== 'directo' && (
            <p className="mt-[16px] text-[12px] text-secondary-400 hidden sm:block">
              Vía: {source}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
