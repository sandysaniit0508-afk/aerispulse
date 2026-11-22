import { describe, it, expect } from 'vitest';
import { FallbackActionPlanService } from '../services/fallback-service';
import { PollutantReadings } from '../domain/types';

describe('FallbackActionPlanService: Deterministic Rules Engine', () => {
  const severePollutants: PollutantReadings = {
    pm25: 220.0,
    pm10: 340.0,
    no2: 65.0,
    so2: 22.0,
    o3: 40.0,
    co: 1500.0,
  };

  const goodPollutants: PollutantReadings = {
    pm25: 15.0,
    pm10: 30.0,
    no2: 12.0,
    so2: 5.0,
    o3: 20.0,
    co: 300.0,
  };

  it('generates an EXTREME risk plan for AQI > 300 in English', () => {
    const plan = FallbackActionPlanService.generatePlan(
      'Delhi NCR',
      340,
      'pm25',
      severePollutants,
      'en'
    );

    expect(plan.compositeRiskLevel).toBe('EXTREME');
    expect(plan.isFallback).toBe(true);
    expect(plan.items.length).toBeGreaterThanOrEqual(4);
    expect(plan.summary).toContain('Delhi NCR');
    expect(plan.summary).toContain('PM25');

    const indoorItem = plan.items.find((i) => i.category === 'indoor');
    expect(indoorItem).toBeDefined();
    expect(indoorItem?.priority).toBe('critical');
    expect(indoorItem?.impactMetric).toContain('85%');
  });

  it('generates a LOW risk plan for good air quality', () => {
    const plan = FallbackActionPlanService.generatePlan(
      'Bengaluru',
      45,
      'pm25',
      goodPollutants,
      'en'
    );

    expect(plan.compositeRiskLevel).toBe('LOW');
    const indoorItem = plan.items.find((i) => i.category === 'indoor');
    expect(indoorItem?.priority).toBe('moderate');
  });

  it('generates a HIGH risk plan for AQI between 151 and 300', () => {
    const plan = FallbackActionPlanService.generatePlan(
      'Mumbai',
      180,
      'pm10',
      severePollutants,
      'en'
    );

    expect(plan.compositeRiskLevel).toBe('HIGH');
  });

  it('generates a MODERATE risk plan for AQI between 101 and 150', () => {
    const plan = FallbackActionPlanService.generatePlan(
      'Chennai',
      120,
      'so2',
      severePollutants,
      'en'
    );

    expect(plan.compositeRiskLevel).toBe('MODERATE');
  });

  it('generates full Tamil localization', () => {
    const plan = FallbackActionPlanService.generatePlan(
      'சென்னை',
      240,
      'pm25',
      severePollutants,
      'ta'
    );

    expect(plan.items.length).toBeGreaterThanOrEqual(4);
    const indoorItem = plan.items.find((i) => i.category === 'indoor');
    expect(indoorItem?.title).toContain('HEPA');
    expect(indoorItem?.impactMetric).toContain('85%');
  });

  it('generates full Hindi localization', () => {
    const plan = FallbackActionPlanService.generatePlan(
      'दिल्ली',
      240,
      'pm25',
      severePollutants,
      'hi'
    );

    expect(plan.items.length).toBeGreaterThanOrEqual(4);
    const indoorItem = plan.items.find((i) => i.category === 'indoor');
    expect(indoorItem?.title).toContain('HEPA');
    expect(indoorItem?.impactMetric).toContain('85%');
  });

  it('generates plan when ozone (o3) is dominant pollutant', () => {
    const plan = FallbackActionPlanService.generatePlan(
      'Bengaluru Corridor',
      160,
      'o3',
      { ...severePollutants, o3: 140 },
      'en'
    );
    expect(plan.summary).toContain('O3');
    expect(plan.items.some((i) => i.category === 'health')).toBe(true);
  });

  it('generates plan when SO2 is dominant pollutant', () => {
    const plan = FallbackActionPlanService.generatePlan(
      'Chennai Industrial',
      190,
      'so2',
      { ...severePollutants, so2: 120 },
      'en'
    );
    expect(plan.summary).toContain('SO2');
    expect(plan.items.some((i) => i.category === 'commute')).toBe(true);
  });

  it('generates plan when PM10 is dominant pollutant', () => {
    const plan = FallbackActionPlanService.generatePlan(
      'Mumbai Coastal',
      210,
      'pm10',
      { ...severePollutants, pm10: 380 },
      'en'
    );
    expect(plan.summary).toContain('PM10');
  });

  it('always includes community reporting directive', () => {
    const plan = FallbackActionPlanService.generatePlan(
      'Delhi NCR',
      80,
      'pm25',
      goodPollutants,
      'en'
    );
    const commItem = plan.items.find((i) => i.category === 'community');
    expect(commItem).toBeDefined();
    expect(commItem?.title).toContain('Waste Combustion');
  });

  it('generates Tamil community reporting item correctly', () => {
    const plan = FallbackActionPlanService.generatePlan(
      'சென்னை',
      80,
      'pm25',
      goodPollutants,
      'ta'
    );
    const commItem = plan.items.find((i) => i.category === 'community');
    expect(commItem?.title).toContain('குப்பை எரிப்பதை');
  });

  it('generates Hindi community reporting item correctly', () => {
    const plan = FallbackActionPlanService.generatePlan(
      'दिल्ली',
      80,
      'pm25',
      goodPollutants,
      'hi'
    );
    const commItem = plan.items.find((i) => i.category === 'community');
    expect(commItem?.title).toContain('कचरा जलाने');
  });
});
