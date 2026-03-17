import { NativePurchases, PURCHASE_TYPE } from '@capgo/native-purchases'

/**
 * Apple IAP Product ID Mapping
 * These match the products created in App Store Connect
 * Format: {tier}_{plan}
 */
export const APPLE_IAP_PRODUCT_IDS = {
  bronze_weekly: 'bronze_weekly',
  bronze_monthly: 'bronze_monthly',
  bronze_yearly: 'bronze_yearly',
  gold_weekly: 'gold_weekly',
  gold_monthly: 'gold_monthly',
  gold_yearly: 'gold_yearly',
  platinum_weekly: 'platinum_weekly',
  platinum_monthly: 'platinum_monthly',
  platinum_yearly: 'platinum_yearly',
}

/**
 * Get Apple IAP product ID from tier and plan
 * @param {string} tierId - Tier ID (bronze, gold, platinum)
 * @param {string} plan - Plan (weekly, monthly, yearly)
 * @returns {string|null} - Apple IAP product ID
 */
export function getAppleProductId(tierId, plan) {
  const key = `${tierId}_${plan}`
  return APPLE_IAP_PRODUCT_IDS[key] || null
}

/**
 * Check if Apple IAP is available on this device
 * iOS apps always have Apple IAP available (no need to check platform)
 * @returns {Promise<boolean>}
 */
export async function isAppleIAPAvailable() {
  try {
    // Check if billing is supported
    const { isBillingSupported } = await NativePurchases.isBillingSupported()
    console.log('[AppleIAP] Billing supported:', isBillingSupported)
    return isBillingSupported === true
  } catch (err) {
    console.warn('[AppleIAP] isBillingSupported check failed:', err)
    return false
  }
}

/**
 * Get subscription product details from App Store
 * @param {string} productId - Apple IAP product ID
 * @returns {Promise<object|null>}
 */
export async function getSubscriptionProduct(productId) {
  try {
    console.log('[AppleIAP] Getting product:', productId)

    const { products } = await NativePurchases.getProducts({
      productIdentifiers: [productId],
      productType: PURCHASE_TYPE.SUBS,
    })

    if (products && products.length > 0) {
      console.log('[AppleIAP] Product found:', {
        id: products[0].productIdentifier,
        price: products[0].price,
        currency: products[0].priceLocale
      })
      return products[0]
    }

    console.warn('[AppleIAP] Product not found:', productId)
    return null
  } catch (err) {
    console.error('[AppleIAP] getSubscriptionProduct error:', err)
    throw err
  }
}

/**
 * Purchase a subscription product
 * @param {string} productId - Apple IAP product ID
 * @returns {Promise<object>} - Purchase result with transaction details
 */
export async function purchaseSubscription(productId) {
  try {
    console.log('🛒 [AppleIAP] Initiating purchase:', {
      productIdentifier: productId,
      productType: 'SUBS'
    })

    const result = await NativePurchases.purchaseProduct({
      productIdentifier: productId,
      productType: PURCHASE_TYPE.SUBS,
    })

    console.log('✅ [AppleIAP] Purchase successful:', {
      transactionId: result.transactionId?.substring(0, 20) + '...',
      productId: result.productIdentifier,
      hasReceipt: !!result.transactionReceipt
    })

    return {
      transactionId: result.transactionId,
      productId: result.productIdentifier,
      transactionReceipt: result.transactionReceipt, // Base64 encoded receipt
      transactionDate: result.transactionDate,
    }
  } catch (err) {
    console.error('[AppleIAP] purchaseSubscription error:', err)

    // Enhance error with user-friendly messages
    if (err.code === 'E_USER_CANCELLED' || err.code === 2) {
      err.userMessage = 'Purchase cancelled'
      err.isCancelled = true
    } else if (err.code === 'E_NETWORK_ERROR') {
      err.userMessage = 'Network error. Please check your connection and try again.'
    } else if (err.code === 'E_UNABLE_TO_BUY') {
      err.userMessage = 'Unable to make purchases. Please check your device settings.'
    } else {
      err.userMessage = 'Purchase failed. Please try again.'
    }

    throw err
  }
}

/**
 * Restore previous purchases
 * @returns {Promise<object>}
 */
export async function restorePurchases() {
  try {
    console.log('[AppleIAP] Restoring purchases...')

    const result = await NativePurchases.restorePurchases()

    console.log('[AppleIAP] Restore complete:', {
      count: result.transactions?.length || 0
    })

    return result
  } catch (err) {
    console.error('[AppleIAP] restorePurchases error:', err)
    throw err
  }
}

/**
 * Get pending purchases (for finishing unfinished transactions)
 * @returns {Promise<Array>}
 */
export async function getPendingPurchases() {
  try {
    const result = await NativePurchases.getPendingPurchases()
    return result.transactions || []
  } catch (err) {
    console.error('[AppleIAP] getPendingPurchases error:', err)
    return []
  }
}

/**
 * Finish a transaction (acknowledge it)
 * @param {string} transactionId - Transaction ID to finish
 */
export async function finishTransaction(transactionId) {
  try {
    await NativePurchases.finishTransaction({
      transactionId
    })
    console.log('[AppleIAP] Transaction finished:', transactionId)
  } catch (err) {
    console.error('[AppleIAP] finishTransaction error:', err)
    throw err
  }
}
