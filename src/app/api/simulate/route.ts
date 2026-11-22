import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SimulatorInputSchema } from '@/domain/schemas';
import { calculateSimulation } from '@/services/calculator';
import { globalRateLimiter } from '@/services/rate-limiter';

export const dynamic = 'force-dynamic';

const SimulateRequestSchema = z.object({
  inputs: SimulatorInputSchema,
  ambientPm25: z.number().min(0).max(1500),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const rateLimit = globalRateLimiter.check(ip);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  try {
    const rawBody: unknown = await request.json();
    const parseResult = SimulateRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid simulation parameters', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { inputs, ambientPm25 } = parseResult.data;
    const result = calculateSimulation(inputs, ambientPm25);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Simulation computation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
