'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { METRO_PRESETS } from '@/domain/presets';
import { CityPreset, TelemetryData, ActionPlan, SupportedLanguage } from '@/domain/types';
import { Header } from '@/components/Header';
import { PresetSelector } from '@/components/PresetSelector';
import { TelemetryCard } from '@/components/TelemetryCard';
import { ActionPlanSection } from '@/components/ActionPlanSection';
import { WhatIfSimulator } from '@/components/WhatIfSimulator';
import { StreamingChat } from '@/components/StreamingChat';
import { Footer } from '@/components/Footer';

export default function Home() {
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<CityPreset>(METRO_PRESETS[0]!);

  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [isLoadingTelemetry, setIsLoadingTelemetry] = useState(true);

  const [plan, setPlan] = useState<ActionPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Sync dark mode class on document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Fetch telemetry for current preset
  const fetchTelemetry = useCallback(async (preset: CityPreset, forceRefresh = false) => {
    setIsLoadingTelemetry(true);
    try {
      const url = `/api/telemetry?cityId=${preset.id}&lat=${preset.latitude}&lon=${preset.longitude}&cityName=${encodeURIComponent(
        preset.name
      )}${forceRefresh ? '&refresh=true' : ''}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Telemetry fetch failed');
      const data = (await res.json()) as TelemetryData;
      setTelemetry(data);
    } catch {
      // Graceful fallback to static preset calibration if network fails
      setTelemetry(null);
    } finally {
      setIsLoadingTelemetry(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry(selectedPreset);
  }, [selectedPreset, fetchTelemetry]);

  // Generate action plan
  const handleGeneratePlan = async () => {
    if (!telemetry || isGeneratingPlan) return;
    setIsGeneratingPlan(true);

    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityId: telemetry.cityId,
          cityName: telemetry.cityName,
          aqi: telemetry.usAqi,
          pollutants: telemetry.pollutants,
          language,
        }),
      });

      if (!res.ok) throw new Error('Plan generation failed');
      const planData = (await res.json()) as ActionPlan;
      setPlan(planData);
    } catch {
      // In-flight error fallback
      setPlan(null);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header
        language={language}
        onLanguageChange={setLanguage}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        onRefresh={() => fetchTelemetry(selectedPreset, true)}
        isRefreshing={isLoadingTelemetry}
      />

      <main
        id="main-content"
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6"
      >
        {/* Preset Selector */}
        <PresetSelector
          selectedPreset={selectedPreset}
          onSelectPreset={(p) => {
            setSelectedPreset(p);
            setPlan(null); // Reset generated plan on city change
          }}
          language={language}
        />

        {/* Live Ground-Truth Telemetry & Multi-Source Cross-Ref */}
        <TelemetryCard
          telemetry={telemetry}
          isLoading={isLoadingTelemetry}
          language={language}
        />

        {/* Interactive What-If Lifestyle Simulator */}
        <WhatIfSimulator
          ambientPm25={telemetry?.pollutants.pm25 ?? 65}
          language={language}
        />

        {/* 2-Column Section: Structured Action Engine & Grounded Streaming Assistant */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <ActionPlanSection
              plan={plan}
              isGenerating={isGeneratingPlan}
              onGeneratePlan={handleGeneratePlan}
              language={language}
            />
          </div>

          <div className="lg:col-span-5">
            <StreamingChat
              telemetry={telemetry}
              language={language}
            />
          </div>
        </div>
      </main>

      <Footer language={language} />
    </div>
  );
}
