import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const LEAD_PATH = join(process.cwd(), 'data', 'leads.json');
const VISIT_PATH = join(process.cwd(), 'data', 'visits.json');
const CAMPAIGN_PATH = join(process.cwd(), 'data', 'campaign.json');

async function readJson(path: string) {
  try {
    const raw = await readFile(path, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** GET /api/stats → consolidated KPIs */
export async function GET() {
  const leads = (await readJson(LEAD_PATH)) ?? [];
  const visits = (await readJson(VISIT_PATH)) ?? { total: 0, byDate: {} };
  const campaign = (await readJson(CAMPAIGN_PATH)) ?? [];

  const leadCount = Array.isArray(leads) ? leads.length : 0;
  const totalVisits = visits.total ?? 0;
  const totalInvestment = Array.isArray(campaign)
    ? campaign.reduce((sum: number, e: any) => sum + (e.amount ?? 0), 0)
    : 0;

  return NextResponse.json({
    leads: {
      total: leadCount,
      emails: Array.isArray(leads) ? leads.map((l: any) => (typeof l === 'string' ? l : l.email)) : [],
    },
    visits: {
      total: totalVisits,
      today: visits.byDate?.[new Date().toISOString().slice(0, 10)] ?? 0,
    },
    campaign: {
      totalInvestment,
      entries: Array.isArray(campaign) ? campaign : [],
    },
    conversion: {
      rate: totalVisits > 0 ? Number(((leadCount / totalVisits) * 100).toFixed(2)) : 0,
      leads: leadCount,
      visits: totalVisits,
    },
    cpl: {
      value: leadCount > 0 ? Number((totalInvestment / leadCount).toFixed(2)) : 0,
      investment: totalInvestment,
      leads: leadCount,
    },
  });
}
