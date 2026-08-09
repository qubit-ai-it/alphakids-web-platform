import { z } from 'zod';

/**
 * Lead capture schema for the marketing landing page.
 *
 * Fase 1 of the parent-flow refactor: the landing form now collects only
 * name + email. The parent uses the KMP mobile app for everything else.
 */
export const leadSchema = z.object({
  name: z
    .string()
    .min(1, 'Tu nombre es obligatorio')
    .min(2, 'Tu nombre debe tener al menos 2 caracteres')
    .max(100, 'Tu nombre no puede tener más de 100 caracteres'),
  email: z
    .string()
    .min(1, 'Tu correo es obligatorio')
    .email('Ingresa un correo válido'),
});

export type LeadFormData = z.infer<typeof leadSchema>;