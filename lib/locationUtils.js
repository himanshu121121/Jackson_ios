/**
 * Get city and country from coordinates using multiple reverse geocoding services
 * Enhanced for Android compatibility with proper timeout handling
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<{city: string, country: string, region: string, timezone: string}>} Location information
 */
export const getCityAndCountry = async (latitude, longitude) => {
  const defaultResult = {
    city: "Unknown",
    country: "Unknown",
    region: "Unknown",
    timezone: "Asia/Kolkata",
  };

  try {
    // Android-optimized geocoding services with proper timeout handling
    const geocodingPromises = [
      // Service 1: BigDataCloud (free, no API key needed) - Most reliable
      createGeocodingRequest(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
        (data) => ({
          city: data.city || data.locality || data.principalSubdivision,
          country: data.countryName || data.countryCode,
          region: data.principalSubdivision || data.administrativeArea,
          timezone:
            data.localityInfo?.administrative?.[0]?.timezone || "Asia/Kolkata",
          service: "BigDataCloud",
        }),
        8000, // 8 second timeout
      ),

      // Service 2: OpenStreetMap Nominatim (free, no API key needed)
      createGeocodingRequest(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
        (data) => ({
          city:
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.municipality,
          country: data.address?.country,
          region: data.address?.state || data.address?.county,
          timezone: "Asia/Kolkata", // Nominatim doesn't provide timezone
          service: "Nominatim",
        }),
        10000, // 10 second timeout
      ),

      // Service 3: IP-API (fallback for network-based location)
      createGeocodingRequest(
        `https://ip-api.com/json/`,
        (data) => ({
          city: data.city || "Unknown",
          country: data.country || "Unknown",
          region: data.regionName || "Unknown",
          timezone: data.timezone || "Asia/Kolkata",
          service: "IP-API",
        }),
        5000, // 5 second timeout
      ),
    ];

    // Use the first successful response
    const results = await Promise.allSettled(geocodingPromises);
    const successfulResult = results.find(
      (result) =>
        result.status === "fulfilled" &&
        result.value &&
        result.value.city !== undefined &&
        result.value.city !== null &&
        result.value.city !== "" &&
        result.value.city !== "Unknown",
    );

    if (successfulResult) {
      const { city, country, region, timezone } = successfulResult.value;
      return {
        city: city || "Unknown",
        country: country || "Unknown",
        region: region || "Unknown",
        timezone: timezone || "Asia/Kolkata",
      };
    } else {
      return defaultResult;
    }
  } catch (error) {
    return defaultResult;
  }
};

/**
 * Create a geocoding request with proper timeout handling for Android
 * @param {string} url - The geocoding service URL
 * @param {Function} dataProcessor - Function to process the response data
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise} Promise that resolves with processed location data
 */
const createGeocodingRequest = (url, dataProcessor, timeout = 10000) => {
  return new Promise(async (resolve, reject) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      reject(new Error(`Request timeout after ${timeout}ms`));
    }, timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "JacksonRewardsApp/1.0 (Android)",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const processedData = dataProcessor(data);
      resolve(processedData);
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
};

/**
 * Format city and country names for consistent display
 * @param {string} city - City name
 * @param {string} country - Country name
 * @returns {Object} Formatted location data
 */
export const formatLocationData = (city, country) => {
  return {
    city: city?.trim() || "Unknown",
    country: country?.trim() || "Unknown",
    displayName: `${city?.trim() || "Unknown"}, ${
      country?.trim() || "Unknown"
    }`,
    shortName: city?.trim() || "Unknown",
  };
};

/**
 * Validate location data before sending to API
 * @param {Object} locationData - Location data object
 * @returns {Object} Validated location data
 */
export const validateLocationData = (locationData) => {
  const { latitude, longitude, city, country } = locationData;

  // Validate coordinates
  if (
    !latitude ||
    !longitude ||
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error("Invalid coordinates provided");
  }

  // Format and validate city/country
  const formattedLocation = formatLocationData(city, country);

  return {
    latitude: Number(latitude.toFixed(6)), // Round to 6 decimal places
    longitude: Number(longitude.toFixed(6)),
    city: formattedLocation.city,
    country: formattedLocation.country,
  };
};

/**
 * Fallback location detection for Android devices when GPS fails
 * Uses network-based location detection as a backup
 * @returns {Promise<{latitude: number, longitude: number, accuracy: number}>} Fallback location data
 */
export const getFallbackLocation = async () => {
  try {
    // Try to get location from IP-based services
    const ipServices = [
      "https://ipapi.co/json/",
      "https://api.ipify.org?format=json",
      "https://ip-api.com/json/",
    ];

    for (const service of ipServices) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(service, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "User-Agent": "JacksonRewardsApp/1.0 (Android)",
            "Cache-Control": "no-cache",
          },
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();

          // Extract coordinates from different service formats
          let latitude,
            longitude,
            accuracy = 10000;

          if (data.latitude && data.longitude) {
            latitude = parseFloat(data.latitude);
            longitude = parseFloat(data.longitude);
          } else if (data.lat && data.lon) {
            latitude = parseFloat(data.lat);
            longitude = parseFloat(data.lon);
          } else if (data.query) {
            const coords = data.query.split(",");
            if (coords.length === 2) {
              latitude = parseFloat(coords[0]);
              longitude = parseFloat(coords[1]);
            }
          }

          if (latitude && longitude && !isNaN(latitude) && !isNaN(longitude)) {
            return {
              latitude,
              longitude,
              accuracy,
              source: "network",
              service: service,
            };
          }
        }
      } catch (serviceError) {
        continue;
      }
    }

    // Default location (New Delhi, India)
    return {
      latitude: 28.6139,
      longitude: 77.209,
      accuracy: 50000,
      source: "default",
      service: "fallback",
    };
  } catch (error) {
    return {
      latitude: 28.6139,
      longitude: 77.209,
      accuracy: 50000,
      source: "default",
      service: "fallback",
    };
  }
};

/**
 * Enhanced location detection with GPS and fallback for Android
 * @returns {Promise<{latitude: number, longitude: number, accuracy: number, source: string}>} Location data
 */
export const getEnhancedLocation = async () => {
  try {
    // First try GPS location
    const { Geolocation } = await import("@capacitor/geolocation");

    // Check permissions first
    const permissionStatus = await Geolocation.requestPermissions();
    if (permissionStatus.location !== "granted") {
      throw new Error("Location permission not granted");
    }

    // Try GPS location with Android-optimized settings
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0,
      requireAltitude: false,
      requireSpeed: false,
      requireHeading: false,
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy || 10,
      source: "gps",
      timestamp: position.timestamp,
    };
  } catch (gpsError) {
    // Try fallback location detection
    const fallbackLocation = await getFallbackLocation();
    return fallbackLocation;
  }
};

/**
 * Get location display information for UI
 * @param {Object} locationData - Location data from API
 * @returns {Object} Display information
 */
export const getLocationDisplayInfo = (locationData) => {
  if (!locationData) {
    return {
      primary: "Location not available",
      secondary: "Tap to enable location",
      icon: "📍",
    };
  }

  const { city, country, latitude, longitude } = locationData;

  return {
    primary: city && country ? `${city}, ${country}` : "Location available",
    secondary:
      latitude && longitude
        ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        : "Coordinates not available",
    icon: "📍",
    fullLocation: {
      city: city || "Unknown",
      country: country || "Unknown",
      coordinates: {
        latitude: latitude || 0,
        longitude: longitude || 0,
      },
    },
  };
};
