# ⚡ StellarPay — Payment Tracker DApp

A professional Stellar decentralized application for connecting wallets, sending XLM payments, and recording transactions on a Soroban smart contract — all on the Stellar Testnet.

![Wallet Options Screenshot](public/wallet-options.png)

---

## 🎯 Features

| Feature | Description |
|---------|-------------|
| **Multi-Wallet Support** | Connect via Freighter or xBull browser extensions |
| **XLM Payments** | Send native XLM to any Stellar testnet address |
| **Smart Contract Logging** | Record payments on a deployed Soroban smart contract |
| **Transaction Timeline** | Real-time progress indicators (Building → Signing → Submitting → Confirming → Done) |
| **Skeleton Loaders** | Shimmer loading states for balance card and history panels |
| **Caching Layer** | TTL-based in-memory + localStorage cache to reduce redundant API calls |
| **Dark / Light Theme** | Toggle between themes with persistent preference |
| **Transaction History** | View on-chain transaction history from Horizon |
| **Auto-Sync** | Polls for new data every 15 seconds |
| **Responsive Design** | Glassmorphism UI that works on desktop and mobile |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    App.js (UI)                       │
│  ┌──────────┐  ┌────────────┐  ┌────────────────┐  │
│  │ Welcome  │  │  Dashboard │  │  Wallet Modal  │  │
│  │  Screen  │  │   (Grid)   │  │                │  │
│  └──────────┘  └────────────┘  └────────────────┘  │
│        │              │               │             │
│        └──────────────┼───────────────┘             │
│                       │                             │
│  ┌────────────────────┼─────────────────────────┐   │
│  │            walletKit.js                      │   │
│  │  Freighter / xBull multi-wallet abstraction  │   │
│  └────────────────────┼─────────────────────────┘   │
│                       │                             │
│  ┌────────────────────┼─────────────────────────┐   │
│  │         contractClient.js                    │   │
│  │  Balance · Payments · Contract · History      │   │
│  │  └──── cache.js (TTL cache layer) ────┘      │   │
│  └────────────────────┼─────────────────────────┘   │
│                       │                             │
│  ┌────────────────────┼─────────────────────────┐   │
│  │           constants.js                       │   │
│  │  Network URLs · Contract ID · Error types    │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                        │
          ┌─────────────┼──────────────┐
          │             │              │
    ┌─────▼─────┐ ┌─────▼─────┐ ┌─────▼──────┐
    │ Horizon   │ │ Soroban   │ │ Freighter/ │
    │ Testnet   │ │ RPC       │ │ xBull API  │
    └───────────┘ └───────────┘ └────────────┘
```

---

## 📂 Project Structure

```
stellar-connect-wallet/
├── public/
│   └── wallet-options.png      # Wallet selection screenshot
├── contracts/
│   └── payment-tracker/
│       └── src/lib.rs           # Soroban smart contract (Rust)
├── src/
│   ├── App.js                   # Main React component (UI + state)
│   ├── App.css                  # Complete stylesheet (glassmorphism, skeletons)
│   ├── walletKit.js             # Multi-wallet abstraction (Freighter/xBull)
│   ├── contractClient.js        # Stellar SDK client (balance, payments, history)
│   ├── cache.js                 # TTL-based caching layer
│   ├── constants.js             # Network, contract, and error constants
│   ├── App.test.js              # UI component tests (3 tests)
│   ├── cache.test.js            # Cache layer tests (4 tests)
│   ├── contractClient.test.js   # Address validation test (1 test)
│   └── setupTests.js            # Jest mocks (Freighter, Stellar SDK, icons)
├── config-overrides.js          # Webpack polyfills for Stellar SDK
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9+
- A Stellar wallet browser extension:
  - [Freighter](https://www.freighter.app/) (recommended)
  - [xBull](https://xbull.app/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Harsheyz69/Stellar-wallet-level3.git
cd Stellar-wallet-level3/stellar-connect-wallet

# 2. Install dependencies
npm install

# 3. Start the development server
npm start
```

The app will open at `http://localhost:3000/`.

### Connecting Your Wallet

1. Install the Freighter browser extension
2. Switch Freighter to **Testnet** mode
3. Fund your account via the [Stellar Friendbot](https://laboratory.stellar.org/#account-creator?network=test)
4. Click **"Connect Wallet"** in the app and authorize the connection

---

## 🧪 Testing

The project includes **8 tests** across 3 test suites:

### Test Suites

| File | Tests | Description |
|------|-------|-------------|
| `App.test.js` | 3 | Welcome screen rendering, theme toggle, wallet modal |
| `cache.test.js` | 4 | Cache store/retrieve, TTL expiration, invalidation, constants |
| `contractClient.test.js` | 1 | Stellar address validation (valid, invalid, edge cases) |

### Running Tests

```bash
# Run all tests
npm test -- --watchAll=false

# Run with verbose output
npm test -- --watchAll=false --verbose

# Run a specific test file
npm test -- --watchAll=false cache.test.js
```

### Expected Output

```
PASS  src/cache.test.js
  Cache Layer
    ✓ stores and retrieves values within TTL
    ✓ returns null for expired entries
    ✓ invalidate removes specific keys
    ✓ exports cache keys and TTL constants

PASS  src/contractClient.test.js
  contractClient utilities
    ✓ isValidStellarAddress correctly validates addresses

PASS  src/App.test.js
  App
    ✓ renders welcome screen with hero content when not connected
    ✓ toggles theme between light and dark mode
    ✓ opens wallet connection modal on button click

Test Suites: 3 passed, 3 total
Tests:       8 passed, 8 total
```

---

## 📦 Caching Strategy

The app uses a custom TTL-based caching layer (`cache.js`) to minimize redundant API calls:

| Data | TTL | Persistence |
|------|-----|-------------|
| Account Balance | 10 seconds | localStorage (survives reload) |
| Contract Payments | 15 seconds | In-memory only |
| Transaction History | 15 seconds | In-memory only |

### How It Works

1. **Before each API call**, the cache is checked for a valid (non-expired) entry
2. **If cached data exists** and hasn't expired, it's returned immediately — no network request
3. **After a successful transaction**, all related cache entries are **invalidated** to force a fresh fetch
4. **Balance is persisted** to localStorage so it displays instantly on page reload

---

## ⏳ Loading States

The app implements three types of loading indicators:

1. **Skeleton Loaders** — Shimmer-animated placeholder cards for balance and history panels while data loads
2. **Transaction Timeline** — A 5-step progress indicator (Building → Signing → Submitting → Confirming → Done) with an animated progress bar
3. **Button Spinners** — Loading spinners on the Submit button during transaction processing

---

## 📜 Smart Contract

The Soroban smart contract (`contracts/payment-tracker/src/lib.rs`) provides:

- `record_payment(sender, recipient, amount, memo)` → Records a payment on-chain
- `get_payment(payment_id)` → Retrieves a payment by ID
- `get_payment_count()` → Returns total payments recorded
- `get_payments_by_sender(sender)` → Lists payment IDs for a sender

**Network**: Stellar Testnet  
**Fallback**: When no contract ID is configured, the app uses an in-memory local store for demo purposes.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| React 19 | Frontend framework |
| Stellar SDK 15 | Blockchain interaction |
| Freighter API | Wallet integration |
| Soroban | Smart contract platform |
| Jest + React Testing Library | Testing |
| CSS (Vanilla) | Glassmorphism styling + animations |
| react-app-rewired | Webpack polyfills for Node.js modules |

---

## 🔧 Build for Production

```bash
npm run build
```

The optimized build is output to the `build/` directory.

---

## 📝 License

MIT

---

## 🙏 Credits

- [Stellar Development Foundation](https://stellar.org/)
- [Freighter Wallet](https://freighter.app/)
- [Lucide Icons](https://lucide.dev/)
