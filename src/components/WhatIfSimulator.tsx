'use client';

import React, { useState, useMemo } from 'react';
import { SimulatorInputs, SupportedLanguage } from '@/domain/types';
import { TRANSLATIONS } from '@/domain/i18n';
import { calculateSimulation } from '@/services/calculator';
import { Sliders } from 'lucide-react';
import { SimulatorControls } from './SimulatorControls';
import { SimulatorResults } from './SimulatorResults';

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
        <SimulatorControls
          inputs={inputs}
          setInputs={setInputs}
          language={language}
        />
        <SimulatorResults
          results={results}
          language={language}
        />
      </div>
    </section>
  );
};
