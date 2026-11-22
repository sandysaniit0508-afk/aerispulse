import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    {
      status: 'UP',
      system: 'AerisPulse',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      services: {
        telemetryFeed: 'HEALTHY',
        validationEngine: 'HEALTHY',
        actionEngine: 'HEALTHY',
        streamingChat: 'HEALTHY',
      },
    },
    { status: 200 }
  );
}
