import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PresetSelector } from '../components/PresetSelector';
import { METRO_PRESETS } from '../domain/presets';

describe('PresetSelector Component Interactions', () => {
  it('renders all 4 metro presets', () => {
    render(
      <PresetSelector
        selectedPreset={METRO_PRESETS[0]!}
        onSelectPreset={() => {}}
        language="en"
      />
    );

    expect(screen.getByText('Delhi NCR')).toBeInTheDocument();
    expect(screen.getByText('Mumbai Coastal')).toBeInTheDocument();
    expect(screen.getByText('Bengaluru Corridor')).toBeInTheDocument();
    expect(screen.getByText('Chennai Industrial')).toBeInTheDocument();
  });

  it('triggers onSelectPreset callback when a preset button is clicked', () => {
    const handleSelect = vi.fn();
    render(
      <PresetSelector
        selectedPreset={METRO_PRESETS[0]!}
        onSelectPreset={handleSelect}
        language="en"
      />
    );

    const mumbaiButton = screen.getByRole('tab', { name: /Mumbai Coastal/i });
    fireEvent.click(mumbaiButton);

    expect(handleSelect).toHaveBeenCalledWith(METRO_PRESETS[1]);
  });

  it('renders localized Tamil names when language is ta', () => {
    render(
      <PresetSelector
        selectedPreset={METRO_PRESETS[0]!}
        onSelectPreset={() => {}}
        language="ta"
      />
    );

    expect(screen.getByText('டெல்லி (NCR)')).toBeInTheDocument();
    expect(screen.getByText('மும்பை கடலோரம்')).toBeInTheDocument();
    expect(screen.getByText('சென்னை தொழில்துறை மையம்')).toBeInTheDocument();
  });

  it('renders localized Hindi names when language is hi', () => {
    render(
      <PresetSelector
        selectedPreset={METRO_PRESETS[0]!}
        onSelectPreset={() => {}}
        language="hi"
      />
    );

    expect(screen.getByText('दिल्ली एनसीआर')).toBeInTheDocument();
    expect(screen.getByText('मुंबई तटीय')).toBeInTheDocument();
    expect(screen.getByText('चेन्नई औद्योगिक क्षेत्र')).toBeInTheDocument();
  });

  it('sets aria-selected="true" on currently active preset', () => {
    render(
      <PresetSelector
        selectedPreset={METRO_PRESETS[2]!} // Bengaluru
        onSelectPreset={() => {}}
        language="en"
      />
    );

    const blrTab = screen.getByRole('tab', { name: /Bengaluru Corridor/i });
    expect(blrTab).toHaveAttribute('aria-selected', 'true');

    const delhiTab = screen.getByRole('tab', { name: /Delhi NCR/i });
    expect(delhiTab).toHaveAttribute('aria-selected', 'false');
  });

  it('displays state and microclimate tags', () => {
    render(
      <PresetSelector
        selectedPreset={METRO_PRESETS[0]!}
        onSelectPreset={() => {}}
        language="en"
      />
    );

    expect(screen.getByText('Delhi')).toBeInTheDocument();
    expect(screen.getByText('Maharashtra')).toBeInTheDocument();
    expect(screen.getByText('Karnataka')).toBeInTheDocument();
    expect(screen.getByText('Tamil Nadu')).toBeInTheDocument();
  });
});
