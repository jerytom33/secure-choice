'use server';

import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import prisma from './prisma';

// ─── Configuration ───────────────────────────────────────────────────────────

const isPrismaConfigured = Boolean(process.env.DATABASE_URL);
const MOCK_DB_PATH = path.join(process.cwd(), 'src', 'lib', 'mock_db.json');

// ─── Types ───────────────────────────────────────────────────────────────────

export type LeadType = 'health' | 'life' | 'general' | 'consultation';
export type LeadStatus = 'Pending' | 'Processing' | 'Converted' | 'Rejected';
export type ConsultationStatus = 'Pending' | 'Processing' | 'Converted' | 'Rejected';

export interface PaginationOpts {
  page?: number;
  pageSize?: number;
  order?: 'asc' | 'desc';
  status?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

// ─── Validation Helpers ──────────────────────────────────────────────────────

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-+]/g, '');
  return /^\d{10,15}$/.test(cleaned);
}

function validatePincode(pincode: string): boolean {
  return /^\d{6}$/.test(pincode);
}

function sanitizeString(str: string): string {
  return str.trim().replace(/<[^>]*>/g, '');
}

function validateRequiredFields(data: Record<string, any>, fields: string[]): string | null {
  for (const field of fields) {
    const value = data[field];
    if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) {
      return `${field} is required`;
    }
  }
  return null;
}

// ─── Mock Database Helpers ───────────────────────────────────────────────────

interface MockDb {
  health: any[];
  life: any[];
  general: any[];
  consultation: any[];
}

function getMockDb(): MockDb {
  try {
    if (!fs.existsSync(MOCK_DB_PATH)) {
      const dir = path.dirname(MOCK_DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const initialDb: MockDb = { health: [], life: [], general: [], consultation: [] };
      fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }
    const content = fs.readFileSync(MOCK_DB_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading mock database:', error);
    return { health: [], life: [], general: [], consultation: [] };
  }
}

function saveMockDb(db: MockDb) {
  try {
    const dir = path.dirname(MOCK_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving mock database:', error);
  }
}

// ─── Auth Actions ────────────────────────────────────────────────────────────

export async function loginAdmin(passcode: string): Promise<ActionResult> {
  let adminPass = process.env.ADMIN_PASSCODE;
  if (!adminPass) {
    console.warn('ADMIN_PASSCODE not set. Using default insecure passcode for dev.');
    adminPass = 'securechoice@2026';
  }

  if (passcode === adminPass) {
    const cookieStore = await cookies();
    cookieStore.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/'
    });
    return { success: true };
  }

  return { success: false, error: 'Invalid Passcode' };
}

export async function logoutAdmin(): Promise<ActionResult> {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  return { success: true };
}

export async function checkAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  return session?.value === 'authenticated';
}

// ─── CREATE: Submit Health Insurance Lead ────────────────────────────────────

export async function submitHealthLead(data: {
  name: string;
  contact: string;
  email: string;
  address: string;
  pincode: string;
  state: string;
  family_members: { name: string; relation: string; dob: string }[];
}): Promise<ActionResult> {
  // Server-side validation
  const requiredError = validateRequiredFields(data, ['name', 'contact', 'email', 'address', 'pincode', 'state']);
  if (requiredError) return { success: false, error: requiredError };
  if (!validateEmail(data.email)) return { success: false, error: 'Invalid email address' };
  if (!validatePhone(data.contact)) return { success: false, error: 'Invalid phone number (10-15 digits required)' };
  if (!validatePincode(data.pincode)) return { success: false, error: 'Pincode must be exactly 6 digits' };

  const sanitized = {
    name: sanitizeString(data.name),
    contact: sanitizeString(data.contact),
    email: sanitizeString(data.email),
    address: sanitizeString(data.address),
    pincode: sanitizeString(data.pincode),
    state: sanitizeString(data.state),
    family_members: data.family_members.map(m => ({
      name: sanitizeString(m.name),
      relation: sanitizeString(m.relation),
      dob: m.dob
    }))
  };

  const id = crypto.randomUUID();

  if (isPrismaConfigured) {
    try {
      await prisma.healthInsuranceLead.create({
        data: { id, ...sanitized, status: 'Pending', is_deleted: false, created_at: new Date() }
      });
    } catch (err) {
      console.error('Prisma Error:', err);
      return { success: false, error: 'Database error. Please try again.' };
    }
  } else {
    const db = getMockDb();
    db.health.push({ id, ...sanitized, status: 'Pending', is_deleted: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    saveMockDb(db);
  }

  return { success: true };
}

// ─── CREATE: Submit Life Insurance Lead ──────────────────────────────────────

export async function submitLifeLead(data: {
  name: string;
  contact: string;
  email: string;
  dob: string;
  profession: string;
  annual_income: string;
  existing_policies: string;
}): Promise<ActionResult> {
  const requiredError = validateRequiredFields(data, ['name', 'contact', 'email', 'dob', 'profession', 'annual_income']);
  if (requiredError) return { success: false, error: requiredError };
  if (!validateEmail(data.email)) return { success: false, error: 'Invalid email address' };
  if (!validatePhone(data.contact)) return { success: false, error: 'Invalid phone number (10-15 digits required)' };

  const sanitized = {
    name: sanitizeString(data.name),
    contact: sanitizeString(data.contact),
    email: sanitizeString(data.email),
    dob: data.dob,
    profession: sanitizeString(data.profession),
    annual_income: sanitizeString(data.annual_income),
    existing_policies: sanitizeString(data.existing_policies)
  };

  const id = crypto.randomUUID();

  if (isPrismaConfigured) {
    try {
      await prisma.lifeInsuranceLead.create({
        data: {
          id,
          ...sanitized,
          dob: sanitized.dob ? new Date(sanitized.dob) : undefined,
          status: 'Pending',
          is_deleted: false,
          created_at: new Date()
        }
      });
    } catch (err) {
      console.error('Prisma Error:', err);
      return { success: false, error: 'Database error. Please try again.' };
    }
  } else {
    const db = getMockDb();
    db.life.push({ id, ...sanitized, status: 'Pending', is_deleted: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    saveMockDb(db);
  }

  return { success: true };
}

// ─── CREATE: Submit General Insurance Lead ───────────────────────────────────

export async function submitGeneralLead(data: {
  name: string;
  contact: string;
  email: string;
  address: string;
  pincode: string;
  state: string;
  insurance_type: string;
}): Promise<ActionResult> {
  const requiredError = validateRequiredFields(data, ['name', 'contact', 'email', 'address', 'pincode', 'state', 'insurance_type']);
  if (requiredError) return { success: false, error: requiredError };
  if (!validateEmail(data.email)) return { success: false, error: 'Invalid email address' };
  if (!validatePhone(data.contact)) return { success: false, error: 'Invalid phone number (10-15 digits required)' };
  if (!validatePincode(data.pincode)) return { success: false, error: 'Pincode must be exactly 6 digits' };

  const sanitized = {
    name: sanitizeString(data.name),
    contact: sanitizeString(data.contact),
    email: sanitizeString(data.email),
    address: sanitizeString(data.address),
    pincode: sanitizeString(data.pincode),
    state: sanitizeString(data.state),
    insurance_type: sanitizeString(data.insurance_type)
  };

  const id = crypto.randomUUID();

  if (isPrismaConfigured) {
    try {
      await prisma.generalInsuranceLead.create({
        data: { id, ...sanitized, status: 'Pending', is_deleted: false, created_at: new Date() }
      });
    } catch (err) {
      console.error('Prisma Error:', err);
      return { success: false, error: 'Database error. Please try again.' };
    }
  } else {
    const db = getMockDb();
    db.general.push({ id, ...sanitized, status: 'Pending', is_deleted: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    saveMockDb(db);
  }

  return { success: true };
}

// ─── CREATE: Submit Consultation Request ─────────────────────────────────────

export async function submitConsultationRequest(data: {
  name: string;
  email: string;
  phone: string;
  preferred_date: string;
  message: string;
}): Promise<ActionResult> {
  const requiredError = validateRequiredFields(data, ['name', 'email', 'phone', 'preferred_date']);
  if (requiredError) return { success: false, error: requiredError };
  if (!validateEmail(data.email)) return { success: false, error: 'Invalid email address' };
  if (!validatePhone(data.phone)) return { success: false, error: 'Invalid phone number (10-15 digits required)' };

  const sanitized = {
    name: sanitizeString(data.name),
    email: sanitizeString(data.email),
    phone: sanitizeString(data.phone),
    preferred_date: data.preferred_date,
    message: sanitizeString(data.message || '')
  };

  const id = crypto.randomUUID();

  if (isPrismaConfigured) {
    try {
      await prisma.consultationRequest.create({
        data: {
          id,
          ...sanitized,
          preferred_date: sanitized.preferred_date ? new Date(sanitized.preferred_date) : undefined,
          status: 'Pending',
          is_deleted: false,
          created_at: new Date()
        }
      });
    } catch (err) {
      console.error('Prisma Error:', err);
      return { success: false, error: 'Database error. Please try again.' };
    }
  } else {
    const db = getMockDb();
    db.consultation.push({ id, ...sanitized, status: 'Pending', is_deleted: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    saveMockDb(db);
  }

  return { success: true };
}

// ─── READ: Fetch All Leads (Admin Dashboard Overview) ────────────────────────

export async function getLeads() {
  const isAuth = await checkAdminSession();
  if (!isAuth) throw new Error('Unauthorized');

  if (isPrismaConfigured) {
    try {
      const [health, life, general, consultation] = await Promise.all([
        prisma.healthInsuranceLead.findMany({ where: { is_deleted: false }, orderBy: { created_at: 'desc' } }),
        prisma.lifeInsuranceLead.findMany({ where: { is_deleted: false }, orderBy: { created_at: 'desc' } }),
        prisma.generalInsuranceLead.findMany({ where: { is_deleted: false }, orderBy: { created_at: 'desc' } }),
        prisma.consultationRequest.findMany({ where: { is_deleted: false }, orderBy: { created_at: 'desc' } })
      ]);

      return {
        health: health.map((h) => ({ ...h, created_at: h.created_at?.toISOString(), updated_at: h.updated_at?.toISOString() })),
        life: life.map((l) => ({ ...l, created_at: l.created_at?.toISOString(), updated_at: l.updated_at?.toISOString(), dob: l.dob?.toISOString() })),
        general: general.map((g) => ({ ...g, created_at: g.created_at?.toISOString(), updated_at: g.updated_at?.toISOString() })),
        consultation: consultation.map((c) => ({ ...c, created_at: c.created_at?.toISOString(), updated_at: c.updated_at?.toISOString(), preferred_date: c.preferred_date?.toISOString() }))
      };
    } catch (err) {
      console.error('Prisma Error fetching leads:', err);
      return getMockDb();
    }
  }

  // Mock DB: filter out soft-deleted
  const db = getMockDb();
  return {
    health: db.health.filter(h => !h.is_deleted),
    life: db.life.filter(l => !l.is_deleted),
    general: db.general.filter(g => !g.is_deleted),
    consultation: db.consultation.filter(c => !c.is_deleted)
  };
}

// ─── READ: Fetch Paginated Leads by Type ─────────────────────────────────────

export async function getLeadsPaginated(type: LeadType, opts?: PaginationOpts): Promise<PaginatedResponse<any>> {
  const isAuth = await checkAdminSession();
  if (!isAuth) throw new Error('Unauthorized');

  const page = Math.max(1, opts?.page ?? 1);
  const pageSize = Math.max(1, Math.min(100, opts?.pageSize ?? 20));
  const orderDesc = opts?.order !== 'asc';
  const offset = (page - 1) * pageSize;

  const whereClause: any = { is_deleted: false };
  if (opts?.status) whereClause.status = opts.status;

  if (isPrismaConfigured) {
    try {
      const model = getPrismaModel(type);
      const [data, total] = await Promise.all([
        (model as any).findMany({
          where: whereClause,
          orderBy: { created_at: orderDesc ? 'desc' : 'asc' },
          skip: offset,
          take: pageSize
        }),
        (model as any).count({ where: whereClause })
      ]);
      return { data, total, page, pageSize };
    } catch (err) {
      console.error(`Prisma Error fetching ${type} leads:`, err);
    }
  }

  // Fallback: mock DB
  const db = getMockDb();
  let all = (db[type] || []).filter((item: any) => !item.is_deleted);
  if (opts?.status) all = all.filter((item: any) => item.status === opts.status);
  if (opts?.search) {
    const q = opts.search.toLowerCase();
    all = all.filter((item: any) =>
      (item.name || '').toLowerCase().includes(q) ||
      (item.email || '').toLowerCase().includes(q) ||
      (item.contact || item.phone || '').toLowerCase().includes(q)
    );
  }
  const total = all.length;
  const data = all.slice(offset, offset + pageSize);
  return { data, total, page, pageSize };
}

// ─── READ: Get Single Lead by ID ─────────────────────────────────────────────

export async function getLeadById(type: LeadType, id: string) {
  const isAuth = await checkAdminSession();
  if (!isAuth) throw new Error('Unauthorized');
  if (!id) return null;

  if (isPrismaConfigured) {
    try {
      const model = getPrismaModel(type);
      const lead = await (model as any).findUnique({ where: { id } });
      if (!lead || lead.is_deleted) return null;
      return lead;
    } catch (err) {
      console.error(`Prisma Error fetching ${type} lead:`, err);
    }
  }

  const db = getMockDb();
  const list = db[type] || [];
  const found = list.find((item: any) => item.id === id && !item.is_deleted);
  return found || null;
}

// ─── UPDATE: Update Lead Status ──────────────────────────────────────────────

export async function updateLeadStatus(type: LeadType, id: string, status: string): Promise<ActionResult> {
  const isAuth = await checkAdminSession();
  if (!isAuth) return { success: false, error: 'Unauthorized' };
  if (!id || !status) return { success: false, error: 'Lead ID and status are required' };

  // Validate status values
  const validStatuses = ['Pending', 'Processing', 'Converted', 'Rejected'];

  if (!validStatuses.includes(status)) {
    return { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` };
  }

  if (isPrismaConfigured) {
    try {
      const model = getPrismaModel(type);
      await (model as any).update({ where: { id }, data: { status } });
      return { success: true };
    } catch (err) {
      console.error(`Prisma Error updating ${type} status:`, err);
      return { success: false, error: 'Database error. Please try again.' };
    }
  }

  // Mock DB update
  const db = getMockDb();
  const list = db[type] || [];
  const index = list.findIndex((item: any) => item.id === id);
  if (index === -1) return { success: false, error: 'Lead not found' };
  list[index].status = status;
  list[index].updated_at = new Date().toISOString();
  saveMockDb(db);
  return { success: true };
}

// ─── UPDATE: Update Lead Notes ───────────────────────────────────────────────

export async function updateLeadNotes(type: LeadType, id: string, notes: string): Promise<ActionResult> {
  const isAuth = await checkAdminSession();
  if (!isAuth) return { success: false, error: 'Unauthorized' };
  if (!id) return { success: false, error: 'Lead ID is required' };

  const sanitizedNotes = sanitizeString(notes || '');

  if (isPrismaConfigured) {
    try {
      const model = getPrismaModel(type);
      await (model as any).update({ where: { id }, data: { notes: sanitizedNotes } });
      return { success: true };
    } catch (err) {
      console.error(`Prisma Error updating ${type} notes:`, err);
      return { success: false, error: 'Database error. Please try again.' };
    }
  }

  const db = getMockDb();
  const list = db[type] || [];
  const index = list.findIndex((item: any) => item.id === id);
  if (index === -1) return { success: false, error: 'Lead not found' };
  list[index].notes = sanitizedNotes;
  list[index].updated_at = new Date().toISOString();
  saveMockDb(db);
  return { success: true };
}

// ─── DELETE: Soft Delete a Lead ──────────────────────────────────────────────

export async function deleteLead(type: LeadType, id: string): Promise<ActionResult> {
  const isAuth = await checkAdminSession();
  if (!isAuth) return { success: false, error: 'Unauthorized' };
  if (!id) return { success: false, error: 'Lead ID is required' };

  if (isPrismaConfigured) {
    try {
      const model = getPrismaModel(type);
      await (model as any).update({ where: { id }, data: { is_deleted: true } });
      return { success: true };
    } catch (err) {
      console.error(`Prisma Error deleting ${type} lead:`, err);
      return { success: false, error: 'Database error. Please try again.' };
    }
  }

  const db = getMockDb();
  const list = db[type] || [];
  const index = list.findIndex((item: any) => item.id === id);
  if (index === -1) return { success: false, error: 'Lead not found' };
  list[index].is_deleted = true;
  list[index].updated_at = new Date().toISOString();
  saveMockDb(db);
  return { success: true };
}

// ─── READ: Dashboard Stats (Aggregated Counts) ──────────────────────────────

export async function getDashboardStats() {
  const isAuth = await checkAdminSession();
  if (!isAuth) throw new Error('Unauthorized');

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  if (isPrismaConfigured) {
    try {
      const [healthTotal, lifeTotal, generalTotal, consultationTotal,
             healthToday, lifeToday, generalToday, consultationToday,
             healthWeek, lifeWeek, generalWeek, consultationWeek] = await Promise.all([
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
      ]);

      return {
        total: { health: healthTotal, life: lifeTotal, general: generalTotal, consultation: consultationTotal },
        today: { health: healthToday, life: lifeToday, general: generalToday, consultation: consultationToday },
        thisWeek: { health: healthWeek, life: lifeWeek, general: generalWeek, consultation: consultationWeek }
      };
    } catch (err) {
      console.error('Prisma Error fetching stats:', err);
    }
  }

  // Mock DB fallback
  const db = getMockDb();
  const countByDate = (list: any[], start: Date) =>
    list.filter(i => !i.is_deleted && new Date(i.created_at) >= start).length;

  return {
    total: {
      health: db.health.filter(i => !i.is_deleted).length,
      life: db.life.filter(i => !i.is_deleted).length,
      general: db.general.filter(i => !i.is_deleted).length,
      consultation: db.consultation.filter(i => !i.is_deleted).length
    },
    today: {
      health: countByDate(db.health, todayStart),
      life: countByDate(db.life, todayStart),
      general: countByDate(db.general, todayStart),
      consultation: countByDate(db.consultation, todayStart)
    },
    thisWeek: {
      health: countByDate(db.health, weekStart),
      life: countByDate(db.life, weekStart),
      general: countByDate(db.general, weekStart),
      consultation: countByDate(db.consultation, weekStart)
    }
  };
}

// ─── Helper: Get Prisma Model by Type ────────────────────────────────────────

function getPrismaModel(type: LeadType) {
  switch (type) {
    case 'health': return prisma.healthInsuranceLead;
    case 'life': return prisma.lifeInsuranceLead;
    case 'general': return prisma.generalInsuranceLead;
    case 'consultation': return prisma.consultationRequest;
    default: throw new Error(`Invalid lead type: ${type}`);
  }
}

// ─── Legacy: getHealthLeads (backward compat) ────────────────────────────────

export async function getHealthLeads(opts?: { page?: number; pageSize?: number; order?: 'asc' | 'desc' }) {
  return getLeadsPaginated('health', opts);
}
