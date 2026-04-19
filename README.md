# StellarPay -- Payment and Governance dApp Ecosystem

![Stellar](https://img.shields.io/badge/Network-Stellar%20Testnet-blue)
![Soroban](https://img.shields.io/badge/Engine-Soroban-green)
![React](https://img.shields.io/badge/Frontend-React%2019-black)

StellarPay is a decentralized application ecosystem built on the Stellar Testnet using Soroban smart contracts. It delivers secure payment tracking, administrative governance, and treasury management through a multi-contract architecture with a professional React dashboard.

- **Network Passphrase**: `Test SDF Network ; September 2015`
- **RPC URL**: `https://soroban-testnet.stellar.org`

---

## Screenshots

| Multi-Wallet Interface | Smart Contract Test Results |
| :---: | :---: |
| ![Multi-Wallet Interface](public/multi%20wallet.png) | ![Test Results](contracts/test%20cases.png) |

---

## Multi-Wallet Support

Powered by the **Stellar Wallets Kit** (`@creit.tech/stellar-wallets-kit`), StellarPay supports multiple browser wallet extensions:

- **Freighter** (Default)
- **xBull**
- **Albedo**
- **LOBSTR**

---

## Smart Contract Architecture

This project implements a multi-contract architecture following Level 3 professional standards.

### 1. Payment Tracker (`contracts/payment-tracker`)

Records and indexes transaction metadata on-chain using Soroban persistent storage.

- `record_payment` -- Stores sender, recipient, amount, memo, and timestamp. Requires sender authorization via `require_auth`.
- `get_payment` / `get_payment_count` -- Query individual records or the global counter.
- `get_payments_by_sender` -- Returns indexed payment IDs per user for efficient lookup.
- **Validation**: Rejects zero/negative amounts and memos exceeding 100 characters.
- **Events**: Publishes `pay_rec` events for real-time tracking.

### 2. Voting Contract (`contracts/voting`)

Governs proposal approvals through administrative authorization.

- `init` -- Registers a single admin. Panics on re-initialization.
- `approve_payment` -- Admin-only function to mark a proposal as approved. Protected by `require_auth` and admin identity verification.
- `is_approved` -- Public query to check proposal status.

### 3. Treasury Contract (`contracts/treasury`)

Manages assets and executes validated payments through cross-contract calls.

- **Cross-Contract Integration**: Calls the Voting Contract's `is_approved` to verify proposal status before any fund transfer.
- **SAC Token Integration**: Uses Stellar Asset Contract token transfers (`token::Client`) for secure fund distribution from the treasury balance.
- `execute_payment` -- Admin-authorized function that validates approval, then transfers tokens to the recipient.

---

## Authorization and Security

Every state-mutating function utilizes `require_auth` to ensure only the designated sender or administrator can execute sensitive operations. The Voting Contract enforces admin identity checks, and the Treasury Contract layers cross-contract approval verification on top of authorization.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Frontend | React 19, Tailwind CSS 3, Lucide Icons |
| Smart Contracts | Rust (Soroban SDK) |
| SDKs | `@stellar/stellar-sdk`, `@creit.tech/stellar-wallets-kit` |
| Wallet Support | Freighter, xBull, Albedo, LOBSTR |
| Caching | TTL-based in-memory store with LocalStorage persistence |
| Build Tooling | react-app-rewired, Webpack 5 (with Node.js polyfills) |

---

## Project Structure

```text
stellar-connect-wallet/
├── contracts/
│   ├── payment-tracker/      # Payment recording and indexing contract
│   │   └── src/lib.rs        # Contract logic and 10 unit tests
│   ├── voting/               # Governance and proposal approval contract
│   │   └── src/lib.rs        # Admin-protected approval logic and tests
│   ├── treasury/             # Cross-contract treasury with SAC integration
│   │   └── src/lib.rs        # Token transfers with voting verification and tests
│   └── Cargo.toml            # Workspace manifest
├── src/
│   ├── App.js                # Main React application component
│   ├── App.css               # Glassmorphism UI with dark/light theme
│   ├── walletKit.js          # Multi-wallet abstraction layer
│   ├── contractClient.js     # Soroban RPC and transaction logic
│   ├── cache.js              # TTL-based caching with localStorage fallback
│   ├── constants.js          # Network, wallet, and error constants
│   ├── App.test.js           # React component tests (3 tests)
│   ├── contractClient.test.js # Address validation tests (1 test)
│   └── cache.test.js         # Cache layer tests (4 tests)
├── public/
│   ├── multi wallet.png      # Multi-wallet interface screenshot
│   └── index.html            # Application entry point
├── config-overrides.js       # Webpack 5 polyfill configuration
├── package.json              # Dependencies and scripts
└── README.md                 # Project documentation
```

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Rust toolchain with the `wasm32-unknown-unknown` target
- [Stellar CLI](https://developers.stellar.org/docs/build/smart-contracts/getting-started/setup) (for contract deployment)
- A Stellar wallet browser extension (Freighter recommended)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Harsheyz69/Stellar-wallet-level3.git
   cd Stellar-wallet-level3/stellar-connect-wallet
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

### Building Smart Contracts

```bash
cd contracts
cargo build --target wasm32-unknown-unknown --release
```

---

## Verification

The repository includes a comprehensive test suite covering both blockchain and frontend layers.

### Rust Smart Contract Tests (10 Passed)

The Payment Tracker includes 10 unit tests covering core logic, validation, indexing, and edge cases. The Voting and Treasury contracts include additional tests for admin authorization, cross-contract calls, and SAC token transfers.

```bash
cd contracts/payment-tracker
cargo test
```

**Payment Tracker test cases**:
```
test test::test_record_payment_success ... ok
test test::test_invalid_amount_rejection ... ok
test test::test_memo_length_rejection ... ok
test test::test_initial_counter_zero ... ok
test test::test_counter_increment_on_multiple_records ... ok
test test::test_user_indexing_isolation ... ok
test test::test_get_payment_full_detail ... ok
test test::test_get_payment_non_existent ... ok
test test::test_multiple_payments_single_user ... ok
test test::test_large_amount_handling ... ok

test result: ok. 10 passed; 0 failed; 0 ignored
```

### React Frontend Tests (8 Passed)

Stabilized Jest environment with comprehensive wallet and contract client mocks.

```bash
npm test -- --watchAll=false
```

**Frontend test suites**:
- `App.test.js` -- Renders welcome screen, toggles theme, verifies connect button (3 tests)
- `contractClient.test.js` -- Stellar address validation with valid/invalid inputs (1 test)
- `cache.test.js` -- TTL store/retrieve, expiration, invalidation, constants export (4 tests)

---

## License

This project is open-source under the MIT License.
