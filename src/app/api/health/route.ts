import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const isPrismaConfigured = Boolean(process.env.DATABASE_URL);

// ─── GET /api/health — Public health check endpoint ──────────────────────────

export async function GET() {
  let dbStatus = 'not_configured';

  if (isPrismaConfigured) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch {
      dbStatus = 'disconnected';
    }
  } else {
    dbStatus = 'mock_mode';
  }

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    version: process.env.npm_package_version || '0.1.0'
  });
}
