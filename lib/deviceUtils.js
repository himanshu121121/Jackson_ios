/**
 * Device Utilities for Fraud Prevention
 * Provides device information for Verisoul fraud detection
 */

/**
 * Get device ID - uses Capacitor Device ID or generates a persistent ID
 * @returns {Promise<string>} Device ID
 */
export const getDeviceId = async () => {
  if (typeof window === "undefined") return "unknown";

  try {
    // Try to use Capacitor Device plugin for native device ID
    if (window.Capacitor && window.Capacitor.isNativePlatform()) {
      try {
        const { Device } = await import("@capacitor/device");
        const deviceInfo = await Device.getId();
        if (deviceInfo?.identifier) {
          // Store in localStorage for persistence
          localStorage.setItem("deviceId", deviceInfo.identifier);
          return deviceInfo.identifier;
        }
      } catch (error) {
        console.warn(
          "⚠️ [DeviceUtils] Failed to get Capacitor device ID:",
          error,
        );
      }
    }

    // Fallback: Use stored device ID or generate one
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      // Generate a persistent device ID
      deviceId = `web_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem("deviceId", deviceId);
    }
    return deviceId;
  } catch (error) {
    console.error("❌ [DeviceUtils] Error getting device ID:", error);
    return "unknown";
  }
};

/**
 * Get device metadata for fraud prevention
 * @returns {Promise<Object>} Device metadata object
 */
export const getDeviceMetadata = async () => {
  if (typeof window === "undefined") {
    return {
      deviceId: "unknown",
      appVersion: "1.0.0",
      deviceModel: "unknown",
      osVersion: "unknown",
    };
  }

  const deviceId = await getDeviceId();
  const userAgent = navigator.userAgent || "unknown";

  // Detect platform and device model
  let deviceModel = "Unknown Device";
  let osVersion = "Unknown";
  let platform = "web";

  if (window.Capacitor && window.Capacitor.isNativePlatform()) {
    platform = "mobile";
    try {
      const { Device } = await import("@capacitor/device");
      const deviceInfo = await Device.getInfo();
      deviceModel = deviceInfo.model || deviceInfo.name || "Unknown Device";
      osVersion = deviceInfo.osVersion || "Unknown";
    } catch (error) {
      console.warn(
        "⚠️ [DeviceUtils] Failed to get Capacitor device info:",
        error,
      );
      // Fallback to user agent parsing
      if (/Android/i.test(userAgent)) {
        const match = userAgent.match(/Android\s([0-9\.]*)/);
        osVersion = match ? match[1] : "Unknown";
        const modelMatch = userAgent.match(/\(([^)]+)\)/);
        deviceModel = modelMatch ? modelMatch[1] : "Android Device";
      } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
        const match = userAgent.match(/OS\s([0-9_]*)/);
        osVersion = match ? match[1].replace(/_/g, ".") : "Unknown";
        deviceModel = /iPad/i.test(userAgent) ? "iPad" : "iPhone";
      }
    }
  } else {
    // Web platform
    platform = "web";
    if (/Android/i.test(userAgent)) {
      const match = userAgent.match(/Android\s([0-9\.]*)/);
      osVersion = match ? match[1] : "Unknown";
      const modelMatch = userAgent.match(/\(([^)]+)\)/);
      deviceModel = modelMatch ? modelMatch[1] : "Android Device";
    } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
      const match = userAgent.match(/OS\s([0-9_]*)/);
      osVersion = match ? match[1].replace(/_/g, ".") : "Unknown";
      deviceModel = /iPad/i.test(userAgent) ? "iPad" : "iPhone";
    } else if (/Windows/i.test(userAgent)) {
      const match = userAgent.match(/Windows NT\s([0-9\.]*)/);
      osVersion = match ? match[1] : "Unknown";
      deviceModel = "Windows PC";
    } else if (/Mac/i.test(userAgent)) {
      const match = userAgent.match(/Mac OS X\s([0-9_\.]*)/);
      osVersion = match ? match[1].replace(/_/g, ".") : "Unknown";
      deviceModel = "Mac";
    } else if (/Linux/i.test(userAgent)) {
      osVersion = "Linux";
      deviceModel = "Linux PC";
    }
  }

  // Get app version from package.json or localStorage
  let appVersion = "1.0.0";
  try {
    // Try to get from build config or environment
    if (
      typeof process !== "undefined" &&
      process.env?.NEXT_PUBLIC_APP_VERSION
    ) {
      appVersion = process.env.NEXT_PUBLIC_APP_VERSION;
    } else {
      appVersion = localStorage.getItem("appVersion") || "1.0.0";
    }
  } catch (error) {
    // Use default
  }

  return {
    deviceId,
    appVersion,
    deviceModel,
    osVersion,
    platform,
    userAgent,
    language: navigator.language || "en",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  };
};

/**
 * Format phone number to E.164 format
 * @param {string} countryCode - Country code (e.g., "1", "91")
 * @param {string} phoneNumber - Phone number without country code
 * @returns {string} Formatted phone number in E.164 format
 */
export const formatPhoneToE164 = (countryCode, phoneNumber) => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, "");

  // Remove leading country code if already present
  let number = cleaned;
  if (number.startsWith(countryCode)) {
    number = number.substring(countryCode.length);
  }

  // Format as E.164: +[countryCode][number]
  return `+${countryCode}${number}`;
};

/**
 * Validate phone number format (E.164)
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} True if valid E.164 format
 */
export const validateE164Phone = (phoneNumber) => {
  // E.164 format: +[countryCode][number] (max 15 digits after +)
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phoneNumber);
};

/**
 * Generate Verisoul session ID (if not provided by SDK)
 * @returns {string} Session ID
 */
export const generateVerisoulSessionId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `verisoul_${timestamp}_${random}`;
};

/**
 * Get stored Verisoul session ID or generate new one
 * @returns {string} Session ID
 */
export const getOrCreateVerisoulSessionId = () => {
  if (typeof window === "undefined") return generateVerisoulSessionId();

  try {
    let sessionId = localStorage.getItem("verisoul_session_id");
    if (!sessionId) {
      sessionId = generateVerisoulSessionId();
      localStorage.setItem("verisoul_session_id", sessionId);
    }
    return sessionId;
  } catch (error) {
    console.error("❌ [DeviceUtils] Error getting Verisoul session ID:", error);
    return generateVerisoulSessionId();
  }
};

/**
 * Clear Verisoul session ID
 */
export const clearVerisoulSessionId = () => {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("verisoul_session_id");
    } catch (error) {
      console.error(
        "❌ [DeviceUtils] Error clearing Verisoul session ID:",
        error,
      );
    }
  }
};
