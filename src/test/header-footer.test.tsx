import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

describe('Header & Footer Component Interactions', () => {
  it('triggers language change on button click', () => {
    const handleLanguageChange = vi.fn();
    render(
      <Header
        language="en"
        onLanguageChange={handleLanguageChange}
        isDarkMode={false}
        onToggleDarkMode={() => {}}
        onRefresh={() => {}}
        isRefreshing={false}
      />
    );

    const taButton = screen.getByRole('button', { name: 'தமிழ்' });
    fireEvent.click(taButton);
    expect(handleLanguageChange).toHaveBeenCalledWith('ta');

    const hiButton = screen.getByRole('button', { name: 'हिंदी' });
    fireEvent.click(hiButton);
    expect(handleLanguageChange).toHaveBeenCalledWith('hi');
  });

  it('triggers dark mode toggle and refresh callbacks', () => {
    const handleDarkMode = vi.fn();
    const handleRefresh = vi.fn();

    render(
      <Header
        language="en"
        onLanguageChange={() => {}}
        isDarkMode={true}
        onToggleDarkMode={handleDarkMode}
        onRefresh={handleRefresh}
        isRefreshing={false}
      />
    );

    const themeBtn = screen.getByLabelText(/Switch to light mode/i);
    fireEvent.click(themeBtn);
    expect(handleDarkMode).toHaveBeenCalled();

    const refreshBtn = screen.getByLabelText(/Refresh Live Feeds/i);
    fireEvent.click(refreshBtn);
    expect(handleRefresh).toHaveBeenCalled();
  });

  it('triggers methodology alert in footer', () => {
    const alertMock = vi.fn();
    window.alert = alertMock;

    render(<Footer language="en" />);
    const link = screen.getByText(/Peer-Reviewed Formulation Methodology/i);
    fireEvent.click(link);
    expect(alertMock).toHaveBeenCalled();
  });
});
