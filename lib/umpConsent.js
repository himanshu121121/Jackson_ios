/**
 * Google UMP (User Messaging Platform) consent – JS bridge.
 * Uses native UmpConsent plugin on Android; no-op on web/iOS until iOS UMP is added.
 * See: https://developers.google.com/admob/android/privacy
 *
 * If the consent form never appears: this is NOT an app error – it is AdMob/Google (mob) side.
 * Fix: AdMob console → Privacy & messaging → create a message for your app ID.
 */

import { Capacitor, registerPlugin } from "@capacitor/core";

const UmpConsent = registerPlugin("UmpConsent");

const MOB_SIDE_DEBUG_MSG =
  "[AdMob/UMP] If consent form did not appear: NOT an app bug – AdMob console → Privacy & messaging → add message for your app ID.";

/**
 * Returns whether the app can request ads (user consent obtained or not required).
 * Call after consent flow has run (e.g. after app launch). On Android, UMP runs in MainActivity onCreate.
 * @returns {Promise<boolean>}
 */
export const canRequestAds = async () => {
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();
  console.log(
    "[AdMob/UMP] canRequestAds() called, platform:",
    platform,
    "isNative:",
    isNative,
  );
  if (!isNative) {
    console.log("[AdMob/UMP] Not native – returning true (no UMP)");
    return true;
  }
  try {
    const result = await UmpConsent.canRequestAds();
    const value = result?.value === true;
    console.log("[AdMob/UMP] canRequestAds() result:", value, "raw:", result);
    if (!value) {
      console.log(
        "[AdMob/UMP] canRequestAds=false – form may not have been shown. " +
          MOB_SIDE_DEBUG_MSG,
      );
    }
    return value;
  } catch (e) {
    console.warn(
      "[AdMob/UMP] canRequestAds failed (may be mob side config):",
      e,
    );
    console.log(MOB_SIDE_DEBUG_MSG);
    return false;
  }
};

/**
 * Shows the Google privacy options form (e.g. for "Privacy settings" / "Manage ad choices" in app settings).
 * Required when the privacy message is configured to need an in-app entry point.
 */
export const showPrivacyOptionsForm = async () => {
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();
  console.log(
    "[AdMob/UMP] showPrivacyOptionsForm() called, platform:",
    platform,
    "isNative:",
    isNative,
  );
  if (!isNative) {
    console.log("[AdMob/UMP] Not native – no-op");
    return;
  }
  try {
    console.log("[AdMob/UMP] Showing privacy options form...");
    await UmpConsent.showPrivacyOptionsForm();
    console.log("[AdMob/UMP] showPrivacyOptionsForm() completed");
  } catch (e) {
    console.warn("[AdMob/UMP] showPrivacyOptionsForm failed:", e);
  }
};
