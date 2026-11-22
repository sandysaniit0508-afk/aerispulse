'use client';

import React, { useState, useMemo } from 'react';
import { SimulatorInputs, SupportedLanguage } from '@/domain/types';
import { TRANSLATIONS } from '@/domain/i18n';
import { calculateSimulation } from '@/services/calculator';
import { Sliders, Shield, Wind, Leaf, DollarSign, Heart } from 'lucide-react';

interface WhatIfSimulatorProps {
  ambientPm25: number;
  language: SupportedLanguage;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  ambientPm25,
  language,
}) => {
  const t = TRANSLATIONS[language];

  const [inputs, setInputs] = useState<SimulatorInputs>({
    commuteMode: 'car',
    commuteDistanceKm: 15,
    maskGrade: 'none',
    hepaFilterEnabled: false,
    outdoorExerciseHours: 1,
  });

  const results = useMemo(() => {
    return calculateSimulation(inputs, ambientPm25);
  }, [inputs, ambientPm25]);

  return (
    <section
      aria-labelledby="simulator-heading"
      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs"
    >
      <div className="flex items-center space-x-2.5 mb-5">
        <Sliders className="w-5 h-5 text-indigo-500" aria-hidden="true" />
        <div>
          <h2 id="simulator-heading" className="text-lg font-bold text-slate-900 dark:text-white">
            {t.simulatorTitle}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.simulatorSubtitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-6 space-y-4">
          {/* Commute Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {t.commuteMode}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'car', label: t.commuteCar },
                { id: 'twoWheeler', label: t.commuteBike },
                { id: 'metro', label: t.commuteMetro },
                { id: 'bicycle', label: t.commuteCycle },
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() =>
                    setInputs((prev) => ({
                      ...prev,
                      commuteMode: mode.id as SimulatorInputs['commuteMode'],
                    }))
                  }
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    inputs.commuteMode === mode.id
                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-500'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Commute Distance */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="commute-distance-slider" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t.distanceKm}
              </label>
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                {inputs.commuteDistanceKm} km
              </span>
            </div>
            <input
              id="commute-distance-slider"
              type="range"
              min="0"
              max="60"
              step="1"
              value={inputs.commuteDistanceKm}
              onChange={(e) =>
                setInputs((prev) => ({
                  ...prev,
                  commuteDistanceKm: Number(e.target.value),
                }))
              }
              aria-label={t.distanceKm}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Mask Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {t.maskType}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'none', label: t.maskNone },
                { id: 'cloth', label: t.maskCloth },
                { id: 'n95', label: t.maskN95 },
              ].map((mask) => (
                <button
                  key={mask.id}
                  type="button"
                  onClick={() =>
                    setInputs((prev) => ({
                      ...prev,
                      maskGrade: mask.id as SimulatorInputs['maskGrade'],
                    }))
                  }
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    inputs.maskGrade === mask.id
                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-500'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {mask.label}
                </button>
              ))}
            </div>
          </div>

          {/* HEPA Purifier Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {t.hepaPurifier}
            </span>
            <button
              type="button"
              role="switch"
              aria-label={t.hepaPurifier}
              aria-checked={inputs.hepaFilterEnabled}
              onClick={() =>
                setInputs((prev) => ({
                  ...prev,
                  hepaFilterEnabled: !prev.hepaFilterEnabled,
                }))
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                inputs.hepaFilterEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  inputs.hepaFilterEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Outdoor Exercise Hours */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="outdoor-hours-slider" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t.outdoorHours}
              </label>
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                {inputs.outdoorExerciseHours} hrs
              </span>
            </div>
            <input
              id="outdoor-hours-slider"
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={inputs.outdoorExerciseHours}
              onChange={(e) =>
                setInputs((prev) => ({
                  ...prev,
                  outdoorExerciseHours: Number(e.target.value),
                }))
              }
              aria-label={t.outdoorHours}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>

        {/* Live Animated Dynamic Outputs */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-3">
          {/* Daily Dosage Reduction Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wind className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.dailyDosage}
                </span>
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                -{results.inhaledReductionPercent}% {t.dosageReduction}
              </span>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {results.dailyInhaledUg}
              </span>
              <span className="text-xs text-slate-500">µg / day</span>
              <span className="text-xs text-slate-400 line-through ml-2">
                Baseline: {results.baselineInhaledUg} µg
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${results.inhaledReductionPercent}%` }}
              />
            </div>
          </div>

          {/* Metric Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Carbon Saved */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 mb-1">
                <Leaf className="w-4 h-4" aria-hidden="true" />
                <span className="text-xs font-semibold">{t.carbonAbated}</span>
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {results.dailyCarbonSavedKg} <span className="text-xs font-normal">kg CO₂/day</span>
              </div>
              <span className="text-[10px] text-slate-500">DEFRA Transport Factor</span>
            </div>

            {/* Health Savings */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400 mb-1">
                <DollarSign className="w-4 h-4" aria-hidden="true" />
                <span className="text-xs font-semibold">{t.costSaved}</span>
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                ₹{results.monthlySavingsInr} <span className="text-xs font-normal">/ mo</span>
              </div>
              <span className="text-[10px] text-slate-500">Outpatient & Sick Days</span>
            </div>
          </div>

          {/* Health Shield Score */}
          <div className="p-4 rounded-xl bg-slate-900 text-white dark:bg-slate-800 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                <Heart className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-300 block">
                  {t.healthScore}
                </span>
                <span className="text-xs text-slate-400">
                  Calculated Individual Defense Index
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-1.5">
              <Shield className="w-5 h-5 text-emerald-400" aria-hidden="true" />
              <span className="text-2xl font-black text-emerald-400">
                {results.healthSafetyScore}
              </span>
              <span className="text-xs text-slate-400">/100</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
