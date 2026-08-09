import { describe, it, expect, beforeAll } from 'vitest';
import { SignJWT } from 'jose';
import { verifyToken, getJwtSecret } from './proxy';

const TEST_SECRET = 'a-very-long-test-secret-at-least-32-characters-long-for-hs256';
const WRONG_SECRET = 'WRONG-SECRET-at-least-32-chars-long-enough-yes';
const secretBytes = new TextEncoder().encode(TEST_SECRET);
const wrongSecretBytes = new TextEncoder().encode(WRONG_SECRET);

describe('proxy JWT verification', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = TEST_SECRET;
  });

  it('accepts a valid HS256 token', async () => {
    const token = await new SignJWT({ sub: 'u1', email: 'a@b.c', roles: ['admin'] })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('5m')
      .sign(secretBytes);

    const payload = await verifyToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.roles).toEqual(['admin']);
    expect(payload?.sub).toBe('u1');
    expect(payload?.email).toBe('a@b.c');
  });

  it('rejects a token signed with the wrong secret', async () => {
    const token = await new SignJWT({ sub: 'u1', email: 'a@b.c', roles: ['admin'] })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('5m')
      .sign(wrongSecretBytes);

    const payload = await verifyToken(token);
    expect(payload).toBeNull();
  });

  it('rejects an expired token', async () => {
    const token = await new SignJWT({ sub: 'u1', email: 'a@b.c', roles: ['admin'] })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
      .sign(secretBytes);

    const payload = await verifyToken(token);
    expect(payload).toBeNull();
  });

  it('rejects a malformed token', async () => {
    expect(await verifyToken('not-a-jwt')).toBeNull();
    expect(await verifyToken('a.b.c')).toBeNull();
    expect(await verifyToken('')).toBeNull();
  });

  it('fails closed when JWT_SECRET is unset', () => {
    const original = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    try {
      expect(getJwtSecret()).toBeNull();
    } finally {
      process.env.JWT_SECRET = original;
    }
  });
});
