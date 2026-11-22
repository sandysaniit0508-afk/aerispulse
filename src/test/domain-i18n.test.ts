import { describe, it, expect } from 'vitest';
import { TRANSLATIONS } from '../domain/i18n';
import { SupportedLanguage } from '../domain/types';

describe('Domain Localization (i18n)', () => {
  const languages: SupportedLanguage[] = ['en', 'ta', 'hi'];

  it('provides translations for all supported languages', () => {
    languages.forEach((lang) => {
      expect(TRANSLATIONS[lang]).toBeDefined();
    });
  });

  it('guarantees identical keys across English, Tamil, and Hindi', () => {
    const enKeys = Object.keys(TRANSLATIONS.en).sort();
    const taKeys = Object.keys(TRANSLATIONS.ta).sort();
    const hiKeys = Object.keys(TRANSLATIONS.hi).sort();

    expect(taKeys).toEqual(enKeys);
    expect(hiKeys).toEqual(enKeys);
  });

  it('ensures no empty translation strings in English', () => {
    Object.entries(TRANSLATIONS.en).forEach(([key, val]) => {
      expect(val.trim().length, `Empty key: ${key}`).toBeGreaterThan(0);
    });
  });

  it('ensures no empty translation strings in Tamil', () => {
    Object.entries(TRANSLATIONS.ta).forEach(([key, val]) => {
      expect(val.trim().length, `Empty key: ${key}`).toBeGreaterThan(0);
    });
  });

  it('ensures no empty translation strings in Hindi', () => {
    Object.entries(TRANSLATIONS.hi).forEach(([key, val]) => {
      expect(val.trim().length, `Empty key: ${key}`).toBeGreaterThan(0);
    });
  });

  it('includes key translations for all major components', () => {
    expect(TRANSLATIONS.en.appTitle).toBe('AerisPulse');
    expect(TRANSLATIONS.ta.appTitle).toContain('ஏரிஸ்பல்ஸ்');
    expect(TRANSLATIONS.hi.appTitle).toContain('एरिसपल्स');
  });
});
