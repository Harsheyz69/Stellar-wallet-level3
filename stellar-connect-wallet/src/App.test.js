import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

jest.mock('./walletKit', () => ({
  detectWallets: jest.fn().mockResolvedValue([
    { id: 'FREIGHTER', name: 'Freighter', icon: '🦊', available: true },
    { id: 'XBULL', name: 'xBull Wallet', icon: '🐂', available: true }
  ]),
  tryAutoConnect: jest.fn().mockResolvedValue(null),
  connectWallet: jest.fn(),
  disconnectWallet: jest.fn(),
  getActiveWallet: jest.fn().mockReturnValue(null),
  getConnectedAddress: jest.fn().mockReturnValue(""),
}));

jest.mock('./contractClient', () => ({
  fetchBalance: jest.fn().mockResolvedValue("100"),
  sendPayment: jest.fn(),
  recordPaymentOnContract: jest.fn(),
  isValidStellarAddress: jest.fn().mockReturnValue(true),
  getPayments: jest.fn().mockResolvedValue([]),
  getTransactionHistory: jest.fn().mockResolvedValue([]),
}));

describe('App', () => {
  test('renders welcome screen', () => {
    render(<App />);
    expect(screen.getByText(/Clean\. Professional\. Fast\./i)).toBeInTheDocument();
  });

  test('toggles theme', () => {
    const { container } = render(<App />);
    const appRoot = container.querySelector('.app-root');
    const themeToggle = container.querySelector('.theme-toggle');
    fireEvent.click(themeToggle);
    expect(appRoot).toHaveAttribute('data-theme', 'dark');
  });

  // Simplified modal test - check if button exists and responds
  test('connect button exists', () => {
    render(<App />);
    const connectBtn = screen.getByText(/CONNECT WALLET/i);
    expect(connectBtn).toBeInTheDocument();
    expect(connectBtn).not.toBeDisabled();
  });
});
