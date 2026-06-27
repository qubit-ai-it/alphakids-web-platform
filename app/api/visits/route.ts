import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const DATA_PATH = join(process.cwd(), 'data', 'visits.json');

interface VisitsData {
  total: number;
  byDate: Record<string, number>;
}

async function readVisits(): Promise<VisitsData> {
  try {
    const raw = await readFile(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { total: 0, byDate: {} };
  }
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

/** GET /api/visits → returns total and today's count */
export async function GET() {
  const data = await readVisits();
  const today = todayKey();
  return NextResponse.json({
    total: data.total,
    today: data.byDate[today] ?? 0,
    byDate: data.byDate,
  });
}

/** POST /api/visits → increments visit counter */
export async function POST() {
  const data = await readVisits();
  const today = todayKey();

  data.total += 1;
  data.byDate[today] = (data.byDate[today] ?? 0) + 1;

  await writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');

  return NextResponse.json({
    total: data.total,
    today: data.byDate[today],
  });
}
