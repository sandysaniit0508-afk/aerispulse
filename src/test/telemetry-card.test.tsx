import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TelemetryCard } from '../components/TelemetryCard';
import { TelemetryData } from '../domain/types';

describe('TelemetryCard Component', () => {
  const verifiedTelemetry: TelemetryData = {
    cityId: 'delhi-ncr',
    cityName: 'Delhi NCR',
    latitude: 28.6139,
    longitude: 77.209,
    timestamp: new Date().toISOString(),
    pollutants: { pm25: 185.4, pm10: 295.0, no2: 68.2, so2: 24.1, o3: 45.0, co: 1850 },
    usAqi: 236,
    europeanAqi: 82,
    category: 'Very Unhealthy',
    dominantPollutant: 'pm25',
    confidenceScore: 88,
    validationStatus: 'VERIFIED',
    source: 'Open-Meteo CAMS Model + Regulatory Monitor',
  };

  it('renders loading skeleton when isLoading is true', () => {
    render(
      <TelemetryCard telemetry={null} isLoading={true} language="en" />
    );
    expect(screen.getByLabelText(/Loading atmospheric telemetry/i)).toBeInTheDocument();
  });

  it('renders city name and AQI value correctly', () => {
    render(
      <TelemetryCard telemetry={verifiedTelemetry} isLoading={false} language="en" />
    );
    expect(screen.getByText(/Live Atmospheric Telemetry — Delhi NCR/i)).toBeInTheDocument();
    expect(screen.getByText('236')).toBeInTheDocument();
    expect(screen.getByText('Very Unhealthy')).toBeInTheDocument();
  });

  it('displays confidence score and VERIFIED status', () => {
    render(
      <TelemetryCard telemetry={verifiedTelemetry} isLoading={false} language="en" />
    );
    expect(screen.getByText(/Telemetry Confidence: 88%/i)).toBeInTheDocument();
    expect(screen.getByText('VERIFIED')).toBeInTheDocument();
  });

  it('renders discrepancy alert banner when validationStatus is DISCREPANCY_DETECTED', () => {
    const discrepantTelemetry: TelemetryData = {
      ...verifiedTelemetry,
      validationStatus: 'DISCREPANCY_DETECTED',
      confidenceScore: 65,
    };

    render(
      <TelemetryCard telemetry={discrepantTelemetry} isLoading={false} language="en" />
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Elevated Sensor Discrepancy Detected/i)).toBeInTheDocument();
  });

  it('renders individual chemical pollutant matrix with correct values', () => {
    render(
      <TelemetryCard telemetry={verifiedTelemetry} isLoading={false} language="en" />
    );
    expect(screen.getByText('185.4')).toBeInTheDocument(); // PM2.5
    expect(screen.getByText('295')).toBeInTheDocument();   // PM10
    expect(screen.getByText('68.2')).toBeInTheDocument();  // NO2
    expect(screen.getByText('24.1')).toBeInTheDocument();  // SO2
  });

  it('renders localized Tamil header when language is ta', () => {
    render(
      <TelemetryCard telemetry={verifiedTelemetry} isLoading={false} language="ta" />
    );
    expect(screen.getByText(/நேரலை வளிமண்டல அளவீடுகள் — Delhi NCR/i)).toBeInTheDocument();
  });
});
