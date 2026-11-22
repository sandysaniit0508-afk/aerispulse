'use client';

import React from 'react';
import { ActionPlan, SupportedLanguage } from '@/domain/types';
import { TRANSLATIONS } from '@/domain/i18n';
import { Sparkles, Home, Bike, HeartPulse, Users, Shield, Cpu } from 'lucide-react';

interface ActionPlanSectionProps {
  plan: ActionPlan | null;
  isGenerating: boolean;
  onGeneratePlan: () => void;
  language: SupportedLanguage;
}

export const ActionPlanSection: React.FC<ActionPlanSectionProps> = ({
  plan,
  isGenerating,
  onGeneratePlan,
  language,
}) => {
  const t = TRANSLATIONS[language];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'indoor':
        return <Home className="w-4 h-4 text-cyan-500" aria-hidden="true" />;
      case 'commute':
        return <Bike className="w-4 h-4 text-emerald-500" aria-hidden="true" />;
      case 'health':
        return <HeartPulse className="w-4 h-4 text-rose-500" aria-hidden="true" />;
      case 'community':
        return <Users className="w-4 h-4 text-amber-500" aria-hidden="true" />;
      default:
        return <Shield className="w-4 h-4 text-blue-500" aria-hidden="true" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 border-red-300 dark:border-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 border-orange-300 dark:border-orange-800';
      case 'moderate':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      default:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
    }
  };

  return (
    <section
      aria-labelledby="action-plan-heading"
      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center space-x-2.5">
          <Sparkles className="w-5 h-5 text-amber-500" aria-hidden="true" />
          <div>
            <h2 id="action-plan-heading" className="text-lg font-bold text-slate-900 dark:text-white">
              {t.actionEngine}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Grounded behavioral mitigation & clinical protocol synthesis
            </p>
          </div>
        </div>

        <button
          onClick={onGeneratePlan}
          disabled={isGenerating}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-sm rounded-xl shadow-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60 flex items-center space-x-2"
        >
          <Cpu className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} aria-hidden="true" />
          <span>{isGenerating ? t.generatingPlan : t.generatePlan}</span>
        </button>
      </div>

      {plan ? (
        <div className="space-y-4">
          {/* Summary Box */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Action Plan Executive Synthesis
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {plan.modelUsed}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
              {plan.summary}
            </p>
          </div>

          {/* Action Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {plan.items.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                        {getCategoryIcon(item.category)}
                      </div>
                      <span className="text-xs font-semibold capitalize text-slate-600 dark:text-slate-300">
                        {item.category}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getPriorityBadge(
                        item.priority
                      )}`}
                    >
                      {item.priority}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.action}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Impact Metric:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {item.impactMetric}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Click &quot;{t.generatePlan}&quot; to synthesize personalized mitigation directives.
          </p>
        </div>
      )}
    </section>
  );
};
