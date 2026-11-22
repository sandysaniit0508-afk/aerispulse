'use client';

import React from 'react';
import { TelemetryData, SupportedLanguage } from '@/domain/types';
import { TRANSLATIONS } from '@/domain/i18n';
import { Activity, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { getAqiColor } from './telemetry-utils';
import { PollutantGrid } from './PollutantGrid';

interface TelemetryCardProps {
  telemetry: TelemetryData | null;
  isLoading: boolean;
  language: SupportedLanguage;
}

export const TelemetryCard: React.FC<TelemetryCardProps> = ({
  telemetry,
  isLoading,
  language,
}) => {
  const t = TRANSLATIONS[language];

  if (isLoading || !telemetry) {
    return (
      <div
        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs animate-pulse"
        aria-busy="true"
        aria-label="Loading atmospheric telemetry"
      >
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
          <div className="h-32 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
          <div className="h-32 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
        </div>
      </div>
    );
  }

  const aqiStyle = getAqiColor(telemetry.usAqi);
  const isDiscrepant = telemetry.validationStatus !== 'VERIFIED';

  return (
    <section
      aria-labelledby="telemetry-heading"
      aria-live="polite"
      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <div className="flex items-center space-x-2.5">
          <Activity className="w-5 h-5 text-cyan-500" aria-hidden="true" />
          <h2 id="telemetry-heading" className="text-lg font-bold text-slate-900 dark:text-white">
            {t.liveTelemetry} — {telemetry.cityName}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          {/* Confidence Badge */}
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {t.confidenceScore}: {telemetry.confidenceScore}%
          </span>
          {/* Validation Status Badge */}
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
              isDiscrepant
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
            }`}
          >
            {isDiscrepant ? (
              <AlertTriangle className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
            )}
            {telemetry.validationStatus}
          </span>
        </div>
      </div>

      {/* Discrepancy Alert Banner */}
      {isDiscrepant && (
        <div
          role="alert"
          className="mb-5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start space-x-3 text-amber-900 dark:text-amber-200 text-xs sm:text-sm"
        >
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <strong className="font-semibold">{t.discrepancyAlert}: </strong>
            <span>{t.discrepancyDesc}</span>
          </div>
        </div>
      )}

      {/* Main KPI Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* US AQI Gauge */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {t.aqiStatus} (US EPA)
          </span>
          <div className="flex items-baseline space-x-2 my-2">
            <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
              {telemetry.usAqi}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md border text-slate-900 dark:text-white uppercase tracking-tight" style={{ borderColor: 'currentColor' }}>
              {telemetry.category}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full ${aqiStyle.bg} transition-all duration-500`}
              style={{ width: `${Math.min(100, (telemetry.usAqi / 400) * 100)}%` }}
            />
          </div>
        </div>

        {/* Dominant Pollutant */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {t.dominantPollutant}
          </span>
          <div className="my-2">
            <span className="text-2xl font-bold uppercase text-slate-900 dark:text-white">
              {telemetry.dominantPollutant}
            </span>
            <span className="block text-sm text-slate-600 dark:text-slate-400 font-mono mt-0.5">
              {telemetry.pollutants[telemetry.dominantPollutant]} µg/m³
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Primary Driver of Air Quality Index
          </span>
        </div>

        {/* European AQI */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            European CAQI (CAMS)
          </span>
          <div className="my-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">
              {telemetry.europeanAqi}
            </span>
            <span className="text-xs text-slate-500 ml-1">/ 100 max</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Copernicus Atmosphere Benchmark
          </span>
        </div>

        {/* Validation Source */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Ground Truth Cross-Ref
          </span>
          <div className="my-2">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block truncate">
              {telemetry.source.split('+')[0]}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5 font-mono">
              Lat: {telemetry.latitude.toFixed(2)}° | Lon: {telemetry.longitude.toFixed(2)}°
            </span>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Active Multi-Station Synthesis
          </span>
        </div>
      </div>

      {/* Detailed Pollutant Grid */}
      <PollutantGrid pollutants={telemetry.pollutants} />
    </section>
  );
};
