'use client';

import { useState, useEffect, useCallback } from 'react';

export default function LeadForm() {
  const [email, setEmail] = useState('');
  const [count, setCount] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submittedEmail, setSubmittedEmail] = useState('');

  /** Fetch lead count on mount */
  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      setCount(data.count);
    } catch {
      // silent — not critical
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
        body: JSON.stringify({ email: trimmed }),
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
    <section className="bg-secondary-50 py-[80px] md:py-[100px]">
      <div className="mx-auto max-w-[600px] px-[24px] space-y-[24px]">
        {/* ─── Counter Card ─── */}
        {count !== null && (
          <div className="card py-[32px] md:py-[40px] px-[32px] flex items-center gap-[20px] md:gap-[32px]">
            <div className="flex items-center gap-[12px] flex-shrink-0">
              <span className="material-symbols-outlined text-[32px] md:text-[40px] text-primary-400">
                group
              </span>
              <span className="text-[72px] md:text-[96px] font-extrabold text-primary-500 leading-none">
                {count}
              </span>
            </div>
            <p className="text-[15px] md:text-[18px] text-secondary-600 leading-tight">
              <span className="font-semibold text-secondary-900">
                {count === 1 ? 'Persona' : 'Personas'}
              </span>{' '}
              interesadas en{' '}
              <span className="font-semibold text-secondary-900">adquirir una demo</span>
            </p>
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

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-[12px] max-w-[480px] mx-auto">
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
          </form>
        </div>
      </div>
    </section>
  );
}
