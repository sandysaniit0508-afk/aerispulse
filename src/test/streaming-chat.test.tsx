import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StreamingChat } from '../components/StreamingChat';
import { TelemetryData } from '../domain/types';

describe('StreamingChat Component', () => {
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

  it('renders initial assistant greeting', () => {
    render(<StreamingChat telemetry={mockTelemetry} language="en" />);
    expect(
      screen.getByText(/Hello! I am your AerisPulse real-time atmospheric health assistant/i)
    ).toBeInTheDocument();
  });

  it('renders Tamil greeting when language is ta', () => {
    render(<StreamingChat telemetry={mockTelemetry} language="ta" />);
    expect(
      screen.getByText(/வணக்கம்! நான் உங்கள் ஏரிஸ்பல்ஸ்/i)
    ).toBeInTheDocument();
  });

  it('renders Hindi greeting when language is hi', () => {
    render(<StreamingChat telemetry={mockTelemetry} language="hi" />);
    expect(
      screen.getByText(/नमस्ते! मैं आपका एरिसपल्स/i)
    ).toBeInTheDocument();
  });

  it('allows user to type into input field', () => {
    render(<StreamingChat telemetry={mockTelemetry} language="en" />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Should I wear a mask today?' } });
    expect(input.value).toBe('Should I wear a mask today?');
  });

  it('displays quick prompt suggestions', () => {
    render(<StreamingChat telemetry={mockTelemetry} language="en" />);
    expect(
      screen.getByRole('button', { name: /Is it safe to jog outside right now\?/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Which mask grade should I wear\?/i })
    ).toBeInTheDocument();
  });
});
