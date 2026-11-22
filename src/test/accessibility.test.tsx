import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import axe from 'axe-core';
import { Header } from '../components/Header';
import { PresetSelector } from '../components/PresetSelector';
import { TelemetryCard } from '../components/TelemetryCard';
import { ActionPlanSection } from '../components/ActionPlanSection';
import { WhatIfSimulator } from '../components/WhatIfSimulator';
import { Footer } from '../components/Footer';
import { METRO_PRESETS } from '../domain/presets';
import { TelemetryData, ActionPlan } from '../domain/types';

describe('Component Accessibility & WCAG 2.2 AA Compliance (Axe-Core)', () => {
  it('Header component renders with 0 axe violations', async () => {
    const { container } = render(
      <Header
        language="en"
        onLanguageChange={() => {}}
        isDarkMode={false}
        onToggleDarkMode={() => {}}
        onRefresh={() => {}}
        isRefreshing={false}
      />
    );
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('PresetSelector component renders with 0 axe violations', async () => {
    const { container } = render(
      <PresetSelector
        selectedPreset={METRO_PRESETS[0]!}
        onSelectPreset={() => {}}
        language="en"
      />
    );
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('TelemetryCard component renders with 0 axe violations', async () => {
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

    const { container } = render(
      <TelemetryCard
        telemetry={mockTelemetry}
        isLoading={false}
        language="en"
      />
    );
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('ActionPlanSection component renders with 0 axe violations', async () => {
    const mockPlan: ActionPlan = {
      summary: 'High exposure risk across metropolitan areas.',
      compositeRiskLevel: 'HIGH',
      generatedAt: new Date().toISOString(),
      isFallback: true,
      modelUsed: 'AerisPulse Rules Engine',
      items: [
        {
          category: 'indoor',
          priority: 'critical',
          title: 'HEPA Active',
          action: 'Keep air purifiers running continuously.',
          impactMetric: '85% PM2.5 abatement',
        },
        {
          category: 'commute',
          priority: 'high',
          title: 'N95 Respirator',
          action: 'Wear tightly fitted N95 respirator during commute.',
          impactMetric: '95% filtration',
        },
        {
          category: 'health',
          priority: 'moderate',
          title: 'Indoor Workout',
          action: 'Shift outdoor workouts to indoor environments.',
          impactMetric: 'Zero deep lung particulate deposition',
        },
        {
          category: 'community',
          priority: 'low',
          title: 'Civic Reporting',
          action: 'Report local open waste incineration on civic portal.',
          impactMetric: 'Local basin protection',
        },
      ],
    };

    const { container } = render(
      <ActionPlanSection
        plan={mockPlan}
        isGenerating={false}
        onGeneratePlan={() => {}}
        language="en"
      />
    );
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('WhatIfSimulator component renders with 0 axe violations', async () => {
    const { container } = render(
      <WhatIfSimulator ambientPm25={95} language="en" />
    );
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  it('Footer component renders with 0 axe violations', async () => {
    const { container } = render(<Footer language="en" />);
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
