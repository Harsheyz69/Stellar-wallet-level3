# StellarPay - Payment Tracker Decentralized Application

![Stellar](https://img.shields.io/badge/Network-Stellar%20Testnet-blue)
![Soroban](https://img.shields.io/badge/Engine-Soroban-green)
![React](https://img.shields.io/badge/Frontend-React%2019-black)

StellarPay is a professional-grade decentralized application (dApp) developed for the Stellar network. It provides a seamless interface for connecting wallets, executing XLM payments, and recording transaction metadata on a Soroban smart contract. This application is designed specifically for the Stellar Testnet.

---

## Live Proof (Testnet)
- **Contract ID**: `[Configure in constants.js]` (uses local memory fallback if not provided)
- **Network Passphrase**: `Test SDF Network ; September 2015`
- **RPC URL**: `https://soroban-testnet.stellar.org`
- **Horizon URL**: `https://horizon-testnet.stellar.org`

---

## Screenshots
| Wallet Options |
| :---: |
| ![Wallet Options Screenshot](public/wallet-options.png) |

---

## Multi-Wallet Support
Powered by direct integrations and Stellar standards, StellarPay supports:
- **Freighter** (Recommended)
- **xBull**

---

## Features

| Feature | Description |
|---------|-------------|
| Multi-Wallet Support | Integration with Freighter and xBull browser extensions for secure wallet connection. |
| XLM Payments | Native XLM transfer capabilities to any valid Stellar Testnet destination. |
| Smart Contract Logging | On-chain recording of payment details using a custom Soroban smart contract. |
| Transaction Timeline | Visualized multi-step progress indicator tracking Building, Signing, Submitting, and Confirming stages. |
| Skeleton Loaders | Shimmer-animated loading states for UI components to enhance user experience during data retrieval. |
| Caching Layer | Implementation of a Time-To-Live (TTL) based caching system to minimize redundant network requests. |
| Persistence | Caching of account balances in local storage for immediate display upon session restoration. |
| Unified Interface | Responsive glassmorphism design optimized for high-end aesthetics and professional usage. |
| Auto-Synchronization | Automated data polling every 15 seconds to ensure real-time balance and history updates. |

---

## Architecture

This application follows a modular architecture to separate concerns and ensure maintainability.

```text
+-------------------------------------------------------------+
|                        User Interface                       |
|  +------------------+  +------------------+  +-----------+  |
|  | Landing Section  |  | Dashboard Grid   |  | UI Modal  |  |
|  +---------+--------+  +---------+--------+  +-----+-----+  |
|            |                     |                 |        |
+------------|---------------------|-----------------|--------+
             |                     |                 |
+------------v---------------------v-----------------v--------+
|                      Wallet Kit Layer                       |
|    Unified Abstraction for Freighter and xBull Wallets      |
+----------------------------+--------------------------------+
                             |
+----------------------------v--------------------------------+
|                   Contract Client Engine                    |
|       SDK Integration for Balance, Payments, and History    |
|       [Integrated Cache Layer: In-memory + LocalStorage]    |
+----------------------------+--------------------------------+
                             |
+----------------------------v--------------------------------+
|                  External Connectivity                      |
|       Horizon API | Soroban RPC | Wallet Extensions         |
+-------------------------------------------------------------+
```

---

## Project Structure

```text
stellar-connect-wallet/
├── public/
│   └── wallet-options.png      # Screenshot documentation of wallet selection
├── contracts/
│   └── payment-tracker/
│       └── src/lib.rs           # Soroban smart contract source (Rust)
├── src/
│   ├── App.js                   # Main application logic and state management
│   ├── App.css                  # Core styling, animations, and typography
│   ├── walletKit.js             # Multi-wallet integration logic
│   ├── contractClient.js        # Stellar SDK interaction layer
│   ├── cache.js                 # Implementation of the TTL caching utility
│   ├── constants.js             # Configuration for networks, IDs, and error codes
│   ├── App.test.js              # Functional tests for UI components
│   ├── cache.test.js            # Unit tests for the caching mechanism
│   ├── contractClient.test.js   # Validation tests for client utilities
│   └── setupTests.js            # Mock configurations for environmental isolation
├── config-overrides.js          # Webpack polyfills for Node.js module compatibility
├── package.json                 # Project dependencies and script definitions
└── README.md                    # Project documentation
```

---

## Getting Started

### Prerequisites

* Node.js version 18.0.0 or higher
* A supported browser extension:
    * [Freighter](https://www.freighter.app/)
    * [xBull](https://xbull.app/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Harsheyz69/Stellar-wallet-level3.git
   cd Stellar-wallet-level3/stellar-connect-wallet
   ```

2. Install the necessary dependencies:
   ```bash
   npm install
   ```

3. Initialize the development environment:
   ```bash
   npm start
   ```

The application will be accessible at http://localhost:3000.

---

## Testing Framework & Verified Results

The repository includes a comprehensive test suite consisting of 8 automated tests designed to verify component rendering, state transitions, and utility correctness.

To run the complete React test suite:
```bash
npm test -- --watchAll=false
```

### Verified Test Results

```text
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

### Running Smart Contract Tests

To verify the Soroban logic, navigate to the contract directory and run Rust unit tests:

```bash
cd contracts/payment-tracker
cargo test
```

---

## Caching Strategy

To optimize performance and reduce latency, StellarPay utilizes a custom caching implementation located in `cache.js`.

| Data Category | Retention (TTL) | Persistence Method|
|---------------|-----------------|-------------------|
| Account Balance | 10 Seconds | In-memory + LocalStorage |
| Smart Contract Logs | 15 Seconds | In-memory |
| Transaction History | 15 Seconds | In-memory |

The cache is automatically invalidated upon the successful completion of any transaction to ensure data integrity.

---

## Loading UX

Professional loading states are implemented using three specific strategies:
1. **Skeleton Components**: Shimmer-animated placeholders that occupy the space of future content during asynchronous loads.
2. **Indeterminate Progress**: A specialized progress bar that communicates transaction status during signing and submission.
3. **Spinner Overlays**: Visual feedback provided during wallet connection attempts to signal pending status to the user.

---

## Smart Contract Details

The application interacts with a Soroban-based smart contract (`contracts/payment-tracker/src/lib.rs`) that provides the following functionality:
* `record_payment`: Stores sender, recipient, amount, and memo on-chain.
* `get_payment_count`: Retrieves the total volume of payments recorded.
* `get_payments_by_sender`: Indexes all payment IDs associated with a specific address.

If no specific Contract ID is provided in `constants.js`, the application defaults to a localized demonstration mode.

---

## Technology Stack

* **React 19**: Core UI library
* **Stellar SDK**: Blockchain interaction
* **Soroban SDK**: Smart contract execution
* **Javascript (ES6+) / Rust**: Programming logic
* **Vanilla CSS**: Advanced styling and animations
* **Jest**: Testing framework

---

## License

This project is licensed under the MIT License.
