import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WhatIfSimulator } from '../components/WhatIfSimulator';

describe('WhatIfSimulator Interactions & State Transitions', () => {
  it('toggles commute transit modes', () => {
    render(<WhatIfSimulator ambientPm25={100} language="en" />);

    const metroBtn = screen.getByRole('button', { name: /Metro Rail \/ Electric Bus/i });
    fireEvent.click(metroBtn);

    const cycleBtn = screen.getByRole('button', { name: /Bicycle \/ Walk/i });
    fireEvent.click(cycleBtn);

    const bikeBtn = screen.getByRole('button', { name: /Two-Wheeler \/ Scooter/i });
    fireEvent.click(bikeBtn);

    const carBtn = screen.getByRole('button', { name: /ICE Car/i });
    fireEvent.click(carBtn);
  });

  it('adjusts commute distance slider', () => {
    render(<WhatIfSimulator ambientPm25={100} language="en" />);

    const distanceSlider = screen.getByLabelText(/Round-Trip Commute Distance/i);
    fireEvent.change(distanceSlider, { target: { value: '35' } });

    expect(screen.getByText('35 km')).toBeInTheDocument();
  });

  it('selects surgical and N95 masks', () => {
    render(<WhatIfSimulator ambientPm25={100} language="en" />);

    const n95Btn = screen.getByRole('button', { name: /N95 \/ FFP2 Respirator/i });
    fireEvent.click(n95Btn);

    const clothBtn = screen.getByRole('button', { name: /Surgical \/ Cloth/i });
    fireEvent.click(clothBtn);

    const noneBtn = screen.getByRole('button', { name: 'None' });
    fireEvent.click(noneBtn);
  });

  it('toggles HEPA air purifier on and off', () => {
    render(<WhatIfSimulator ambientPm25={100} language="en" />);

    const hepaSwitch = screen.getByRole('switch', { name: /Indoor True HEPA Air Purifier Active/i });
    expect(hepaSwitch).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(hepaSwitch);
    expect(hepaSwitch).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(hepaSwitch);
    expect(hepaSwitch).toHaveAttribute('aria-checked', 'false');
  });

  it('adjusts outdoor exercise hours slider', () => {
    render(<WhatIfSimulator ambientPm25={100} language="en" />);

    const hoursSlider = screen.getByLabelText(/Outdoor High-Ventilation Exercise/i);
    fireEvent.change(hoursSlider, { target: { value: '3' } });

    expect(screen.getByText('3 hrs')).toBeInTheDocument();
  });
});
