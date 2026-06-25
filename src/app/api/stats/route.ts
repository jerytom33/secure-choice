import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

const isPrismaConfigured = Boolean(process.env.DATABASE_URL);
const MOCK_DB_PATH = path.join(process.cwd(), 'src', 'lib', 'mock_db.json');

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get('admin_session')?.value === 'authenticated';
}

function getMockDb() {
  try {
    if (!fs.existsSync(MOCK_DB_PATH)) return { health: [], life: [], general: [], consultation: [] };
    return JSON.parse(fs.readFileSync(MOCK_DB_PATH, 'utf-8'));
  } catch { return { health: [], life: [], general: [], consultation: [] }; }
}

// ─── GET /api/stats — Dashboard aggregates ───────────────────────────────────

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  if (isPrismaConfigured) {
    try {
      const [healthTotal, lifeTotal, generalTotal, consultationTotal,
             healthToday, lifeToday, generalToday, consultationToday,
             healthWeek, lifeWeek, generalWeek, consultationWeek,
             healthMonth, lifeMonth, generalMonth, consultationMonth] = await Promise.all([
        prisma.healthInsuranceLead.count({ where: { is_deleted: false } }),
        prisma.lifeInsuranceLead.count({ where: { is_deleted: false } }),
        prisma.generalInsuranceLead.count({ where: { is_deleted: false } }),
        prisma.consultationRequest.count({ where: { is_deleted: false } }),
        prisma.healthInsuranceLead.count({ where: { is_deleted: false, created_at: { gte: todayStart } } }),
        prisma.lifeInsuranceLead.count({ where: { is_deleted: false, created_at: { gte: todayStart } } }),
        prisma.generalInsuranceLead.count({ where: { is_deleted: false, created_at: { gte: todayStart } } }),
        prisma.consultationRequest.count({ where: { is_deleted: false, created_at: { gte: todayStart } } }),
        prisma.healthInsuranceLead.count({ where: { is_deleted: false, created_at: { gte: weekStart } } }),
        prisma.lifeInsuranceLead.count({ where: { is_deleted: false, created_at: { gte: weekStart } } }),
        prisma.generalInsuranceLead.count({ where: { is_deleted: false, created_at: { gte: weekStart } } }),
        prisma.consultationRequest.count({ where: { is_deleted: false, created_at: { gte: weekStart } } }),
        prisma.healthInsuranceLead.count({ where: { is_deleted: false, created_at: { gte: monthStart } } }),
        prisma.lifeInsuranceLead.count({ where: { is_deleted: false, created_at: { gte: monthStart } } }),
        prisma.generalInsuranceLead.count({ where: { is_deleted: false, created_at: { gte: monthStart } } }),
        prisma.consultationRequest.count({ where: { is_deleted: false, created_at: { gte: monthStart } } }),
      ]);

      return NextResponse.json({
        total: { health: healthTotal, life: lifeTotal, general: generalTotal, consultation: consultationTotal, all: healthTotal + lifeTotal + generalTotal + consultationTotal },
        today: { health: healthToday, life: lifeToday, general: generalToday, consultation: consultationToday, all: healthToday + lifeToday + generalToday + consultationToday },
        thisWeek: { health: healthWeek, life: lifeWeek, general: generalWeek, consultation: consultationWeek, all: healthWeek + lifeWeek + generalWeek + consultationWeek },
        thisMonth: { health: healthMonth, life: lifeMonth, general: generalMonth, consultation: consultationMonth, all: healthMonth + lifeMonth + generalMonth + consultationMonth }
      });
    } catch (err) {
      console.error('Stats API Error:', err);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
  }

  // Mock DB fallback
  const db = getMockDb();
  const countByDate = (list: any[], start: Date) =>
    list.filter((i: any) => !i.is_deleted && new Date(i.created_at) >= start).length;
  const active = (list: any[]) => list.filter((i: any) => !i.is_deleted);

  const h = active(db.health).length;
  const l = active(db.life).length;
  const g = active(db.general).length;
  const c = active(db.consultation).length;

  return NextResponse.json({
    total: { health: h, life: l, general: g, consultation: c, all: h + l + g + c },
    today: { health: countByDate(db.health, todayStart), life: countByDate(db.life, todayStart), general: countByDate(db.general, todayStart), consultation: countByDate(db.consultation, todayStart), all: countByDate(db.health, todayStart) + countByDate(db.life, todayStart) + countByDate(db.general, todayStart) + countByDate(db.consultation, todayStart) },
    thisWeek: { health: countByDate(db.health, weekStart), life: countByDate(db.life, weekStart), general: countByDate(db.general, weekStart), consultation: countByDate(db.consultation, weekStart), all: countByDate(db.health, weekStart) + countByDate(db.life, weekStart) + countByDate(db.general, weekStart) + countByDate(db.consultation, weekStart) },
    thisMonth: { health: countByDate(db.health, monthStart), life: countByDate(db.life, monthStart), general: countByDate(db.general, monthStart), consultation: countByDate(db.consultation, monthStart), all: countByDate(db.health, monthStart) + countByDate(db.life, monthStart) + countByDate(db.general, monthStart) + countByDate(db.consultation, monthStart) }
  });
}
