// ─── Network & Contract Constants ───────────────────────────────────────────

export const NETWORK_PASSPHRASE = process.env.REACT_APP_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015";
export const HORIZON_URL = process.env.REACT_APP_HORIZON_URL || "https://horizon-testnet.stellar.org";
export const SOROBAN_RPC_URL = process.env.REACT_APP_SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org";

// ⚠️ Ensure the CONTRACT_ID is set in your Vercel/Netlify environment variables
export const CONTRACT_ID = process.env.REACT_APP_CONTRACT_ID || "";

// ─── Wallet Types ───────────────────────────────────────────────────────────

export const WALLET_TYPES = {
  FREIGHTER: "freighter",
  XBULL: "xbull",
  MANUAL: "manual",
};

// ─── Error Types ────────────────────────────────────────────────────────────

export const ERROR_TYPES = {
  WALLET_NOT_FOUND: "WALLET_NOT_FOUND",
  TX_REJECTED: "TX_REJECTED",
  INSUFFICIENT_BALANCE: "INSUFFICIENT_BALANCE",
  INVALID_ADDRESS: "INVALID_ADDRESS",
  CONTRACT_ERROR: "CONTRACT_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
};

export const ERROR_MESSAGES = {
  [ERROR_TYPES.WALLET_NOT_FOUND]:
    "No compatible wallet found. Please install Freighter or xBull browser extension.",
  [ERROR_TYPES.TX_REJECTED]:
    "Transaction was rejected. You declined the signing request in your wallet.",
  [ERROR_TYPES.INSUFFICIENT_BALANCE]:
    "Insufficient XLM balance to complete this transaction.",
  [ERROR_TYPES.INVALID_ADDRESS]:
    "Invalid Stellar address. Public keys must start with 'G' and be 56 characters.",
  [ERROR_TYPES.CONTRACT_ERROR]:
    "Smart contract call failed. The contract may not be deployed or is unreachable.",
  [ERROR_TYPES.NETWORK_ERROR]:
    "Network error. Unable to reach the Stellar testnet. Please try again.",
};

// ─── Transaction Statuses ───────────────────────────────────────────────────

export const TX_STATUS = {
  IDLE: "idle",
  BUILDING: "building",
  SIGNING: "signing",
  SUBMITTING: "submitting",
  CONFIRMING: "confirming",
  SUCCESS: "success",
  FAILED: "failed",
};
