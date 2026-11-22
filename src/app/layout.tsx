import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AerisPulse | Urban Air Quality & Climate Health Intelligence System',
  description:
    'Live atmospheric telemetry, multi-source validation, deterministic epidemiological dosage models, and grounded GenAI action engines for megacities.',
  authors: [{ name: 'Staff DevOps & Full-Stack Architect' }],
  keywords: [
    'Air Quality',
    'AQI',
    'PM2.5',
    'Open-Meteo',
    'Climate Health',
    'Epidemiology',
    'GenAI',
    'Gemini',
    'Delhi',
    'Mumbai',
    'Bengaluru',
    'Chennai',
  ],
};

export const viewport: Viewport = {
  themeColor: '#0284c7',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col antialiased selection:bg-blue-500 selection:text-white">
        {/* WCAG 2.2 AA Skip Link for Keyboard Navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg focus:m-2"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
