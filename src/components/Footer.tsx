'use client';

import React from 'react';
import { SupportedLanguage } from '@/domain/types';
import { TRANSLATIONS } from '@/domain/i18n';
import { BookOpen, CheckCircle, ShieldCheck } from 'lucide-react';

interface FooterProps {
  language: SupportedLanguage;
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  const t = TRANSLATIONS[language];

  return (
    <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xs py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                AerisPulse — Peer-Reviewed Climate & Atmospheric Health System
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Deterministic calculations benchmarked against EPA 454/B-18-007, WHO AQG 2021 &amp; GEMM PNAS 2018.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <a
              href="#methodology"
              onClick={(e) => {
                e.preventDefault();
                alert(
                  'Methodology formulation citations:\n\n1. EPA 454/B-18-007 (Piecewise AQI interpolation)\n2. ICRP Pub 66 (Human Respiratory Tract Dosimetry)\n3. Burnett et al. PNAS 2018 (GEMM Relative Risk Model)\n4. DEFRA 2023 (GHG Conversion Factor Protocol)\n5. WHO 2021 (Environmental Burden Guidelines)'
                );
              }}
              className="flex items-center space-x-1.5 text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.methodologyLink}</span>
            </a>

            <span className="inline-flex items-center space-x-1 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-md px-2 py-0.5">
              <CheckCircle className="w-3 h-3 text-emerald-500" aria-hidden="true" />
              <span className="font-mono text-[10px]">WCAG 2.2 AA Verified</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
