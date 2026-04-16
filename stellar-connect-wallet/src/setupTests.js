// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// ─── Mock localStorage ─────────────────────────────────────────────────────

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// ─── Mock @stellar/freighter-api ────────────────────────────────────────────

jest.mock('@stellar/freighter-api', () => ({
  isConnected: jest.fn().mockResolvedValue({ isConnected: false }),
  isAllowed: jest.fn().mockResolvedValue({ isAllowed: false }),
  requestAccess: jest.fn().mockResolvedValue({ address: '', error: 'mocked' }),
  getAddress: jest.fn().mockResolvedValue({ address: '', error: 'mocked' }),
  signTransaction: jest.fn().mockResolvedValue({ signedTxXdr: '', error: 'mocked' }),
}));

// ─── Mock lucide-react (return simple span elements) ────────────────────────

jest.mock('lucide-react', () => {
  const React = require('react');
  const icons = [
    'Wallet', 'LogOut', 'Send', 'AlertCircle', 'CheckCircle2', 'Clock',
    'Plus', 'Trash2', 'FileText', 'Activity', 'RefreshCw', 'ExternalLink',
    'ShieldCheck', 'Zap', 'XCircle', 'ChevronDown', 'Loader2', 'Sun', 'Moon',
  ];
  const mocked = {};
  icons.forEach((name) => {
    mocked[name] = React.forwardRef((props, ref) =>
      React.createElement('span', { ref, 'data-testid': `icon-${name}`, ...props })
    );
    mocked[name].displayName = name;
  });
  return mocked;
});

// ─── Mock @stellar/stellar-sdk (minimal) ────────────────────────────────────

jest.mock('@stellar/stellar-sdk', () => ({
  TransactionBuilder: { fromXDR: jest.fn() },
  Networks: { TESTNET: 'Test SDF Network ; September 2015' },
  Operation: { payment: jest.fn() },
  Asset: { native: jest.fn() },
  Horizon: { Server: jest.fn().mockImplementation(() => ({ loadAccount: jest.fn() })) },
  Address: jest.fn(),
  Contract: jest.fn(),
  nativeToScVal: jest.fn(),
  scValToNative: jest.fn(),
  xdr: {},
  rpc: {
    Server: jest.fn().mockImplementation(() => ({})),
    Api: { isSimulationError: jest.fn() },
    assembleTransaction: jest.fn(),
  },
}));
