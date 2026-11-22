/**
 * Visual styling and formatting utilities for atmospheric telemetry widgets.
 */

export interface AqiColorStyle {
  bg: string;
  text: string;
  badge: string;
}

export function getAqiColor(aqi: number): AqiColorStyle {
  if (aqi <= 50) return { bg: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', badge: 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800' };
  if (aqi <= 100) return { bg: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300', badge: 'bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-800' };
  if (aqi <= 150) return { bg: 'bg-orange-500', text: 'text-orange-700 dark:text-orange-300', badge: 'bg-orange-100 dark:bg-orange-950/80 border-orange-300 dark:border-orange-800' };
  if (aqi <= 200) return { bg: 'bg-red-500', text: 'text-red-700 dark:text-red-300', badge: 'bg-red-100 dark:bg-red-950/80 border-red-300 dark:border-red-800' };
  if (aqi <= 300) return { bg: 'bg-purple-600', text: 'text-purple-700 dark:text-purple-300', badge: 'bg-purple-100 dark:bg-purple-950/80 border-purple-300 dark:border-purple-800' };
  return { bg: 'bg-rose-900', text: 'text-rose-700 dark:text-rose-300', badge: 'bg-rose-100 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800' };
}
