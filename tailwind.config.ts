import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        aqi: {
          good: '#10B981',       // 0 - 50: Emerald Green
          moderate: '#F59E0B',   // 51 - 100: Amber
          unhealthySensitive: '#F97316', // 101 - 150: Orange
          unhealthy: '#EF4444',   // 151 - 200: Red
          veryUnhealthy: '#8B5CF6', // 201 - 300: Purple
          hazardous: '#881337',   // 301+: Maroon
        },
      },
    },
  },
  plugins: [],
};

export default config;
