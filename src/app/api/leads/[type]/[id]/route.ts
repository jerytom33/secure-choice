import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

const isPrismaConfigured = Boolean(process.env.DATABASE_URL);
const MOCK_DB_PATH = path.join(process.cwd(), 'src', 'lib', 'mock_db.json');
const VALID_TYPES = ['health', 'life', 'general', 'consultation'];

type LeadType = 'health' | 'life' | 'general' | 'consultation';

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

function saveMockDb(db: any) {
  const dir = path.dirname(MOCK_DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

function getPrismaModel(type: LeadType) {
  switch (type) {
    case 'health': return prisma.healthInsuranceLead;
    case 'life': return prisma.lifeInsuranceLead;
    case 'general': return prisma.generalInsuranceLead;
    case 'consultation': return prisma.consultationRequest;
  }
}

// ─── GET /api/leads/[type]/[id] — Get single lead ────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { type, id } = await params;
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Invalid lead type' }, { status: 400 });
  }

  if (isPrismaConfigured) {
    try {
      const model = getPrismaModel(type as LeadType);
      const lead = await (model as any).findUnique({ where: { id } });
      if (!lead || lead.is_deleted) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      }
      return NextResponse.json(lead);
    } catch (err) {
      console.error('API GET Error:', err);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
  }

  const db = getMockDb();
  const found = (db[type] || []).find((item: any) => item.id === id && !item.is_deleted);
  if (!found) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  return NextResponse.json(found);
}

// ─── PUT /api/leads/[type]/[id] — Update status/notes ────────────────────────

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { type, id } = await params;
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Invalid lead type' }, { status: 400 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Only allow updating specific fields
  const allowedFields = ['status', 'notes'];
  const updateData: any = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = typeof body[field] === 'string'
        ? body[field].trim().replace(/<[^>]*>/g, '')
        : body[field];
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update. Allowed: status, notes' }, { status: 400 });
  }

  // Validate status if provided
  if (updateData.status) {
    const validLeadStatuses = ['New', 'Contacted', 'Follow-Up', 'Converted', 'Rejected'];
    const validConsultationStatuses = ['Pending', 'Scheduled', 'Completed', 'Cancelled'];
    const validStatuses = type === 'consultation' ? validConsultationStatuses : validLeadStatuses;
    if (!validStatuses.includes(updateData.status)) {
      return NextResponse.json({ error: `Invalid status. Must be: ${validStatuses.join(', ')}` }, { status: 400 });
    }
  }

  if (isPrismaConfigured) {
    try {
      const model = getPrismaModel(type as LeadType);
      const existing = await (model as any).findUnique({ where: { id } });
      if (!existing || existing.is_deleted) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      }
      const updated = await (model as any).update({ where: { id }, data: updateData });
      return NextResponse.json(updated);
    } catch (err) {
      console.error('API PUT Error:', err);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
  }

  // Mock DB
  const db = getMockDb();
  const list = db[type] || [];
  const index = list.findIndex((item: any) => item.id === id && !item.is_deleted);
  if (index === -1) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  Object.assign(list[index], updateData, { updated_at: new Date().toISOString() });
  saveMockDb(db);
  return NextResponse.json(list[index]);
}

// ─── DELETE /api/leads/[type]/[id] — Soft delete ─────────────────────────────

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { type, id } = await params;
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Invalid lead type' }, { status: 400 });
  }

  if (isPrismaConfigured) {
    try {
      const model = getPrismaModel(type as LeadType);
      const existing = await (model as any).findUnique({ where: { id } });
      if (!existing || existing.is_deleted) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      }
      await (model as any).update({ where: { id }, data: { is_deleted: true } });
      return NextResponse.json({ success: true, message: 'Lead deleted successfully' });
    } catch (err) {
      console.error('API DELETE Error:', err);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
  }

  // Mock DB
  const db = getMockDb();
  const list = db[type] || [];
  const index = list.findIndex((item: any) => item.id === id && !item.is_deleted);
  if (index === -1) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  list[index].is_deleted = true;
  list[index].updated_at = new Date().toISOString();
  saveMockDb(db);
  return NextResponse.json({ success: true, message: 'Lead deleted successfully' });
}
