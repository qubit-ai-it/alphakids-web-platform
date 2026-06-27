import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const DATA_PATH = join(process.cwd(), 'data', 'leads.json');

export interface LeadEntry {
  email: string;
  role: string;
  source: string;
  date: string;
}

async function readLeads(): Promise<LeadEntry[]> {
  try {
    const raw = await readFile(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeLeads(leads: LeadEntry[]) {
  await writeFile(DATA_PATH, JSON.stringify(leads, null, 2), 'utf-8');
}

/** GET /api/leads → returns count, filtered list, or all */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role');
  const source = searchParams.get('source');

  let leads = await readLeads();

  if (role) leads = leads.filter((l) => l.role === role);
  if (source) leads = leads.filter((l) => l.source === source);

  return NextResponse.json({
    count: leads.length,
    leads,
  });
}

/** POST /api/leads → body: { email, role?, source? } */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? '').trim();
    const role = String(body.role ?? 'desconocido').trim();
    const source = String(body.source ?? 'directo').trim();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const leads = await readLeads();

    // Migrate old plain-string leads to object format
    const migrated = leads.map((l) =>
      typeof l === 'string' ? { email: l, role: 'desconocido', source: 'directo', date: '' } : l,
    );

    const entry: LeadEntry = {
      email,
      role: role || 'desconocido',
      source: source || 'directo',
      date: new Date().toISOString(),
    };

    migrated.push(entry);
    await writeLeads(migrated);

    return NextResponse.json({ count: migrated.length, entry });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
