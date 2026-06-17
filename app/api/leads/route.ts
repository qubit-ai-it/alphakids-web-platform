import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const DATA_PATH = join(process.cwd(), 'data', 'leads.json');

async function readLeads(): Promise<string[]> {
  try {
    const raw = await readFile(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeLeads(leads: string[]) {
  await writeFile(DATA_PATH, JSON.stringify(leads, null, 2), 'utf-8');
}

/** GET /api/leads → returns count and all emails */
export async function GET() {
  const leads = await readLeads();
  return NextResponse.json({ count: leads.length, emails: leads });
}

/** POST /api/leads → body: { email: string } */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? '').trim();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const leads = await readLeads();
    leads.push(email);
    await writeLeads(leads);

    return NextResponse.json({ count: leads.length, email });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
