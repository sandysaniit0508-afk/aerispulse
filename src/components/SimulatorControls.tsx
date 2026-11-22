'use client';

import React from 'react';
import { SimulatorInputs, SupportedLanguage } from '@/domain/types';
import { TRANSLATIONS } from '@/domain/i18n';

interface SimulatorControlsProps {
  inputs: SimulatorInputs;
  setInputs: React.Dispatch<React.SetStateAction<SimulatorInputs>>;
  language: SupportedLanguage;
}

export const SimulatorControls: React.FC<SimulatorControlsProps> = ({
  inputs,
  setInputs,
  language,
}) => {
  const t = TRANSLATIONS[language];

  return (
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
  );
};
