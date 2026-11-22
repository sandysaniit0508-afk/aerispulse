import { NextRequest, NextResponse } from 'next/server';
import { ActionPlanRequestSchema } from '@/domain/schemas';
import { GeminiService } from '@/services/gemini-service';
import { globalRateLimiter } from '@/services/rate-limiter';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const rateLimit = globalRateLimiter.check(ip);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: 'Too many requests. Rate limit exceeded.',
        resetTimeMs: rateLimit.resetTimeMs,
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(rateLimit.resetTimeMs / 1000).toString(),
        },
      }
    );
  }

  try {
    const rawBody: unknown = await request.json();
    const parseResult = ActionPlanRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid payload structure', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { cityName, aqi, pollutants, language } = parseResult.data;

    // Determine dominant pollutant
    let dominantKey: keyof typeof pollutants = 'pm25';
    let maxVal = pollutants.pm25;
    (Object.keys(pollutants) as Array<keyof typeof pollutants>).forEach((key) => {
      if (pollutants[key] > maxVal) {
        maxVal = pollutants[key];
        dominantKey = key;
      }
    });

    const plan = await GeminiService.generateActionPlan(
      cityName,
      aqi,
      dominantKey,
      pollutants,
      language
    );

    return NextResponse.json(plan, {
      status: 200,
      headers: {
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Action plan generation error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
