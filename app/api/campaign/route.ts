import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const DATA_PATH = join(process.cwd(), 'data', 'campaign.json');

export interface CampaignEntry {
  date: string; // YYYY-MM-DD
  amount: number;
  source: string;
}

async function readCampaign(): Promise<CampaignEntry[]> {
  try {
    const raw = await readFile(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeCampaign(data: CampaignEntry[]) {
  await writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

/** GET /api/campaign → returns all entries + total investment */
export async function GET() {
  const entries = await readCampaign();
  const total = entries.reduce((sum, e) => sum + e.amount, 0);
  return NextResponse.json({ entries, totalInvestment: total });
}

/** POST /api/campaign → body: { date, amount, source } */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const date = String(body.date ?? '').trim();
    const amount = Number(body.amount);
    const source = String(body.source ?? '').trim();

    if (!date || isNaN(amount) || amount <= 0 || !source) {
      return NextResponse.json({ error: 'date (YYYY-MM-DD), amount (>0), and source are required' }, { status: 400 });
    }

    const entries = await readCampaign();
    const entry: CampaignEntry = { date, amount, source };
    entries.push(entry);
    await writeCampaign(entries);

    const total = entries.reduce((sum, e) => sum + e.amount, 0);
    return NextResponse.json({ entry, totalInvestment: total });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
