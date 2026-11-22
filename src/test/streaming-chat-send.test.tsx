import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StreamingChat } from '../components/StreamingChat';
import { TelemetryData } from '../domain/types';

describe('StreamingChat handleSend Integration', () => {
  const mockTelemetry: TelemetryData = {
    cityId: 'delhi-ncr',
    cityName: 'Delhi NCR',
    latitude: 28.6139,
    longitude: 77.209,
    timestamp: new Date().toISOString(),
    pollutants: { pm25: 140, pm10: 220, no2: 50, so2: 15, o3: 35, co: 800 },
    usAqi: 210,
    europeanAqi: 85,
    category: 'Very Unhealthy',
    dominantPollutant: 'pm25',
    confidenceScore: 92,
    validationStatus: 'VERIFIED',
    source: 'Open-Meteo CAMS',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('sends user message and processes streaming chunks', async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"chunk":"Stay "}\n\n'));
        controller.enqueue(encoder.encode('data: {"chunk":"indoors."}\n\n'));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      body: stream,
    } as unknown as Response);

    render(<StreamingChat telemetry={mockTelemetry} language="en" />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'What should I do?' } });

    const sendBtn = screen.getByRole('button', { name: /Send/i });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByText(/Stay indoors./i)).toBeInTheDocument();
    });
  });

  it('handles chat stream network failure gracefully', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as unknown as Response);

    render(<StreamingChat telemetry={mockTelemetry} language="en" />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Test failure' } });

    const sendBtn = screen.getByRole('button', { name: /Send/i });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Apologies, a streaming connection error occurred/i)
      ).toBeInTheDocument();
    });
  });
});
