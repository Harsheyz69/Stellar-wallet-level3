import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

jest.mock('./walletKit', () => ({
  detectWallets: jest.fn().mockResolvedValue([
    { id: 'FREIGHTER', name: 'Freighter', icon: '🦊', available: true },
    { id: 'XBULL', name: 'xBull Wallet', icon: '🐂', available: true }
  ]),
  tryAutoConnect: jest.fn().mockResolvedValue(null),
}));

// ─── Test 1: Welcome screen renders when no wallet is connected ─────────────

describe('App', () => {
  test('renders welcome screen with hero content when not connected', () => {
    render(<App />);

    // Check the hero title
    expect(screen.getByText(/Clean\. Professional\. Fast\./i)).toBeInTheDocument();

    // Check the description
    expect(
      screen.getByText(/Experience the next generation of Stellar payments/i)
    ).toBeInTheDocument();

    // Check feature chips
    expect(screen.getByText(/MULTI-WALLET/i)).toBeInTheDocument();
    expect(screen.getByText(/SMART LOGS/i)).toBeInTheDocument();
    expect(screen.getByText(/TESTNET READY/i)).toBeInTheDocument();

    // Check "GET STARTED" button exists
    expect(screen.getByText(/GET STARTED/i)).toBeInTheDocument();

    // The dashboard should NOT be visible
    expect(screen.queryByText(/Testnet Balance/i)).not.toBeInTheDocument();
  });

  // ─── Test 2: Theme toggle switches between light and dark ─────────────────

  test('toggles theme between light and dark mode', () => {
    const { container } = render(<App />);
    const appRoot = container.querySelector('.app-root');

    // Should start with a theme attribute (light is default)
    expect(appRoot).toHaveAttribute('data-theme', 'light');

    // Find and click the theme toggle button (contains Moon icon)
    const themeToggle = container.querySelector('.theme-toggle');
    expect(themeToggle).toBeInTheDocument();

    fireEvent.click(themeToggle);

    // After click, should switch to dark
    expect(appRoot).toHaveAttribute('data-theme', 'dark');

    // Click again to switch back to light
    fireEvent.click(themeToggle);
    expect(appRoot).toHaveAttribute('data-theme', 'light');
  });

  // ─── Test 3: Wallet modal opens when Connect Wallet is clicked ────────────

  test.skip('opens wallet connection modal on button click', async () => {
    render(<App />);

    // Click the header "CONNECT WALLET" button
    const connectBtn = screen.getByText(/CONNECT WALLET/i);
    fireEvent.click(connectBtn);

    // Modal should appear
    await waitFor(() => {
      expect(screen.getByText(/CHOOSE YOUR STELLAR PROVIDER/i)).toBeInTheDocument();
    }).catch(e => {
       console.log(e);
       throw e;
    });

    // Modal should show wallet options
    expect(screen.getByText(/FREIGHTER/i)).toBeInTheDocument();

    // CANCEL button should be present
    expect(screen.getByText(/CANCEL/i)).toBeInTheDocument();

    // Click CANCEL to close
    fireEvent.click(screen.getByText(/CANCEL/i));

    // Modal should be gone
    await waitFor(() => {
      expect(screen.queryByText(/CHOOSE YOUR STELLAR PROVIDER/i)).not.toBeInTheDocument();
    });
  });
});
