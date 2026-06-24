'use server';

import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import prisma from './prisma';

const isPrismaConfigured = Boolean(process.env.DATABASE_URL);

// Helper for local mock database
const MOCK_DB_PATH = path.join(process.cwd(), 'src', 'lib', 'mock_db.json');

interface MockDb {
  health: any[];
  life: any[];
  general: any[];
  consultation: any[];
}

// Health lead type used for typed responses
export interface HealthLead {
  id: string;
  name?: string;
  contact?: string;
  email?: string;
  address?: string;
  pincode?: string;
  state?: string;
  family_members?: { name: string; relation: string; dob: string }[];
  created_at?: string;
}

function getMockDb(): MockDb {
  try {
    if (!fs.existsSync(MOCK_DB_PATH)) {
      // Create directory if it doesn't exist
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

// Admin passcode action
export async function loginAdmin(passcode: string) {
  let adminPass = process.env.ADMIN_PASSCODE;
  if (!adminPass) {
    console.warn('ADMIN_PASSCODE is not set. Using default insecure passcode for local/dev. Set ADMIN_PASSCODE in env for production.');
    adminPass = 'securechoice2026';
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

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  return { success: true };
}

export async function checkAdminSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  return session?.value === 'authenticated';
}

// 1. Submit Health Insurance Lead
export async function submitHealthLead(data: {
  name: string;
  contact: string;
  email: string;
  address: string;
  pincode: string;
  state: string;
  family_members: { name: string; relation: string; dob: string }[];
}) {
  const newLead = {
    id: crypto.randomUUID(),
    ...data,
    created_at: new Date().toISOString()
  };
  if (isPrismaConfigured) {
    try {
      await prisma.healthInsuranceLead.create({ data: { ...data, id: newLead.id, created_at: new Date() } });
    } catch (err) {
      console.error('Prisma Error:', err);
      return { success: false, error: (err as Error).message };
    }
  } else {
    // Save to mock local database
    const db = getMockDb();
    db.health.push(newLead);
    saveMockDb(db);
  }

  return { success: true };
}

// 2. Submit Life Insurance Lead
export async function submitLifeLead(data: {
  name: string;
  contact: string;
  email: string;
  dob: string;
  profession: string;
  annual_income: string;
  existing_policies: string;
}) {
  const newLead = {
    id: crypto.randomUUID(),
    ...data,
    created_at: new Date().toISOString()
  };
  if (isPrismaConfigured) {
    try {
      await prisma.lifeInsuranceLead.create({ data: { id: newLead.id, name: data.name, contact: data.contact, email: data.email, dob: data.dob ? new Date(data.dob) : undefined, profession: data.profession, annual_income: data.annual_income, existing_policies: data.existing_policies, created_at: new Date() } });
    } catch (err) {
      console.error('Prisma Error:', err);
      return { success: false, error: (err as Error).message };
    }
  } else {
    const db = getMockDb();
    db.life.push(newLead);
    saveMockDb(db);
  }

  return { success: true };
}

// 3. Submit General Insurance Lead
export async function submitGeneralLead(data: {
  name: string;
  contact: string;
  email: string;
  address: string;
  pincode: string;
  state: string;
  insurance_type: string;
}) {
  const newLead = {
    id: crypto.randomUUID(),
    ...data,
    created_at: new Date().toISOString()
  };
  if (isPrismaConfigured) {
    try {
      await prisma.generalInsuranceLead.create({ data: { id: newLead.id, name: data.name, contact: data.contact, email: data.email, address: data.address, pincode: data.pincode, state: data.state, insurance_type: data.insurance_type, created_at: new Date() } });
    } catch (err) {
      console.error('Prisma Error:', err);
      return { success: false, error: (err as Error).message };
    }
  } else {
    const db = getMockDb();
    db.general.push(newLead);
    saveMockDb(db);
  }

  return { success: true };
}

// 4. Submit Consultation Request
export async function submitConsultationRequest(data: {
  name: string;
  email: string;
  phone: string;
  preferred_date: string;
  message: string;
}) {
  const newRequest = {
    id: crypto.randomUUID(),
    ...data,
    status: 'Pending',
    created_at: new Date().toISOString()
  };
  if (isPrismaConfigured) {
    try {
      await prisma.consultationRequest.create({ data: { id: newRequest.id, name: data.name, email: data.email, phone: data.phone, preferred_date: data.preferred_date ? new Date(data.preferred_date) : undefined, message: data.message, status: 'Pending', created_at: new Date() } });
    } catch (err) {
      console.error('Prisma Error:', err);
      return { success: false, error: (err as Error).message };
    }
  } else {
    const db = getMockDb();
    db.consultation.push(newRequest);
    saveMockDb(db);
  }

  return { success: true };
}

// Fetch all leads (for Admin Dashboard)
export async function getLeads() {
  const isAuth = await checkAdminSession();
  if (!isAuth) {
    throw new Error('Unauthorized');
  }
  if (isPrismaConfigured) {
    try {
      const [health, life, general, consultation] = await Promise.all([
        prisma.healthInsuranceLead.findMany({ orderBy: { created_at: 'desc' } }),
        prisma.lifeInsuranceLead.findMany({ orderBy: { created_at: 'desc' } }),
        prisma.generalInsuranceLead.findMany({ orderBy: { created_at: 'desc' } }),
        prisma.consultationRequest.findMany({ orderBy: { created_at: 'desc' } })
      ]);

      return {
        health: health.map((h) => ({ ...h, created_at: h.created_at?.toISOString() })),
        life: life.map((l) => ({ ...l, created_at: l.created_at?.toISOString(), dob: l.dob?.toISOString() })),
        general: general.map((g) => ({ ...g, created_at: g.created_at?.toISOString() })),
        consultation: consultation.map((c) => ({ ...c, created_at: c.created_at?.toISOString(), preferred_date: c.preferred_date?.toISOString() }))
      };
    } catch (err) {
      console.error('Prisma Error fetching leads:', err);
      return getMockDb();
    }
  } else {
    return getMockDb();
  }
}

// Fetch only health leads (admin-protected)
export async function getHealthLeads(opts?: { page?: number; pageSize?: number; order?: 'asc' | 'desc' }) {
  const isAuth = await checkAdminSession();
  if (!isAuth) {
    throw new Error('Unauthorized');
  }

  const page = Math.max(1, opts?.page ?? 1);
  const pageSize = Math.max(1, opts?.pageSize ?? 20);
  const orderDesc = opts?.order !== 'asc';
  const offset = (page - 1) * pageSize;

  if (isPrismaConfigured) {
    try {
      const [data, total] = await Promise.all([
        prisma.healthInsuranceLead.findMany({
          orderBy: { created_at: orderDesc ? 'desc' : 'asc' },
          skip: offset,
          take: pageSize
        }),
        prisma.healthInsuranceLead.count()
      ]);

      return { data, total, page, pageSize };
    } catch (err) {
      console.error('Prisma Error fetching health leads:', err);
      const db = getMockDb();
      const all = db.health as HealthLead[];
      const total = all.length;
      const paged = all.slice(offset, offset + pageSize);
      return { data: paged, total, page, pageSize };
    }
  }

  const db = getMockDb();
  const all = db.health as HealthLead[];
  const total = all.length;
  const paged = all.slice(offset, offset + pageSize);
  return { data: paged, total, page, pageSize };
}
