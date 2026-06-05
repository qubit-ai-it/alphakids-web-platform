import { z } from 'zod';

export const leadSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z
    .string()
    .email('Ingresá un email válido'),
  telefono: z
    .string()
    .min(9, 'El teléfono debe tener al menos 9 dígitos'),
  edad_hijo: z.coerce
    .number()
    .int()
    .min(3, 'La edad debe estar entre 3 y 6')
    .max(6, 'La edad debe estar entre 3 y 6')
    .optional(),
});

export type LeadFormData = z.infer<typeof leadSchema>;
