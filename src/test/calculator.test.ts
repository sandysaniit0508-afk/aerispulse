import { describe, it, expect } from 'vitest';
import {
  calculateSubIndex,
  getAirQualityCategory,
  calculateCompositeAqi,
  calculateInhaledDosage,
  calculateCREI,
  calculateRelativeRiskIncrease,
  calculateCommuteCarbon,
  calculateHealthSavings,
  calculateSimulation,
  generateMetrics,
} from '../services/calculator';
import { PollutantReadings, SimulatorInputs } from '../domain/types';

describe('Calculator Service: Mathematical & Epidemiological Engine', () => {
  const dummyBreakpoints = [
    { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50 },
    { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
    { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
    { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
    { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
    { cLow: 250.5, cHigh: 500.4, iLow: 301, iHigh: 500 },
  ];

  describe('calculateSubIndex', () => {
    it('returns 0 for zero or negative concentrations', () => {
      expect(calculateSubIndex(0, dummyBreakpoints)).toBe(0);
      expect(calculateSubIndex(-5, dummyBreakpoints)).toBe(0);
    });

    it('interpolates within first breakpoint band', () => {
      const aqi = calculateSubIndex(6.0, dummyBreakpoints);
      expect(aqi).toBe(25);
    });

    it('interpolates at exact boundary values', () => {
      expect(calculateSubIndex(12.0, dummyBreakpoints)).toBe(50);
      expect(calculateSubIndex(12.1, dummyBreakpoints)).toBe(51);
      expect(calculateSubIndex(35.4, dummyBreakpoints)).toBe(100);
      expect(calculateSubIndex(55.4, dummyBreakpoints)).toBe(150);
      expect(calculateSubIndex(150.4, dummyBreakpoints)).toBe(200);
      expect(calculateSubIndex(250.4, dummyBreakpoints)).toBe(300);
      expect(calculateSubIndex(500.4, dummyBreakpoints)).toBe(500);
    });

    it('handles values exceeding the highest breakpoint', () => {
      const aqi = calculateSubIndex(600, dummyBreakpoints);
      expect(aqi).toBe(500);
    });

    it('handles empty breakpoints gracefully', () => {
      expect(calculateSubIndex(50, [])).toBe(500);
    });

    it('interpolates precisely for sub-index values in middle breakpoints', () => {
      expect(calculateSubIndex(23.75, dummyBreakpoints)).toBeGreaterThan(70);
      expect(calculateSubIndex(45.45, dummyBreakpoints)).toBeGreaterThan(120);
      expect(calculateSubIndex(100.0, dummyBreakpoints)).toBeGreaterThan(170);
      expect(calculateSubIndex(200.0, dummyBreakpoints)).toBeGreaterThan(240);
    });

    it('handles negative or zero input gracefully across custom ranges', () => {
      expect(calculateSubIndex(-0.01, dummyBreakpoints)).toBe(0);
      expect(calculateSubIndex(-100, dummyBreakpoints)).toBe(0);
    });

    it('handles single breakpoint array', () => {
      const single = [{ cLow: 0, cHigh: 100, iLow: 0, iHigh: 50 }];
      expect(calculateSubIndex(50, single)).toBe(25);
      expect(calculateSubIndex(150, single)).toBe(75);
    });

    it('handles values at the very top of scale (500.4)', () => {
      expect(calculateSubIndex(500.4, dummyBreakpoints)).toBe(500);
    });

    it('handles exact midpoints of each breakpoint bracket', () => {
      // Bracket 0: 0 - 12 (mid = 6) -> 25
      expect(calculateSubIndex(6.0, dummyBreakpoints)).toBe(25);
      // Bracket 1: 12.1 - 35.4 (mid = 23.75) -> 76
      expect(calculateSubIndex(23.75, dummyBreakpoints)).toBe(76);
      // Bracket 2: 35.5 - 55.4 (mid = 45.45) -> 126
      expect(calculateSubIndex(45.45, dummyBreakpoints)).toBe(126);
    });

    it('handles extreme outlier concentrations up to 2000 µg/m³', () => {
      expect(calculateSubIndex(2000, dummyBreakpoints)).toBe(500);
    });
  });

  describe('getAirQualityCategory', () => {
    it('returns Good for AQI 0 - 50', () => {
      expect(getAirQualityCategory(0)).toBe('Good');
      expect(getAirQualityCategory(50)).toBe('Good');
    });

    it('returns Moderate for AQI 51 - 100', () => {
      expect(getAirQualityCategory(51)).toBe('Moderate');
      expect(getAirQualityCategory(100)).toBe('Moderate');
    });

    it('returns Unhealthy for Sensitive Groups for AQI 101 - 150', () => {
      expect(getAirQualityCategory(101)).toBe('Unhealthy for Sensitive Groups');
      expect(getAirQualityCategory(150)).toBe('Unhealthy for Sensitive Groups');
    });

    it('returns Unhealthy for AQI 151 - 200', () => {
      expect(getAirQualityCategory(151)).toBe('Unhealthy');
      expect(getAirQualityCategory(200)).toBe('Unhealthy');
    });

    it('returns Very Unhealthy for AQI 201 - 300', () => {
      expect(getAirQualityCategory(201)).toBe('Very Unhealthy');
      expect(getAirQualityCategory(300)).toBe('Very Unhealthy');
    });

    it('returns Hazardous for AQI > 300', () => {
      expect(getAirQualityCategory(301)).toBe('Hazardous');
      expect(getAirQualityCategory(450)).toBe('Hazardous');
    });
  });

  describe('calculateCompositeAqi', () => {
    it('computes composite AQI when PM2.5 is dominant', () => {
      const pollutants: PollutantReadings = {
        pm25: 160.0, // High PM2.5 (AQI > 200)
        pm10: 50.0,
        no2: 20.0,
        so2: 10.0,
        o3: 30.0,
        co: 400.0,
      };

      const result = calculateCompositeAqi(pollutants);
      expect(result.dominantPollutant).toBe('pm25');
      expect(result.aqi).toBeGreaterThan(200);
      expect(result.subIndices.pm25).toBe(result.aqi);
    });

    it('computes composite AQI when PM10 is dominant', () => {
      const pollutants: PollutantReadings = {
        pm25: 10.0,
        pm10: 380.0, // Very High PM10
        no2: 20.0,
        so2: 10.0,
        o3: 20.0,
        co: 300.0,
      };

      const result = calculateCompositeAqi(pollutants);
      expect(result.dominantPollutant).toBe('pm10');
      expect(result.aqi).toBeGreaterThanOrEqual(201);
    });

    it('computes composite AQI when Ozone (O3) is dominant', () => {
      const pollutants: PollutantReadings = {
        pm25: 5.0,
        pm10: 20.0,
        no2: 15.0,
        so2: 5.0,
        o3: 150.0, // High Ozone
        co: 200.0,
      };

      const result = calculateCompositeAqi(pollutants);
      expect(result.dominantPollutant).toBe('o3');
      expect(result.aqi).toBeGreaterThan(150);
    });

    it('computes composite AQI when NO2 is dominant', () => {
      const pollutants: PollutantReadings = {
        pm25: 5.0,
        pm10: 20.0,
        no2: 400.0, // High NO2
        so2: 5.0,
        o3: 20.0,
        co: 200.0,
      };

      const result = calculateCompositeAqi(pollutants);
      expect(result.dominantPollutant).toBe('no2');
      expect(result.aqi).toBeGreaterThan(150);
    });

    it('computes composite AQI when SO2 is dominant', () => {
      const pollutants: PollutantReadings = {
        pm25: 5.0,
        pm10: 20.0,
        no2: 10.0,
        so2: 250.0, // High SO2
        o3: 20.0,
        co: 200.0,
      };

      const result = calculateCompositeAqi(pollutants);
      expect(result.dominantPollutant).toBe('so2');
      expect(result.aqi).toBeGreaterThan(150);
    });
  });

  describe('calculateInhaledDosage', () => {
    it('calculates dosage with zero hours outdoor', () => {
      const dosage = calculateInhaledDosage(100, 0, 0, 0.15);
      // 100 * (1 - 0.15) * 0.55 * 24 = 85 * 0.55 * 24 = 1122
      expect(dosage).toBe(1122);
    });

    it('clamps outdoor hours between 0 and 24', () => {
      const normal = calculateInhaledDosage(50, 24, 0, 0);
      const excessive = calculateInhaledDosage(50, 30, 0, 0);
      expect(excessive).toBe(normal);
    });

    it('reduces dosage significantly with N95 mask (95% efficiency)', () => {
      const withoutMask = calculateInhaledDosage(100, 4, 0.0, 0.15);
      const withN95 = calculateInhaledDosage(100, 4, 0.95, 0.15);
      expect(withN95).toBeLessThan(withoutMask);
    });

    it('reduces dosage with HEPA filtration indoors', () => {
      const withoutHepa = calculateInhaledDosage(100, 2, 0, 0.15);
      const withHepa = calculateInhaledDosage(100, 2, 0, 0.85);
      expect(withHepa).toBeLessThan(withoutHepa);
    });
  });

  describe('calculateCREI', () => {
    it('returns 0 for clean conditions', () => {
      expect(calculateCREI(0, 0)).toBe(0);
    });

    it('scales proportionally with PM2.5 and NO2', () => {
      const crei = calculateCREI(150, 100);
      // (150/300)*70 + (100/200)*30 = 35 + 15 = 50
      expect(crei).toBe(50);
    });

    it('caps at maximum 100', () => {
      expect(calculateCREI(500, 500)).toBe(100);
    });
  });

  describe('calculateRelativeRiskIncrease', () => {
    it('returns 0 for values below counterfactual (5 µg/m³)', () => {
      expect(calculateRelativeRiskIncrease(4.5)).toBe(0);
      expect(calculateRelativeRiskIncrease(5.0)).toBe(0);
    });

    it('returns positive risk increase above counterfactual', () => {
      const risk = calculateRelativeRiskIncrease(55.0);
      expect(risk).toBeGreaterThan(0);
    });
  });

  describe('calculateCommuteCarbon', () => {
    it('calculates carbon for car commute', () => {
      const carbon = calculateCommuteCarbon('car', 20);
      expect(carbon.baselineCarKg).toBe(3.84);
      expect(carbon.actualKg).toBe(3.84);
      expect(carbon.savedKg).toBe(0);
    });

    it('calculates carbon savings for metro commute', () => {
      const carbon = calculateCommuteCarbon('metro', 20);
      expect(carbon.baselineCarKg).toBe(3.84);
      expect(carbon.actualKg).toBe(0.56);
      expect(carbon.savedKg).toBe(3.28);
    });

    it('calculates 100% savings for bicycle commute', () => {
      const carbon = calculateCommuteCarbon('bicycle', 10);
      expect(carbon.actualKg).toBe(0);
      expect(carbon.savedKg).toBe(carbon.baselineCarKg);
    });

    it('calculates carbon for two-wheeler', () => {
      const carbon = calculateCommuteCarbon('twoWheeler', 10);
      expect(carbon.actualKg).toBe(1.03);
      expect(carbon.savedKg).toBe(0.89);
    });
  });

  describe('calculateHealthSavings', () => {
    it('returns 0 for 0% reduction', () => {
      const savings = calculateHealthSavings(0);
      expect(savings.monthlyInr).toBe(0);
      expect(savings.monthlyUsd).toBe(0);
    });

    it('scales linearly with percentage reduction', () => {
      const savings50 = calculateHealthSavings(50);
      const savings100 = calculateHealthSavings(100);
      expect(savings100.monthlyInr).toBe(2200);
      expect(savings50.monthlyInr).toBe(1100);
      expect(savings100.monthlyUsd).toBeGreaterThan(20);
    });
  });

  describe('calculateSimulation', () => {
    const baseInputs: SimulatorInputs = {
      commuteMode: 'car',
      commuteDistanceKm: 15,
      maskGrade: 'none',
      hepaFilterEnabled: false,
      outdoorExerciseHours: 1,
    };

    it('computes simulation with zero protection', () => {
      const sim = calculateSimulation(baseInputs, 100);
      expect(sim.dailyInhaledUg).toBe(sim.baselineInhaledUg);
      expect(sim.inhaledReductionPercent).toBe(0);
      expect(sim.dailyCarbonSavedKg).toBe(0);
      expect(sim.healthSafetyScore).toBe(10);
    });

    it('computes simulation with maximum protection (N95, HEPA, Metro)', () => {
      const maxInputs: SimulatorInputs = {
        commuteMode: 'metro',
        commuteDistanceKm: 20,
        maskGrade: 'n95',
        hepaFilterEnabled: true,
        outdoorExerciseHours: 0.5,
      };

      const sim = calculateSimulation(maxInputs, 150);
      expect(sim.inhaledReductionPercent).toBeGreaterThan(70);
      expect(sim.dailyCarbonSavedKg).toBeGreaterThan(3);
      expect(sim.monthlySavingsInr).toBeGreaterThan(1500);
      expect(sim.healthSafetyScore).toBeGreaterThanOrEqual(90);
    });

    it('handles zero ambient pollution safely', () => {
      const sim = calculateSimulation(baseInputs, 0);
      expect(sim.dailyInhaledUg).toBe(0);
      expect(sim.inhaledReductionPercent).toBe(0);
    });

    it('computes simulation with cloth mask and bicycle commute', () => {
      const clothBike: SimulatorInputs = {
        commuteMode: 'bicycle',
        commuteDistanceKm: 10,
        maskGrade: 'cloth',
        hepaFilterEnabled: false,
        outdoorExerciseHours: 2,
      };
      const sim = calculateSimulation(clothBike, 80);
      expect(sim.dailyCarbonSavedKg).toBe(1.92);
      expect(sim.inhaledReductionPercent).toBeGreaterThan(0);
      expect(sim.healthSafetyScore).toBeGreaterThan(10);
    });

    it('computes simulation with two-wheeler and HEPA on', () => {
      const twoWheelerHepa: SimulatorInputs = {
        commuteMode: 'twoWheeler',
        commuteDistanceKm: 12,
        maskGrade: 'none',
        hepaFilterEnabled: true,
        outdoorExerciseHours: 0,
      };
      const sim = calculateSimulation(twoWheelerHepa, 120);
      expect(sim.inhaledReductionPercent).toBeGreaterThan(60);
      expect(sim.dailyCarbonSavedKg).toBe(1.06);
    });

    it('handles zero commute distance', () => {
      const zeroCommute: SimulatorInputs = {
        ...baseInputs,
        commuteDistanceKm: 0,
      };
      const sim = calculateSimulation(zeroCommute, 100);
      expect(sim.dailyCarbonSavedKg).toBe(0);
    });

    it('handles maximum exercise hours', () => {
      const highExercise: SimulatorInputs = {
        ...baseInputs,
        outdoorExerciseHours: 8,
      };
      const sim = calculateSimulation(highExercise, 100);
      expect(sim.dailyInhaledUg).toBeGreaterThan(0);
    });
  });

  describe('generateMetrics', () => {
    it('generates complete metrics object from pollutant readings', () => {
      const pollutants: PollutantReadings = {
        pm25: 90.0,
        pm10: 160.0,
        no2: 45.0,
        so2: 15.0,
        o3: 35.0,
        co: 800.0,
      };

      const metrics = generateMetrics(pollutants);
      expect(metrics.inhaledDosageUg).toBeGreaterThan(0);
      expect(metrics.chronicExposureIndex).toBeGreaterThan(0);
      expect(metrics.relativeRiskIncreasePercent).toBeGreaterThan(0);
      expect(metrics.commuteCarbonKg).toBeGreaterThan(0);
      expect(metrics.monthlyHealthSavingsInr).toBeGreaterThan(0);
      expect(metrics.cleanAirEquivalenceDays).toBeGreaterThan(0);
    });
  });
});
