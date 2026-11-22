import React from 'react';
import { PollutantReadings } from '@/domain/types';

interface PollutantGridProps {
  pollutants: PollutantReadings;
}

export const PollutantGrid: React.FC<PollutantGridProps> = ({ pollutants }) => {
  const pollutantMatrix = [
    { label: 'PM2.5', value: pollutants.pm25, unit: 'µg/m³', desc: 'Fine Aerosol' },
    { label: 'PM10', value: pollutants.pm10, unit: 'µg/m³', desc: 'Coarse Dust' },
    { label: 'NO₂', value: pollutants.no2, unit: 'µg/m³', desc: 'Combustion Gas' },
    { label: 'SO₂', value: pollutants.so2, unit: 'µg/m³', desc: 'Industrial SOx' },
    { label: 'O₃', value: pollutants.o3, unit: 'µg/m³', desc: 'Surface Ozone' },
    { label: 'CO', value: pollutants.co, unit: 'µg/m³', desc: 'Carbon Monoxide' },
  ];

  return (
    <div>
      <h3 className="text-xs font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400 mb-2.5">
        Atmospheric Chemical Concentration Matrix (µg/m³)
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
        {pollutantMatrix.map((item) => (
          <div
            key={item.label}
            className="p-3 rounded-lg bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800"
          >
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {item.label}
            </span>
            <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
              {item.value}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
              {item.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
