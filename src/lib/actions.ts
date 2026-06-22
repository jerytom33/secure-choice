'use server';

import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import { supabase, isSupabaseConfigured } from './supabase';

// Helper for local mock database
const MOCK_DB_PATH = path.join(process.cwd(), 'src', 'lib', 'mock_db.json');

interface MockDb {
  health: any[];
  life: any[];
  general: any[];
  consultation: any[];
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
  const adminPass = process.env.ADMIN_PASSCODE || 'securechoice2026';
  
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

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('HealthInsuranceLeads')
      .insert([newLead]);

    if (error) {
      console.error('Supabase Error:', error);
      return { success: false, error: error.message };
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

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('LifeInsuranceLeads')
      .insert([newLead]);

    if (error) {
      console.error('Supabase Error:', error);
      return { success: false, error: error.message };
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

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('GeneralInsuranceLeads')
      .insert([newLead]);

    if (error) {
      console.error('Supabase Error:', error);
      return { success: false, error: error.message };
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

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('ConsultationRequests')
      .insert([newRequest]);

    if (error) {
      console.error('Supabase Error:', error);
      return { success: false, error: error.message };
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

  if (isSupabaseConfigured && supabase) {
    const [healthRes, lifeRes, generalRes, consultationRes] = await Promise.all([
      supabase.from('HealthInsuranceLeads').select('*').order('created_at', { ascending: false }),
      supabase.from('LifeInsuranceLeads').select('*').order('created_at', { ascending: false }),
      supabase.from('GeneralInsuranceLeads').select('*').order('created_at', { ascending: false }),
      supabase.from('ConsultationRequests').select('*').order('created_at', { ascending: false })
    ]);

    if (healthRes.error || lifeRes.error || generalRes.error || consultationRes.error) {
      console.error('Error fetching leads from Supabase');
      // If error occurs or DB is empty/unmigrated, fall back to mock db
      return getMockDb();
    }

    return {
      health: healthRes.data || [],
      life: lifeRes.data || [],
      general: generalRes.data || [],
      consultation: consultationRes.data || []
    };
  } else {
    return getMockDb();
  }
}
