// In-memory deals cache for pre-warming the deals/earn page.
// NOT stored in localStorage — must be cleared explicitly on sign-out.

let _cache = null;

/**
 * Store pre-warmed deals data.
 * @param {{ cashbackOffers: any[], shoppingOffers: any[], surveyOffers: any[] }} data
 */
export function setDealsCache(data) {
  _cache = { ...data, timestamp: Date.now() };
}

/**
 * Read the cached deals data (returns null if not set).
 */
export function getDealsCache() {
  return _cache;
}

/**
 * Clear the in-memory deals cache (called on sign-out).
 */
export function clearDealsCache() {
  _cache = null;
}
