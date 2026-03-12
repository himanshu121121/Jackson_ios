/**
 * Google Play Integrity API – frontend token generation
 *
 * Verified against official documentation:
 * - Overview: https://developer.android.com/google/play/integrity/overview
 * - Classic request (nonce + token): https://developer.android.com/google/play/integrity/classic
 * - Decrypt/verify (backend only): https://developer.android.com/google/play/integrity/classic#decrypt-verify
 *
 * Client flow (this file):
 * 1. Obtain nonce (optional: from backend POST /api/integrity/challenge; else generate unique client nonce).
 * 2. Call Play Integrity API requestIntegrityToken(nonce) via @capacitor-community/play-integrity (Android only).
 * 3. Send result.token to backend as X-Integrity-Token header.
 *
 * Where is the integrity token stored?
 * The integrity token is NOT stored anywhere. It is obtained on-demand when making requests to
 * integrity-protected endpoints (see ENDPOINTS_REQUIRING_INTEGRITY in lib/api.js). The token is
 * sent only in the X-Integrity-Token header for that single request; no caching or persistence.
 *
 * Backend only (never in app or git):
 * - GOOGLE_PLAY_INTEGRITY_SERVICE_ACCOUNT (service account JSON) must be used on the server to
 *   decrypt and verify the token with Google. See official docs "Decrypt and verify the integrity verdict".
 *
 * Plugin: https://www.npmjs.com/package/@capacitor-community/play-integrity
 */

const DEBUG =
  typeof process !== "undefined" && process.env?.NODE_ENV === "development";
const debugIntegrity = () =>
  DEBUG ||
  (typeof localStorage !== "undefined" &&
    localStorage?.getItem("debug_api") === "true");
const log = (...args) => {
  if (debugIntegrity()) console.log("[PlayIntegrity]", ...args);
};

const BASE_URL =
  typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : "https://rewardsapi.hireagent.co";

/**
 * Cloud project number for Play Integrity.
 * Use 0 for "default for the application" (app linked in Play Console).
 * Or set via env NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT_NUMBER (numeric, from Firebase Console > Project Settings).
 */
const DEFAULT_GOOGLE_CLOUD_PROJECT_NUMBER = (() => {
  if (
    typeof process === "undefined" ||
    process.env?.NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT_NUMBER == null
  )
    return 0;
  const n = Number(process.env.NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT_NUMBER);
  return Number.isFinite(n) ? n : 0;
})();

/**
 * Generate a unique nonce for Play Integrity (per official docs: unique value for replay protection).
 * Used when backend challenge is not available. Prefer server-generated nonce when possible.
 * @returns {string}
 */
function generateRandomNonce() {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return btoa(String.fromCharCode(...bytes))
      .replace(/=/g, "")
      .slice(0, 32);
  }
  return `client_nonce_${Date.now()}_${Math.random().toString(36).slice(2, 15)}`;
}

/**
 * Request a nonce from backend (optional). Backend POST /api/integrity/challenge
 * may return { nonce } for binding the integrity token to a server session.
 * @param {string|null} authToken - Optional Bearer token
 * @returns {Promise<string|null>} Nonce string or null
 */
export async function getIntegrityChallenge(authToken = null) {
  const url = `${BASE_URL}/api/integrity/challenge`;
  log("getIntegrityChallenge: POST", url, "auth:", !!authToken);
  try {
    const headers = { "Content-Type": "application/json" };
    if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      log("getIntegrityChallenge: response not ok", res.status, res.statusText);
      return null;
    }
    const data = await res.json().catch((e) => {
      log("getIntegrityChallenge: JSON parse failed", e);
      return {};
    });
    // Backend may return { success, data: { nonce, packageName, timestamp } } or flat { nonce }
    const nonce = data.data?.nonce ?? data.nonce ?? null;
    log(
      "getIntegrityChallenge: raw data",
      data,
      "-> nonce:",
      nonce ? `${nonce.slice(0, 20)}...` : null,
    );
    return nonce;
  } catch (e) {
    log("getIntegrityChallenge: error", e?.message ?? e);
    return null;
  }
}

/**
 * Request Play Integrity token on Android; no-op on web/iOS (returns null).
 * Optionally uses backend challenge nonce; otherwise uses a client-generated nonce.
 *
 * @param {Object} options
 * @param {string} [options.authToken] - Optional auth token for /api/integrity/challenge
 * @param {number} [options.googleCloudProjectNumber] - Cloud project number (default 0)
 * @returns {Promise<string|null>} Integrity token string or null
 */
export async function getIntegrityToken(options = {}) {
  const {
    authToken = null,
    googleCloudProjectNumber = DEFAULT_GOOGLE_CLOUD_PROJECT_NUMBER,
  } = options;

  log("getIntegrityToken: called", {
    hasAuthToken: !!authToken,
    googleCloudProjectNumber,
  });

  if (typeof window === "undefined") {
    log("getIntegrityToken: no window, skip");
    return null;
  }

  const Capacitor = window.Capacitor;
  const platform = Capacitor?.getPlatform?.();
  if (!Capacitor || platform !== "android") {
    log("getIntegrityToken: not Android, skip", { platform });
    return null;
  }

  let nonce = null;
  let nonceSource = "none";
  try {
    nonce = await getIntegrityChallenge(authToken);
    nonceSource = nonce ? "backend" : "none";
  } catch (e) {
    log("getIntegrityToken: getIntegrityChallenge threw", e?.message ?? e);
  }
  if (!nonce) {
    nonce = generateRandomNonce();
    nonceSource = "client";
  }
  log(
    "getIntegrityToken: nonce source:",
    nonceSource,
    "nonce length:",
    nonce?.length,
    "preview:",
    nonce ? `${nonce.slice(0, 24)}...` : null,
  );

  try {
    const { PlayIntegrity } =
      await import("@capacitor-community/play-integrity");
    log("getIntegrityToken: calling requestIntegrityToken", {
      nonceLength: nonce?.length,
      googleCloudProjectNumber,
    });
    const result = await PlayIntegrity.requestIntegrityToken({
      nonce,
      googleCloudProjectNumber,
    });
    const token = result?.token ?? null;
    log("getIntegrityToken: SDK result", {
      hasToken: !!token,
      tokenLength: token?.length ?? 0,
    });
    return token;
  } catch (err) {
    log(
      "getIntegrityToken: requestIntegrityToken failed",
      err?.message ?? err,
      err,
    );
    if (
      typeof console !== "undefined" &&
      (process.env.NODE_ENV === "development" ||
        localStorage?.getItem("debug_api") === "true")
    ) {
      console.warn(
        "[PlayIntegrity] requestIntegrityToken failed:",
        err?.message ?? err,
      );
    }
    return null;
  }
}

export default {
  getIntegrityChallenge,
  getIntegrityToken,
  generateRandomNonce,
};
