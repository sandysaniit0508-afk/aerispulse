'use client';

import React from 'react';
import { SimulatorOutputs, SupportedLanguage } from '@/domain/types';
import { TRANSLATIONS } from '@/domain/i18n';
import { Shield, Wind, Leaf, DollarSign, Heart } from 'lucide-react';

interface SimulatorResultsProps {
  results: SimulatorOutputs;
  language: SupportedLanguage;
}

export const SimulatorResults: React.FC<SimulatorResultsProps> = ({
  results,
  language,
}) => {
  const t = TRANSLATIONS[language];

  return (
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
  );
};
