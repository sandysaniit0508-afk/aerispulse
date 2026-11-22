import { NextRequest, NextResponse } from 'next/server';
import { TelemetryRequestSchema } from '@/domain/schemas';
import { TelemetryService } from '@/services/telemetry-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawCityId = searchParams.get('cityId') || 'delhi-ncr';
    const rawLat = searchParams.get('lat') || '28.6139';
    const rawLon = searchParams.get('lon') || '77.2090';
    const cityName = searchParams.get('cityName') || 'Delhi NCR';
    const refresh = searchParams.get('refresh') === 'true';

    const parseResult = TelemetryRequestSchema.safeParse({
      cityId: rawCityId,
      lat: rawLat,
      lon: rawLon,
    });

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid coordinate or city parameters', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { cityId, lat, lon } = parseResult.data;
    const telemetry = await TelemetryService.getTelemetry(
      cityId,
      cityName,
      lat,
      lon,
      refresh
    );

    return NextResponse.json(telemetry, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Telemetry retrieval failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
