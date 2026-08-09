/**
 * Maps a /api/leads failure to a user-facing message in neutral Spanish (tuteo).
 *
 * Extracted from `LeadForm.tsx` so the new `TryItModal` entry point can reuse
 * the same classification logic. The inline `LeadForm` keeps its own copy for
 * now to avoid touching the Fase 1 surface; this helper is the canonical
 * version going forward.
 */
interface ApiFailure {
  status?: number;
  message?: string;
}

export function classifyLeadError(err: unknown): { message: string } {
  const failure = err as ApiFailure;
  if (failure?.status === 409) {
    return { message: 'Este correo ya está registrado. Revisa tu casilla para continuar.' };
  }
  if (failure?.status === 429) {
    return { message: 'Demasiados intentos. Prueba de nuevo en unos minutos.' };
  }
  if (typeof failure?.status === 'number' && failure.status >= 400 && failure.status < 500) {
    return { message: 'Revisa los datos ingresados e intenta de nuevo.' };
  }
  return { message: 'Algo salió mal. ¿Puedes intentar de nuevo?' };
}
