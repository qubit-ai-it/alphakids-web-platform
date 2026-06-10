const STORAGE_KEY = 'email_cooldown';
const COOLDOWNS = [60, 60, 120, 120, 360, 86400];

interface CooldownState {
  email: string;
  sendCount: number;
  lastSentAt: number;
}

export function getCooldownRemaining(email: string): number {
  if (typeof window === 'undefined') return 0;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return 0;

  try {
    const state: CooldownState = JSON.parse(raw);
    if (state.email !== email) return 0;

    const elapsed = (Date.now() - state.lastSentAt) / 1000;
    const index = Math.min(state.sendCount - 1, COOLDOWNS.length - 1);
    const cooldown = COOLDOWNS[index];

    return Math.max(0, Math.ceil(cooldown - elapsed));
  } catch {
    return 0;
  }
}

export function recordSend(email: string): void {
  if (typeof window === 'undefined') return;

  const raw = localStorage.getItem(STORAGE_KEY);
  let sendCount = 1;

  if (raw) {
    try {
      const state: CooldownState = JSON.parse(raw);
      if (state.email === email) {
        sendCount = state.sendCount + 1;
      }
    } catch {}
  }

  const state: CooldownState = {
    email,
    sendCount,
    lastSentAt: Date.now(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function canSendEmail(email: string): { allowed: boolean; remaining: number; cooldown: number } {
  const remaining = getCooldownRemaining(email);
  const allowed = remaining === 0;
  return { allowed, remaining, cooldown: remaining };
}
