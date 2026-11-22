import { NextRequest, NextResponse } from 'next/server';
import { ChatRequestSchema } from '@/domain/schemas';
import { GeminiService } from '@/services/gemini-service';
import { globalRateLimiter } from '@/services/rate-limiter';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
  const rateLimit = globalRateLimiter.check(ip);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: 'Too many queries. Rate limit active.',
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
    const parseResult = ChatRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid chat query format', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { message, cityName, aqi, dominantPollutant, pm25, language } = parseResult.data;

    const stream = await GeminiService.streamChat(
      message,
      cityName,
      aqi,
      dominantPollutant,
      pm25,
      language
    );

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Chat streaming failure';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
