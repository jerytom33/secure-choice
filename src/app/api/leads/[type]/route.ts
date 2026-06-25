import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

const isPrismaConfigured = Boolean(process.env.DATABASE_URL);
const MOCK_DB_PATH = path.join(process.cwd(), 'src', 'lib', 'mock_db.json');
const VALID_TYPES = ['health', 'life', 'general', 'consultation'];

type LeadType = 'health' | 'life' | 'general' | 'consultation';

// ─── Auth Check ──────────────────────────────────────────────────────────────

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

function getPrismaModel(type: LeadType) {
  switch (type) {
    case 'health': return prisma.healthInsuranceLead;
    case 'life': return prisma.lifeInsuranceLead;
    case 'general': return prisma.generalInsuranceLead;
    case 'consultation': return prisma.consultationRequest;
  }
}

// ─── GET /api/leads/[type] — Paginated list with filters ─────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { type } = await params;
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Invalid lead type' }, { status: 400 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const pageSize = Math.max(1, Math.min(100, parseInt(searchParams.get('pageSize') || '20')));
  const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';
  const status = searchParams.get('status') || undefined;
  const search = searchParams.get('search') || undefined;
  const offset = (page - 1) * pageSize;

  if (isPrismaConfigured) {
    try {
      const model = getPrismaModel(type as LeadType);
      const where: any = { is_deleted: false };
      if (status) where.status = status;

      const [data, total] = await Promise.all([
        (model as any).findMany({ where, orderBy: { created_at: order }, skip: offset, take: pageSize }),
        (model as any).count({ where })
      ]);

      return NextResponse.json({ data, total, page, pageSize });
    } catch (err) {
      console.error('API Error:', err);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
  }

  // Mock DB fallback
  const db = getMockDb();
  let list = (db[type] || []).filter((item: any) => !item.is_deleted);
  if (status) list = list.filter((item: any) => item.status === status);
  if (search) {
    const q = search.toLowerCase();
    list = list.filter((item: any) =>
      (item.name || '').toLowerCase().includes(q) ||
      (item.email || '').toLowerCase().includes(q) ||
      (item.contact || item.phone || '').toLowerCase().includes(q)
    );
  }
  if (order === 'asc') list.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  else list.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const total = list.length;
  const data = list.slice(offset, offset + pageSize);
  return NextResponse.json({ data, total, page, pageSize });
}

// ─── POST /api/leads/[type] — Public form submission ─────────────────────────

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Invalid lead type' }, { status: 400 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Basic required fields check per type
  const requiredMap: Record<string, string[]> = {
    health: ['name', 'contact', 'email', 'address', 'pincode', 'state'],
    life: ['name', 'contact', 'email', 'dob', 'profession', 'annual_income'],
    general: ['name', 'contact', 'email', 'address', 'pincode', 'state', 'insurance_type'],
    consultation: ['name', 'email', 'phone', 'preferred_date']
  };

  const required = requiredMap[type] || [];
  for (const field of required) {
    if (!body[field] || (typeof body[field] === 'string' && !body[field].trim())) {
      return NextResponse.json({ error: `${field} is required` }, { status: 400 });
    }
  }

  // Email validation
  const emailField = body.email;
  if (emailField && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const now = new Date();

  if (isPrismaConfigured) {
    try {
      const model = getPrismaModel(type as LeadType);
      const data: any = { id, ...body, status: type === 'consultation' ? 'Pending' : 'Pending', is_deleted: false, created_at: now };
      if (type === 'life' && body.dob) data.dob = new Date(body.dob);
      if (type === 'consultation' && body.preferred_date) data.preferred_date = new Date(body.preferred_date);
      await (model as any).create({ data });
      return NextResponse.json({ success: true, id }, { status: 201 });
    } catch (err) {
      console.error('API POST Error:', err);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
  }

  // Mock DB
  const db = getMockDb();
  const newEntry = { id, ...body, status: 'Pending', is_deleted: false, created_at: now.toISOString(), updated_at: now.toISOString() };
  db[type].push(newEntry);
  const dir = path.dirname(MOCK_DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  return NextResponse.json({ success: true, id }, { status: 201 });
}
