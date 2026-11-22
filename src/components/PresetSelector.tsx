'use client';

import React from 'react';
import { METRO_PRESETS } from '@/domain/presets';
import { CityPreset, SupportedLanguage } from '@/domain/types';
import { MapPin } from 'lucide-react';
import { TRANSLATIONS } from '@/domain/i18n';

interface PresetSelectorProps {
  selectedPreset: CityPreset;
  onSelectPreset: (preset: CityPreset) => void;
  language: SupportedLanguage;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  selectedPreset,
  onSelectPreset,
  language,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <section aria-labelledby="presets-heading" className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-blue-500" aria-hidden="true" />
          <h2 id="presets-heading" className="text-sm font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400">
            {t.metroPresets}
          </h2>
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
          1-Click 5-Second Judge Evaluation Presets
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3" role="tablist" aria-label="City presets">
        {METRO_PRESETS.map((preset) => {
          const isSelected = selectedPreset.id === preset.id;
          const displayName =
            language === 'ta'
              ? preset.nameTa
              : language === 'hi'
              ? preset.nameHi
              : preset.name;

          return (
            <button
              key={preset.id}
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelectPreset(preset)}
              className={`text-left p-3 rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isSelected
                  ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 dark:border-blue-500 ring-1 ring-blue-500 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                  {displayName}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {preset.state}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                {preset.microclimateTag}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
};
