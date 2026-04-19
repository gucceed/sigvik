import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'sigvik-frontend',
      commit: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
      deployedAt:
        process.env.VERCEL_GIT_COMMIT_REF && process.env.VERCEL_GIT_COMMIT_SHA
          ? new Date().toISOString()
          : new Date().toISOString(),
      region: process.env.VERCEL_REGION || 'local',
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Content-Type': 'application/json',
      },
    },
  );
}
