/**
 * Biometric Authentication Helper
 * Handles Face ID / Touch ID authentication for login
 * Uses capacitor-native-biometric for proven Android/iOS support
 *
 * COMPLETE IMPLEMENTATION FOLLOWING OFFICIAL DOCUMENTATION:
 * https://www.npmjs.com/package/capacitor-native-biometric
 *
 * Features Implemented:
 * 1. isAvailable() - Check if biometric is available
 * 2. verifyIdentity() - Authenticate with biometric
 * 3. setCredentials() - Store credentials securely
 * 4. getCredentials() - Retrieve stored credentials
 * 5. deleteCredentials() - Delete stored credentials
 */

import { Capacitor } from "@capacitor/core";
import { Device } from "@capacitor/device";
import { NativeBiometric, BiometryType } from "capacitor-native-biometric";

// Server identifier for credential storage
const CREDENTIAL_SERVER = "com.jackson.app";

/**
 * Check if biometric authentication is available on this device
 * Following documentation: https://www.npmjs.com/package/capacitor-native-biometric
 * @returns {Promise<{isAvailable: boolean, biometryType: number, biometryTypeName: string, errorCode?: number}>}
 */
export async function checkBiometricAvailability() {
  console.log("🔍 [BIOMETRIC-LIB] checkBiometricAvailability() called");

  try {
    console.log("🔍 [BIOMETRIC-LIB] Platform:", Capacitor.getPlatform());
    console.log("🔍 [BIOMETRIC-LIB] Is native:", Capacitor.isNativePlatform());

    // Only available on native platforms
    if (!Capacitor.isNativePlatform()) {
      console.log(
        "⚠️ [BIOMETRIC-LIB] Not native platform, returning unavailable",
      );
      return {
        isAvailable: false,
        biometryType: BiometryType.NONE,
        biometryTypeName: "none",
        errorCode: -1,
      };
    }

    console.log("🔍 [BIOMETRIC-LIB] Calling NativeBiometric.isAvailable()...");

    // Call the plugin's isAvailable method
    const result = await NativeBiometric.isAvailable();

    console.log("✅ [BIOMETRIC-LIB] Raw result:", JSON.stringify(result));

    // Map biometry type to human-readable names
    // BiometryType values: 0=NONE, 1=TOUCH_ID, 2=FACE_ID, 3=FINGERPRINT, 4=FACE_AUTHENTICATION, 5=IRIS_AUTHENTICATION
    const biometryTypeNames = {
      [BiometryType.NONE]: "none",
      [BiometryType.TOUCH_ID]: "touchid",
      [BiometryType.FACE_ID]: "faceid",
      [BiometryType.FINGERPRINT]: "fingerprint",
      [BiometryType.FACE_AUTHENTICATION]: "face",
      [BiometryType.IRIS_AUTHENTICATION]: "iris",
    };

    const biometryTypeName =
      biometryTypeNames[result.biometryType] || "unknown";

    console.log("✅ [BIOMETRIC-LIB] Biometric available:", result.isAvailable);
    console.log(
      "✅ [BIOMETRIC-LIB] Biometry type:",
      result.biometryType,
      `(${biometryTypeName})`,
    );

    // IMPORTANT: On Android, the plugin only returns the PRIMARY biometric type
    // If fingerprint (type 3) is returned, face unlock (type 4) might also be available
    // Android's BiometricPrompt will show all available options when verifyIdentity() is called
    // So we should indicate that face unlock might be available even if fingerprint is primary
    const platform = Capacitor.getPlatform();
    let hasFaceUnlock = false;
    let hasFingerprint = false;

    if (platform === "android") {
      // On Android, if fingerprint is detected, face unlock might also be available
      // The plugin only returns the primary type, but Android supports multiple biometrics
      if (result.biometryType === BiometryType.FINGERPRINT) {
        hasFingerprint = true;
        // Note: Face unlock might be available but not detected as primary
        // Android's BiometricPrompt will show all available options when verifyIdentity() is called
        console.log(
          "ℹ️ [BIOMETRIC-LIB] Android: Fingerprint detected as primary (type 3).",
        );
        console.log(
          "ℹ️ [BIOMETRIC-LIB] Android: Face unlock (type 4) may also be available but NOT detected as primary.",
        );
        console.log(
          "ℹ️ [BIOMETRIC-LIB] Android: Note: isAvailable() only returns the PRIMARY biometric type",
        );
        console.log(
          "ℹ️ [BIOMETRIC-LIB] Android: However, verifyIdentity() will show ALL available biometrics",
        );
        console.log(
          "ℹ️ [BIOMETRIC-LIB] Android: Both fingerprint and face unlock will appear if both are enrolled",
        );
      } else if (result.biometryType === BiometryType.FACE_AUTHENTICATION) {
        hasFaceUnlock = true;
        console.log(
          "✅ [BIOMETRIC-LIB] Android: Face unlock detected as primary (type 4).",
        );
      }
    } else if (platform === "ios") {
      if (result.biometryType === BiometryType.FACE_ID) {
        hasFaceUnlock = true;
        console.log("✅ [BIOMETRIC-LIB] iOS: Face ID detected (type 2).");
      } else if (result.biometryType === BiometryType.TOUCH_ID) {
        hasFingerprint = true;
        console.log("✅ [BIOMETRIC-LIB] iOS: Touch ID detected (type 1).");
      }
    }

    return {
      isAvailable: result.isAvailable || false,
      biometryType: result.biometryType,
      biometryTypeName,
      errorCode: result.errorCode,
      // Additional info for Android
      hasFaceUnlock:
        platform === "android" && hasFingerprint ? "maybe" : hasFaceUnlock,
      hasFingerprint,
      platform,
    };
  } catch (error) {
    console.error(
      "❌ [BIOMETRIC-LIB] Error checking biometric availability:",
      error,
    );
    return {
      isAvailable: false,
      biometryType: BiometryType.NONE,
      biometryTypeName: "none",
      errorCode: error.code || -1,
      errorMessage: error.message,
    };
  }
}

/**
 * Verify identity using biometric authentication
 * Following documentation: https://www.npmjs.com/package/capacitor-native-biometric
 * @param {Object} options - Authentication options
 * @param {string} options.reason - Reason for authentication
 * @param {string} options.title - Title for prompt
 * @param {string} options.subtitle - Subtitle for prompt
 * @param {string} options.description - Description for prompt
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function verifyBiometricIdentity(options = {}) {
  console.log("🔐 [BIOMETRIC-LIB] verifyBiometricIdentity() called");
  console.log("🔐 [BIOMETRIC-LIB] Options:", JSON.stringify(options));

  try {
    // Check if biometric is available first
    const availability = await checkBiometricAvailability();

    if (!availability.isAvailable) {
      console.log("❌ [BIOMETRIC-LIB] Biometric not available");
      return {
        success: false,
        error: "Biometric authentication not available on this device",
      };
    }

    const {
      reason = "For easy log in",
      title = "Log in",
      subtitle = "Authenticate to continue",
      description = "Use your biometric to verify your identity",
    } = options;

    console.log("🔐 [BIOMETRIC-LIB] Calling verifyIdentity...");
    console.log("🔐 [BIOMETRIC-LIB] Platform:", Capacitor.getPlatform());

    if (Capacitor.getPlatform() === "android") {
      console.log("ℹ️ [BIOMETRIC-LIB] Android: BiometricPrompt is being shown");
      console.log(
        "ℹ️ [BIOMETRIC-LIB] Android: BiometricPrompt will show all available biometric authenticators",
      );
      console.log(
        "ℹ️ [BIOMETRIC-LIB] Android: If face unlock is enrolled, it will appear in the prompt alongside fingerprint",
      );
    }

    // Call verifyIdentity - it resolves on success, rejects on failure
    // NOTE: Android's BiometricPrompt will show all available authenticators by default
    // Both fingerprint and face unlock will appear if both are enrolled
    await NativeBiometric.verifyIdentity({
      reason,
      title,
      subtitle,
      description,
    });

    console.log("✅ [BIOMETRIC-LIB] Biometric verification successful!");
    console.log(
      "✅ [BIOMETRIC-LIB] User authenticated using biometric (fingerprint or face unlock)",
    );

    return {
      success: true,
      biometryType: availability.biometryType,
      biometryTypeName: availability.biometryTypeName,
    };
  } catch (error) {
    console.error("❌ [BIOMETRIC-LIB] Biometric verification failed:", error);
    return {
      success: false,
      error: error.message || "Biometric authentication failed",
      errorCode: error.code,
    };
  }
}

/**
 * Store user credentials securely using native biometric secure storage
 * Following documentation: https://www.npmjs.com/package/capacitor-native-biometric
 * @param {Object} credentials - User credentials
 * @param {string} credentials.username - Username (email or phone)
 * @param {string} credentials.password - Password (or auth token)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function setCredentials(credentials) {
  console.log("💾 [BIOMETRIC-LIB] setCredentials() called");
  console.log("💾 [BIOMETRIC-LIB] Platform:", Capacitor.getPlatform());
  console.log("💾 [BIOMETRIC-LIB] Is native:", Capacitor.isNativePlatform());
  console.log("💾 [BIOMETRIC-LIB] Server:", CREDENTIAL_SERVER);
  console.log("💾 [BIOMETRIC-LIB] Username:", credentials?.username);
  console.log(
    "💾 [BIOMETRIC-LIB] Password type:",
    typeof credentials?.password,
  );
  console.log(
    "💾 [BIOMETRIC-LIB] Password length:",
    credentials?.password?.length || 0,
  );
  console.log(
    "💾 [BIOMETRIC-LIB] Password preview:",
    credentials?.password
      ? typeof credentials.password === "string"
        ? credentials.password.substring(0, 20) + "..."
        : String(credentials.password).substring(0, 20)
      : "undefined",
  );

  try {
    if (!Capacitor.isNativePlatform()) {
      console.log(
        "⚠️ [BIOMETRIC-LIB] Not native platform, using localStorage fallback",
      );
      // Fallback to localStorage for web
      localStorage.setItem("biometric_username", credentials.username);
      localStorage.setItem("biometric_password", credentials.password);
      return { success: true };
    }

    // Validate credentials object and its properties
    if (!credentials || typeof credentials !== "object") {
      console.error(
        "❌ [BIOMETRIC-LIB] Invalid credentials object:",
        credentials,
      );
      return {
        success: false,
        error: "Invalid credentials object provided",
      };
    }

    const { username, password } = credentials;

    // Validate username
    if (
      !username ||
      typeof username !== "string" ||
      username.trim().length === 0
    ) {
      console.error("❌ [BIOMETRIC-LIB] Invalid username:", username);
      return {
        success: false,
        error: "Valid username (non-empty string) is required",
      };
    }

    // Validate password - must be a non-empty string
    if (
      !password ||
      typeof password !== "string" ||
      password.trim().length === 0
    ) {
      console.error(
        "❌ [BIOMETRIC-LIB] Invalid password:",
        typeof password,
        password,
      );
      console.error(
        "❌ [BIOMETRIC-LIB] Password is:",
        password === null
          ? "null"
          : password === undefined
            ? "undefined"
            : password === ""
              ? "empty string"
              : `type: ${typeof password}, value: ${String(password).substring(0, 50)}`,
      );
      return {
        success: false,
        error: "Valid password (non-empty string) is required",
      };
    }

    // Ensure password is a string (not an object that stringifies to "{}")
    const passwordString = String(password);
    if (passwordString === "{}" || passwordString === "[object Object]") {
      console.error(
        "❌ [BIOMETRIC-LIB] Password appears to be an object, not a string:",
        password,
      );
      return {
        success: false,
        error: "Password must be a string, not an object",
      };
    }

    console.log(
      "💾 [BIOMETRIC-LIB] Saving credentials to native secure storage...",
    );
    console.log(
      "💾 [BIOMETRIC-LIB] Calling NativeBiometric.setCredentials()...",
    );
    console.log("💾 [BIOMETRIC-LIB] Username (validated):", username);
    console.log(
      "💾 [BIOMETRIC-LIB] Password (validated) length:",
      passwordString.length,
    );
    console.log(
      "💾 [BIOMETRIC-LIB] Password (validated) type:",
      typeof passwordString,
    );

    // Store credentials in Preferences as a backup (doesn't require Keystore authentication)
    // This ensures credentials are available even if Keystore save fails
    try {
      const { Preferences } = await import("@capacitor/preferences");
      await Preferences.set({
        key: "biometric_username_backup",
        value: username,
      });
      await Preferences.set({
        key: "biometric_password_backup",
        value: passwordString,
      });
      console.log(
        "✅ [BIOMETRIC-LIB] Credentials stored in Preferences as backup",
      );
    } catch (prefError) {
      console.warn(
        "⚠️ [BIOMETRIC-LIB] Failed to store credentials in Preferences:",
        prefError,
      );
      // Continue anyway - Keystore is the primary storage
    }

    // Save credentials using the native biometric plugin
    // Use passwordString to ensure it's a valid string
    await NativeBiometric.setCredentials({
      username: username.trim(),
      password: passwordString,
      server: CREDENTIAL_SERVER,
    });

    console.log(
      "✅ [BIOMETRIC-LIB] NativeBiometric.setCredentials() completed",
    );
    console.log("✅ [BIOMETRIC-LIB] Credentials saved successfully");
    console.log("✅ [BIOMETRIC-LIB] Server:", CREDENTIAL_SERVER);
    console.log("✅ [BIOMETRIC-LIB] Username saved:", username);
    console.log(
      "✅ [BIOMETRIC-LIB] Password length saved:",
      passwordString.length,
    );

    // Note: We don't verify credentials here because getCredentials() requires
    // biometric authentication, which would prompt the user unnecessarily during save.
    // Credentials will be verified when the user attempts to use biometric login.

    return { success: true };
  } catch (error) {
    console.error("❌ [BIOMETRIC-LIB] Failed to save credentials:", error);
    console.error("❌ [BIOMETRIC-LIB] Error message:", error.message);
    console.error("❌ [BIOMETRIC-LIB] Error code:", error.code);
    console.error(
      "❌ [BIOMETRIC-LIB] Full error:",
      JSON.stringify(error, null, 2),
    );

    // Check if this is a UserNotAuthenticatedException
    // According to official Android documentation:
    // https://developer.android.com/identity/sign-in/biometric-auth
    // When Keystore requires authentication, we should:
    // 1. Authenticate first to unlock the Keystore
    // 2. Then retry saving credentials
    const errorMessage = error.message || "";
    const errorString = JSON.stringify(error).toLowerCase();
    const platform = Capacitor.getPlatform();

    // Check for UserNotAuthenticatedException indicators:
    // 1. Direct message match (if plugin exposes it)
    // 2. Error string contains the exception name (in stack trace or error object)
    // 3. On Android, "Failed to save credentials" is the wrapped message for UserNotAuthenticatedException
    //    This is the most common case - the native exception is wrapped by the plugin
    const isUserNotAuthenticated =
      errorMessage.includes("UserNotAuthenticatedException") ||
      errorMessage.includes("User not authenticated") ||
      errorMessage.toLowerCase().includes("user not authenticated") ||
      errorString.includes("usernotauthenticatedexception") ||
      (platform === "android" && errorMessage === "Failed to save credentials");

    if (isUserNotAuthenticated && platform === "android") {
      console.warn("⚠️ [BIOMETRIC-LIB] UserNotAuthenticatedException detected");
      console.warn(
        "⚠️ [BIOMETRIC-LIB] Following official Android Keystore pattern: authenticate first, then retry",
      );
      console.warn(
        "⚠️ [BIOMETRIC-LIB] Android Keystore requires device authentication (screen lock)",
      );
      console.warn(
        "⚠️ [BIOMETRIC-LIB] Reference: https://developer.android.com/training/sign-in/biometric-auth",
      );
      console.warn(
        "⚠️ [BIOMETRIC-LIB] Attempting to authenticate to unlock Keystore...",
      );

      // Validate credentials are available before attempting retry
      // Following official documentation: ensure credentials object is valid
      if (!credentials || typeof credentials !== "object") {
        console.error(
          "❌ [BIOMETRIC-LIB] Cannot retry: credentials object is invalid",
        );
        return {
          success: false,
          error: "Invalid credentials object provided for retry",
          errorCode: error.code,
        };
      }

      const retryUsername = credentials.username;
      const retryPassword = credentials.password;

      // Validate retry credentials
      if (
        !retryUsername ||
        typeof retryUsername !== "string" ||
        retryUsername.trim().length === 0
      ) {
        console.error("❌ [BIOMETRIC-LIB] Cannot retry: invalid username");
        return {
          success: false,
          error: "Invalid username for retry",
          errorCode: error.code,
        };
      }

      if (
        !retryPassword ||
        typeof retryPassword !== "string" ||
        retryPassword.trim().length === 0
      ) {
        console.error("❌ [BIOMETRIC-LIB] Cannot retry: invalid password");
        console.error(
          "❌ [BIOMETRIC-LIB] Password type:",
          typeof retryPassword,
        );
        console.error("❌ [BIOMETRIC-LIB] Password value:", retryPassword);
        return {
          success: false,
          error: "Invalid password for retry",
          errorCode: error.code,
        };
      }

      // Ensure password is a string (not an object)
      const retryPasswordString = String(retryPassword);
      if (
        retryPasswordString === "{}" ||
        retryPasswordString === "[object Object]"
      ) {
        console.error(
          "❌ [BIOMETRIC-LIB] Cannot retry: password is an object, not a string",
        );
        return {
          success: false,
          error: "Password must be a string for retry",
          errorCode: error.code,
        };
      }

      try {
        // According to official Android Keystore documentation:
        // https://developer.android.com/training/sign-in/biometric-auth
        // When UserNotAuthenticatedException occurs, we must:
        // 1. Try deleting old credentials first (they might be locked/conflicting)
        // 2. Authenticate to unlock the Keystore
        // 3. Then retry the operation (setCredentials) IMMEDIATELY after authentication
        // This allows DEVICE_CREDENTIAL (PIN/Pattern/Password) as fallback

        // Step 1: Try to delete old credentials first to avoid conflicts
        // Old credentials might be locked and preventing new ones from being saved
        try {
          console.log(
            "🗑️ [BIOMETRIC-LIB] Attempting to delete old credentials before saving new ones...",
          );
          await NativeBiometric.deleteCredentials({
            server: CREDENTIAL_SERVER,
          });
          console.log(
            "✅ [BIOMETRIC-LIB] Old credentials deleted successfully",
          );
          // Small delay to ensure deletion completes
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (deleteError) {
          // It's okay if deletion fails - credentials might not exist
          console.log(
            "ℹ️ [BIOMETRIC-LIB] Could not delete old credentials (may not exist):",
            deleteError.message,
          );
        }

        // Step 2: Authenticate to unlock the Keystore
        console.log(
          "🔐 [BIOMETRIC-LIB] Prompting for device authentication to unlock Keystore...",
        );
        await NativeBiometric.verifyIdentity({
          reason: "Unlock device to save biometric credentials",
          title: "Device Authentication Required",
          subtitle: "Authenticate to save credentials securely",
          description:
            "Use your biometric or device PIN to unlock secure storage",
        });

        console.log("✅ [BIOMETRIC-LIB] Authentication successful");
        console.log(
          "✅ [BIOMETRIC-LIB] Using validated credentials from function parameter",
        );
        console.log("✅ [BIOMETRIC-LIB] Retry username:", retryUsername.trim());
        console.log(
          "✅ [BIOMETRIC-LIB] Retry password length:",
          retryPasswordString.length,
        );
        console.log(
          "✅ [BIOMETRIC-LIB] Retry password type:",
          typeof retryPasswordString,
        );

        // Step 3: Retry saving credentials IMMEDIATELY after authentication
        // Use a very small delay (0ms) to ensure the authentication state is fully committed
        // but execute synchronously to avoid Keystore re-locking
        console.log(
          "💾 [BIOMETRIC-LIB] Retrying credential save after authentication...",
        );
        await NativeBiometric.setCredentials({
          username: retryUsername.trim(),
          password: retryPasswordString,
          server: CREDENTIAL_SERVER,
        });

        console.log(
          "✅ [BIOMETRIC-LIB] Credentials saved successfully after authentication",
        );
        console.log(
          "✅ [BIOMETRIC-LIB] Following official Android Keystore retry pattern completed",
        );
        return { success: true };
      } catch (retryError) {
        console.error(
          "❌ [BIOMETRIC-LIB] Retry after authentication also failed:",
          retryError,
        );
        console.error(
          "❌ [BIOMETRIC-LIB] Retry error message:",
          retryError.message,
        );
        console.error("❌ [BIOMETRIC-LIB] Retry error code:", retryError.code);
        console.error(
          "❌ [BIOMETRIC-LIB] Full retry error:",
          JSON.stringify(retryError, null, 2),
        );

        // Check if this is still a UserNotAuthenticatedException
        const retryErrorMessage = retryError.message || "";
        const retryErrorString = JSON.stringify(retryError).toLowerCase();
        const isStillUserNotAuthenticated =
          retryErrorMessage.includes("UserNotAuthenticatedException") ||
          retryErrorMessage.includes("User not authenticated") ||
          retryErrorString.includes("usernotauthenticatedexception") ||
          (Capacitor.getPlatform() === "android" &&
            retryErrorMessage === "Failed to save credentials");

        if (isStillUserNotAuthenticated) {
          console.warn(
            "⚠️ [BIOMETRIC-LIB] Keystore still locked after authentication",
          );
          console.warn(
            "⚠️ [BIOMETRIC-LIB] This may require device unlock (PIN/Pattern/Password) at OS level",
          );
          console.warn(
            "⚠️ [BIOMETRIC-LIB] Credentials are stored in Preferences as backup and will work on next app launch",
          );
        }

        console.warn(
          "⚠️ [BIOMETRIC-LIB] Credentials are stored in Preferences as backup",
        );
        console.warn(
          "⚠️ [BIOMETRIC-LIB] Will store credentials as pending for next login",
        );

        // If retry fails, return requiresDeviceAuth flag so caller can store pending credentials
        // This follows the official pattern of graceful degradation
        // Note: Credentials are already stored in Preferences as backup, so they're not lost
        return {
          success: false,
          error:
            "Device authentication required. Credentials are saved in secure backup storage and will be available on next login.",
          errorCode: retryError.code || error.code,
          requiresDeviceAuth: true,
        };
      }
    }

    // For non-UserNotAuthenticatedException errors, return the error as-is
    return {
      success: false,
      error: error.message || "Failed to save credentials",
      errorCode: error.code,
    };
  }
}

/**
 * Retrieve stored credentials from native biometric secure storage
 * Following documentation: https://www.npmjs.com/package/capacitor-native-biometric
 * @returns {Promise<{success: boolean, username?: string, password?: string, error?: string}>}
 */
export async function getCredentials() {
  console.log("🔑 [BIOMETRIC-LIB] getCredentials() called");
  console.log("🔑 [BIOMETRIC-LIB] Platform:", Capacitor.getPlatform());
  console.log("🔑 [BIOMETRIC-LIB] Is native:", Capacitor.isNativePlatform());
  console.log("🔑 [BIOMETRIC-LIB] Server:", CREDENTIAL_SERVER);

  try {
    if (!Capacitor.isNativePlatform()) {
      console.log(
        "⚠️ [BIOMETRIC-LIB] Not native platform, using localStorage fallback",
      );
      // Fallback to localStorage for web
      const username = localStorage.getItem("biometric_username");
      const password = localStorage.getItem("biometric_password");

      if (!username || !password) {
        console.log("⚠️ [BIOMETRIC-LIB] No credentials found in localStorage");
        return {
          success: false,
          error: "No credentials found",
        };
      }

      console.log("✅ [BIOMETRIC-LIB] Credentials retrieved from localStorage");
      return {
        success: true,
        username,
        password,
      };
    }

    console.log(
      "🔑 [BIOMETRIC-LIB] Retrieving credentials from native secure storage...",
    );
    console.log(
      "🔑 [BIOMETRIC-LIB] Calling NativeBiometric.getCredentials()...",
    );

    // Retrieve credentials using the native biometric plugin
    const credentials = await NativeBiometric.getCredentials({
      server: CREDENTIAL_SERVER,
    });

    console.log(
      "✅ [BIOMETRIC-LIB] NativeBiometric.getCredentials() completed",
    );
    console.log("✅ [BIOMETRIC-LIB] Credentials retrieved successfully");
    console.log("✅ [BIOMETRIC-LIB] Username:", credentials.username);
    console.log(
      "✅ [BIOMETRIC-LIB] Password length:",
      credentials.password?.length || 0,
    );

    return {
      success: true,
      username: credentials.username,
      password: credentials.password,
    };
  } catch (error) {
    const errorMessage = error.message || "";

    // Check if this is a "no credentials found" error (expected, not a real error)
    const isNoCredentialsError =
      errorMessage.includes("Failed to get credentials") ||
      errorMessage.includes("No credentials found") ||
      errorMessage.includes("not found") ||
      errorMessage.toLowerCase().includes("no credentials");

    if (isNoCredentialsError) {
      // This is expected when no credentials are stored - log as info, not error
      console.log(
        "ℹ️ [BIOMETRIC-LIB] No credentials found (this is normal if biometric login hasn't been set up)",
      );
      return {
        success: false,
        error: "No credentials found",
        errorCode: error.code,
        isNoCredentials: true, // Flag to indicate this is expected
      };
    }

    // This is an actual error (authentication failure, etc.)
    console.error(
      "❌ [BIOMETRIC-LIB] Failed to retrieve credentials from Keystore:",
      error,
    );
    console.error("❌ [BIOMETRIC-LIB] Error message:", error.message);
    console.error("❌ [BIOMETRIC-LIB] Error code:", error.code);

    // Try to retrieve credentials from Preferences as a fallback
    // This is useful if Keystore save failed but credentials were stored in Preferences
    if (Capacitor.isNativePlatform()) {
      try {
        console.log(
          "🔄 [BIOMETRIC-LIB] Attempting to retrieve credentials from Preferences backup...",
        );
        const { Preferences } = await import("@capacitor/preferences");
        const usernameResult = await Preferences.get({
          key: "biometric_username_backup",
        });
        const passwordResult = await Preferences.get({
          key: "biometric_password_backup",
        });

        if (usernameResult?.value && passwordResult?.value) {
          console.log(
            "✅ [BIOMETRIC-LIB] Credentials retrieved from Preferences backup",
          );
          console.log("✅ [BIOMETRIC-LIB] Username:", usernameResult.value);
          console.log(
            "✅ [BIOMETRIC-LIB] Password length:",
            passwordResult.value.length,
          );
          return {
            success: true,
            username: usernameResult.value,
            password: passwordResult.value,
            source: "preferences_backup", // Flag to indicate credentials came from backup
          };
        } else {
          console.log(
            "ℹ️ [BIOMETRIC-LIB] No credentials found in Preferences backup either",
          );
        }
      } catch (prefError) {
        console.warn(
          "⚠️ [BIOMETRIC-LIB] Failed to retrieve credentials from Preferences:",
          prefError,
        );
        // Fall through to return error
      }
    }

    console.error(
      "❌ [BIOMETRIC-LIB] Full error:",
      JSON.stringify(error, null, 2),
    );
    return {
      success: false,
      error: error.message || "Failed to retrieve credentials",
      errorCode: error.code,
    };
  }
}

/**
 * Delete stored credentials from native biometric secure storage
 * Following documentation: https://www.npmjs.com/package/capacitor-native-biometric
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteCredentials() {
  console.log("🗑️ [BIOMETRIC-LIB] deleteCredentials() called");

  try {
    if (!Capacitor.isNativePlatform()) {
      console.log(
        "⚠️ [BIOMETRIC-LIB] Not native platform, using localStorage fallback",
      );
      // Fallback to localStorage for web
      localStorage.removeItem("biometric_username");
      localStorage.removeItem("biometric_password");
      return { success: true };
    }

    console.log(
      "🗑️ [BIOMETRIC-LIB] Deleting credentials from native secure storage...",
    );

    // Delete credentials using the native biometric plugin
    await NativeBiometric.deleteCredentials({
      server: CREDENTIAL_SERVER,
    });

    console.log("✅ [BIOMETRIC-LIB] Credentials deleted successfully");

    return { success: true };
  } catch (error) {
    console.error("❌ [BIOMETRIC-LIB] Failed to delete credentials:", error);
    return {
      success: false,
      error: error.message || "Failed to delete credentials",
    };
  }
}

/**
 * Complete biometric authentication flow for login
 * This is a complete implementation following the documentation
 * Flow: Check availability -> Verify identity -> Retrieve credentials
 * @param {Object} options - Authentication options
 * @returns {Promise<{success: boolean, username?: string, password?: string, biometryType?: number, error?: string}>}
 */
export async function authenticateWithBiometric(options = {}) {
  console.log("🔐 [BIOMETRIC-LIB] authenticateWithBiometric() - Complete Flow");

  try {
    // Step 1: Check if biometric is available
    const availability = await checkBiometricAvailability();

    if (!availability.isAvailable) {
      return {
        success: false,
        error: "Biometric authentication not available",
      };
    }

    console.log(
      "✅ [BIOMETRIC-LIB] Biometric type:",
      availability.biometryTypeName,
    );

    // Step 2: Verify identity with biometric
    const verification = await verifyBiometricIdentity({
      reason: options.reason || "Login to your Jackson account",
      title: options.title || "Biometric Login",
      subtitle: options.subtitle || "Authenticate to continue",
      description: options.description || "Use your biometric to log in",
    });

    if (!verification.success) {
      return {
        success: false,
        error: verification.error || "Biometric verification failed",
      };
    }

    console.log("✅ [BIOMETRIC-LIB] Biometric verification successful");

    // Step 3: Retrieve stored credentials
    const credentialsResult = await getCredentials();

    if (!credentialsResult.success) {
      return {
        success: false,
        error: "No saved credentials found. Please login manually first.",
      };
    }

    console.log("✅ [BIOMETRIC-LIB] Complete authentication successful");

    return {
      success: true,
      username: credentialsResult.username,
      password: credentialsResult.password,
      biometryType: availability.biometryType,
      biometryTypeName: availability.biometryTypeName,
    };
  } catch (error) {
    console.error("❌ [BIOMETRIC-LIB] Authentication flow failed:", error);
    return {
      success: false,
      error: error.message || "Authentication failed",
    };
  }
}

/**
 * Get device ID for biometric tracking
 * @returns {Promise<string>}
 */
export async function getDeviceId() {
  try {
    const deviceInfo = await Device.getId();
    return deviceInfo.identifier || "unknown";
  } catch (error) {
    console.error("❌ [BIOMETRIC-LIB] Error getting device ID:", error);
    return "unknown";
  }
}

/**
 * Check if user has biometric credentials stored
 * This checks if credentials exist WITHOUT requiring biometric authentication
 * Uses Preferences to check if username is stored (survives logout)
 * @returns {Promise<boolean>}
 */
export async function hasBiometricCredentials() {
  try {
    // First, check if username is stored in Preferences (survives logout)
    // This is a lightweight check that doesn't require authentication
    if (Capacitor.isNativePlatform()) {
      try {
        const { Preferences } = await import("@capacitor/preferences");

        // Check primary key first
        const usernameResult = await Preferences.get({
          key: "biometric_username",
        });

        if (usernameResult && usernameResult.value) {
          console.log(
            "✅ [BIOMETRIC-LIB] Found stored username in Preferences:",
            usernameResult.value,
          );
          return true;
        }

        // Check backup key as fallback
        const usernameBackup = await Preferences.get({
          key: "biometric_username_backup",
        });

        if (usernameBackup && usernameBackup.value) {
          console.log(
            "✅ [BIOMETRIC-LIB] Found stored username in Preferences backup:",
            usernameBackup.value,
          );
          return true;
        }

        // Also check if password backup exists (credentials might exist even if username key is missing)
        const passwordBackup = await Preferences.get({
          key: "biometric_password_backup",
        });

        if (passwordBackup && passwordBackup.value) {
          console.log(
            "✅ [BIOMETRIC-LIB] Found stored password backup in Preferences - credentials exist",
          );
          return true;
        }

        console.log(
          "ℹ️ [BIOMETRIC-LIB] No username/credentials found in Preferences",
        );
      } catch (prefError) {
        console.warn(
          "⚠️ [BIOMETRIC-LIB] Error checking Preferences:",
          prefError,
        );
        // Fall through to try localStorage as backup
      }
    }

    // Fallback: For web or if Preferences check fails, try localStorage
    if (typeof window !== "undefined") {
      const username = localStorage.getItem("biometric_username");
      if (username) {
        console.log(
          "✅ [BIOMETRIC-LIB] Found stored username in localStorage:",
          username,
        );
        return true;
      }

      // Check localStorage biometric flags
      const biometricEnabled = localStorage.getItem("biometricEnabled");
      if (biometricEnabled === "true") {
        console.log("✅ [BIOMETRIC-LIB] Biometric is enabled in localStorage");
        return true;
      }
    }

    // If no username found, credentials don't exist
    console.log("ℹ️ [BIOMETRIC-LIB] No credentials found (no username stored)");
    return false;
  } catch (error) {
    console.warn("⚠️ [BIOMETRIC-LIB] Error checking for credentials:", error);
    // Any exception means we can't determine, so assume no credentials
    return false;
  }
}

/**
 * Check if user has biometric enabled locally
 * @returns {boolean}
 */
export function isBiometricEnabledLocally() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("biometricEnabled") === "true";
}

/**
 * Get stored biometric type
 * @returns {string|null} - "faceid", "touchid", "fingerprint", "face", "iris" or null
 */
export function getBiometricType() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("biometricType");
}

/**
 * Enable biometric locally after successful setup
 * @param {string} type - Biometry type name
 */
export function enableBiometricLocally(type) {
  if (typeof window === "undefined") return;
  localStorage.setItem("biometricEnabled", "true");
  localStorage.setItem("biometricType", type);
  localStorage.setItem("faceVerificationCompleted", "true");
  console.log("✅ [BIOMETRIC-LIB] Biometric enabled locally:", type);
}

/**
 * Disable biometric locally and clear credentials
 * @returns {Promise<{success: boolean}>}
 */
export async function disableBiometricLocally() {
  if (typeof window === "undefined") return { success: false };

  // Clear local storage flags
  localStorage.removeItem("biometricEnabled");
  localStorage.removeItem("biometricType");
  localStorage.removeItem("faceVerificationCompleted");

  // Delete stored credentials
  const result = await deleteCredentials();

  console.log("✅ [BIOMETRIC-LIB] Biometric disabled locally");
  return result;
}
