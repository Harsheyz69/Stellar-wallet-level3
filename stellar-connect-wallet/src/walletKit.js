/* eslint-disable no-throw-literal */
/**
 * StellarWalletsKit — Multi-wallet abstraction layer
 * Supports: Freighter, xBull, Albedo, Lobstr, etc.
 */

import {
  StellarWalletsKit,
  Networks
} from "@creit.tech/stellar-wallets-kit";

import { FreighterModule, FREIGHTER_ID } from "@creit.tech/stellar-wallets-kit/modules/freighter";
import { xBullModule, XBULL_ID } from "@creit.tech/stellar-wallets-kit/modules/xbull";
import { AlbedoModule, ALBEDO_ID } from "@creit.tech/stellar-wallets-kit/modules/albedo";
import { LobstrModule, LOBSTR_ID } from "@creit.tech/stellar-wallets-kit/modules/lobstr";

import { WALLET_TYPES, ERROR_TYPES, NETWORK_PASSPHRASE } from "./constants";

// ─── Internal State ─────────────────────────────────────────────────────────

let _activeWallet = null; 
let _address = null;

// Initialize the kit with all available modules using v2 Static Initialization
StellarWalletsKit.init({
  network: Networks.TESTNET,
  selectedWalletId: FREIGHTER_ID,
  modules: [
    new FreighterModule(),
    new xBullModule(),
    new AlbedoModule(),
    new LobstrModule()
  ],
});

// Map our internal wallet types to Kit IDs
const TYPE_TO_ID = {
  [WALLET_TYPES.FREIGHTER]: FREIGHTER_ID,
  [WALLET_TYPES.XBULL]: XBULL_ID,
  "albedo": ALBEDO_ID,
  "lobstr": LOBSTR_ID
};

const ID_TO_TYPE = Object.entries(TYPE_TO_ID).reduce((acc, [key, val]) => {
  acc[val] = key;
  return acc;
}, {});

// ─── Wallet Detection ───────────────────────────────────────────────────────

/** Returns which wallets are available in the browser. */
export async function detectWallets() {
  const supported = await StellarWalletsKit.refreshSupportedWallets();
  const uiWallets = [];

  const icons = {
    [FREIGHTER_ID]: "🦊",
    [XBULL_ID]: "🐂",
    [ALBEDO_ID]: "🌤️",
    [LOBSTR_ID]: "🦞"
  };

  const names = {
    [FREIGHTER_ID]: "Freighter",
    [XBULL_ID]: "xBull Wallet",
    [ALBEDO_ID]: "Albedo",
    [LOBSTR_ID]: "LOBSTR"
  };

  for (const module of supported) {
    if (icons[module.id]) {
        uiWallets.push({
            id: ID_TO_TYPE[module.id] || module.id.toLowerCase(),
            name: names[module.id] || module.name,
            icon: icons[module.id] || "💼",
            available: module.isAvailable // Use actual availability provided by the kit
        });
    }
  }

  // Ensure Freighter and xBull are always listed (even if not installed) to match original behavior
  if (!uiWallets.find((w) => w.id === WALLET_TYPES.FREIGHTER)) {
    uiWallets.push({ id: WALLET_TYPES.FREIGHTER, name: "Freighter", icon: "🦊", available: false });
  }
  if (!uiWallets.find((w) => w.id === WALLET_TYPES.XBULL)) {
    uiWallets.push({ id: WALLET_TYPES.XBULL, name: "xBull Wallet", icon: "🐂", available: false });
  }

  console.log("DETECTED UI WALLETS:", uiWallets);
  return uiWallets;
}

// ─── Connect ────────────────────────────────────────────────────────────────

/** Connect to a specific wallet by type. Returns { address, walletType }. */
export async function connectWallet(walletType) {
  const kitId = TYPE_TO_ID[walletType];
  if (!kitId) {
    throw {
      type: ERROR_TYPES.WALLET_NOT_FOUND,
      message: "Unknown wallet type",
    };
  }

  try {
    StellarWalletsKit.setWallet(kitId);
    
    // fetchAddress actually requests access from the extension!
    const { address } = await StellarWalletsKit.fetchAddress();
    
    if (!address) {
       throw new Error("User denied connection");
    }

    _activeWallet = walletType;
    _address = address;
    return { address, walletType };
  } catch (e) {
    throw {
      type: ERROR_TYPES.TX_REJECTED,
      message: e.message || "Connection was denied or wallet is unavailable.",
    };
  }
}

// ─── Auto-Reconnect ────────────────────────────────────────────────────────

/** Try to reconnect to previously used wallet silently. */
export async function tryAutoConnect() {
   // The StellarWalletsKit doesn't easily expose a silent auto-connect without prompting 'getAddress' which might open a popup on some wallets.
   // We will return null for now to skip auto-connect popup spam unless explicitly stored in LocalStorage by the UI layer.
   return null;
}

// ─── Sign Transaction ───────────────────────────────────────────────────────

/** Sign a transaction XDR with the active wallet. */
export async function walletSignTransaction(txXdr, opts = {}) {
  const networkPassphrase = opts.networkPassphrase || NETWORK_PASSPHRASE;

  if (!_activeWallet || !_address) {
    throw {
      type: ERROR_TYPES.WALLET_NOT_FOUND,
      message: "No wallet connected. Please connect a wallet first.",
    };
  }

  try {
    const { signedTxXdr } = await StellarWalletsKit.signTransaction(txXdr, {
        address: _address,
        networkPassphrase: networkPassphrase
    });
    
    return signedTxXdr;
  } catch (e) {
    throw {
      type: ERROR_TYPES.TX_REJECTED,
      message: e.message || "Transaction signing rejected in wallet.",
    };
  }
}

// ─── Disconnect ─────────────────────────────────────────────────────────────

export async function disconnectWallet() {
  _activeWallet = null;
  _address = null;
  try {
     await StellarWalletsKit.disconnect();
  } catch(e) {
     console.error("Disconnect error:", e);
  }
}

// ─── Getters ────────────────────────────────────────────────────────────────

export function getActiveWallet() {
  return _activeWallet;
}

export function getConnectedAddress() {
  return _address;
}
