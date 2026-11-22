import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Automatically clean up rendered DOM after each test
afterEach(() => {
  cleanup();
});

// Mock window.alert and scrollIntoView
if (typeof window !== 'undefined') {
  window.alert = () => {};
  window.HTMLElement.prototype.scrollIntoView = () => {};
}
