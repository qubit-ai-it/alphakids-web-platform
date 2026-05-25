import { api } from '@/shared/lib/api-client';

export const emailService = {
  async send(to: string, subject: string, html: string): Promise<void> {
    await api.post('/email/send', { to, subject, html });
  },
};
