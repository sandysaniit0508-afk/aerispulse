import { z } from 'zod';

export const PollutantReadingsSchema = z.object({
  pm25: z.number().min(0).max(1500),
  pm10: z.number().min(0).max(2000),
  no2: z.number().min(0).max(1000),
  so2: z.number().min(0).max(1000),
  o3: z.number().min(0).max(1000),
  co: z.number().min(0).max(50000),
});

export const ActionPlanItemSchema = z.object({
  category: z.enum(['indoor', 'commute', 'health', 'community']),
  priority: z.enum(['critical', 'high', 'moderate', 'low']),
  title: z.string().min(3).max(120),
  action: z.string().min(10).max(300),
  impactMetric: z.string().min(3).max(100),
});

export const ActionPlanSchema = z.object({
  summary: z.string().min(10).max(500),
  compositeRiskLevel: z.enum(['LOW', 'MODERATE', 'HIGH', 'EXTREME']),
  items: z.array(ActionPlanItemSchema).min(3).max(8),
});

export const TelemetryRequestSchema = z.object({
  cityId: z.string().min(1).max(50),
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

export const ActionPlanRequestSchema = z.object({
  cityId: z.string().min(1).max(50),
  cityName: z.string().min(1).max(100),
  aqi: z.number().min(0).max(1000),
  pollutants: PollutantReadingsSchema,
  language: z.enum(['en', 'ta', 'hi']).default('en'),
});

export const ChatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  cityName: z.string().min(1).max(100),
  aqi: z.number().min(0).max(1000),
  dominantPollutant: z.string().min(1).max(20),
  pm25: z.number().min(0).max(1500),
  language: z.enum(['en', 'ta', 'hi']).default('en'),
});

export const SimulatorInputSchema = z.object({
  commuteMode: z.enum(['car', 'twoWheeler', 'metro', 'bicycle']),
  commuteDistanceKm: z.number().min(0).max(200),
  maskGrade: z.enum(['none', 'cloth', 'n95']),
  hepaFilterEnabled: z.boolean(),
  outdoorExerciseHours: z.number().min(0).max(12),
});
