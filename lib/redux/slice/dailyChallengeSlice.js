import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getDailyChallengeCalendar,
  getTodaysChallenge,
  getBonusDays,
  startChallenge,
  completeChallenge,
  selectChallengeGame,
  apiStartChallenge,
  apiCompleteChallenge,
} from "../../api";

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  // Calendar
  calendar: null, // { year, month, monthName, today, calendarDays[] }
  calendarStatus: "idle", // idle | loading | succeeded | failed
  calendarCacheTimestamp: null,
  calendarCacheTTL: 5 * 60 * 1000, // 5 minutes in milliseconds

  // Today
  today: null, // { hasChallenge, challenge, progress, countdown, actions }
  todayStatus: "idle",
  todayCacheTimestamp: null,
  todayCacheTTL: 5 * 60 * 1000, // 5 minutes in milliseconds

  // UI
  modalOpen: false,

  // Streak
  streak: null, // No default values

  // Bonus Days (for progress bar)
  bonusDays: null, // { bonusDays[], currentStreak, totalBonusDays, etc. }
  bonusDaysStatus: "idle", // idle | loading | succeeded | failed
  bonusDaysCacheTimestamp: null,
  bonusDaysCacheTTL: 5 * 60 * 1000, // 5 minutes in milliseconds

  // Completion
  completionStatus: "idle",

  // Error handling
  error: null,
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

/**
 * Fetch daily challenges for user
 * Retrieves historical and current challenge data
 */
export const fetchCalendar = createAsyncThunk(
  "dailyChallenge/fetchCalendar",
  async (
    { year, month, token, force = false, background = false },
    { rejectWithValue, getState },
  ) => {
    try {
      // STALE-WHILE-REVALIDATE: Check cache if not forcing refresh
      if (!force && !background) {
        const state = getState();
        const cachedCalendar = state.dailyChallenge.calendar;
        const cacheTimestamp = state.dailyChallenge.calendarCacheTimestamp;
        const cacheTTL = state.dailyChallenge.calendarCacheTTL;

        // Check if cached calendar matches requested month
        if (
          cachedCalendar &&
          cacheTimestamp &&
          cachedCalendar.year === year &&
          cachedCalendar.month === month
        ) {
          const cacheAge = Date.now() - cacheTimestamp;

          // If cache is fresh (< 5 minutes), return cached data immediately
          if (cacheAge < cacheTTL) {
            // Trigger background refresh if cache is 80% expired (4 minutes)
            // Use a longer delay to prevent infinite loops
            if (cacheAge > cacheTTL * 0.8) {
              setTimeout(() => {
                const { store } = require("@/lib/redux/store");
                store.dispatch(
                  fetchCalendar({
                    year,
                    month,
                    token,
                    background: true,
                  }),
                );
              }, 5000); // Changed from 0ms to 5000ms to prevent infinite loops
            }

            return {
              ...cachedCalendar,
              fromCache: true,
              cacheAge,
            };
          }

          // Cache is stale but exists - return it and refresh in background
          // Trigger background refresh with delay to prevent infinite loops
          setTimeout(() => {
            const { store } = require("@/lib/redux/store");
            store.dispatch(
              fetchCalendar({
                year,
                month,
                token,
                background: true,
              }),
            );
          }, 3000); // Changed from 0ms to 3000ms

          // Return stale cache immediately (stale-while-revalidate pattern)
          return {
            ...cachedCalendar,
            fromCache: true,
            cacheAge,
            stale: true,
          };
        }
      }

      // Fetch fresh data from API
      const response = await getDailyChallengeCalendar(year, month, token);
      if (!response.success)
        throw new Error(response.error || "Calendar error");
      return {
        ...response.data,
        fromCache: false,
        timestamp: Date.now(),
        background,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch calendar");
    }
  },
);

export const fetchToday = createAsyncThunk(
  "dailyChallenge/fetchToday",
  async (
    { token, force = false, background = false },
    { rejectWithValue, getState },
  ) => {
    try {
      // STALE-WHILE-REVALIDATE: Check cache if not forcing refresh
      if (!force && !background) {
        const state = getState();
        const cachedToday = state.dailyChallenge.today;
        const cacheTimestamp = state.dailyChallenge.todayCacheTimestamp;
        const cacheTTL = state.dailyChallenge.todayCacheTTL;

        if (cachedToday && cacheTimestamp) {
          const cacheAge = Date.now() - cacheTimestamp;

          // If cache is fresh (< 5 minutes), return cached data immediately
          if (cacheAge < cacheTTL) {
            // Trigger background refresh if cache is 80% expired (4 minutes)
            // Use a longer delay to prevent infinite loops
            if (cacheAge > cacheTTL * 0.8) {
              setTimeout(() => {
                const { store } = require("@/lib/redux/store");
                store.dispatch(
                  fetchToday({
                    token,
                    background: true,
                  }),
                );
              }, 5000); // Changed from 0ms to 5000ms to prevent infinite loops
            }

            return {
              ...cachedToday,
              fromCache: true,
              cacheAge,
            };
          }

          // Cache is stale but exists - return it and refresh in background
          // Trigger background refresh with delay to prevent infinite loops
          setTimeout(() => {
            const { store } = require("@/lib/redux/store");
            store.dispatch(
              fetchToday({
                token,
                background: true,
              }),
            );
          }, 3000); // Changed from 0ms to 3000ms

          // Return stale cache immediately (stale-while-revalidate pattern)
          return {
            ...cachedToday,
            fromCache: true,
            cacheAge,
            stale: true,
          };
        }
      }

      // Fetch fresh data from API
      const response = await getTodaysChallenge(token);
      if (!response.success) throw new Error(response.error || "Today error");
      return {
        ...response.data,
        fromCache: false,
        timestamp: Date.now(),
        background,
      };
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch today's challenge",
      );
    }
  },
);

export const selectGame = createAsyncThunk(
  "dailyChallenge/selectGame",
  async ({ gameId, token }, { rejectWithValue }) => {
    try {
      const response = await selectChallengeGame(gameId, token);
      if (!response.success)
        throw new Error(response.error || "Select game error");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to select game");
    }
  },
);

export const startTodayChallenge = createAsyncThunk(
  "dailyChallenge/start",
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await startChallenge(token);
      if (!response.success) throw new Error(response.error || "Start error");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to start challenge");
    }
  },
);

/**
 * Complete a daily challenge
 * Updates challenge status and awards rewards
 */
export const completeTodayChallenge = createAsyncThunk(
  "dailyChallenge/complete",
  async ({ challengeId, token }, { rejectWithValue }) => {
    try {
      const response = await completeChallenge(challengeId, token);
      if (!response.success)
        throw new Error(response.error || "Complete challenge error");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to complete challenge");
    }
  },
);

/**
 * Fetch bonus days for progress bar with stale-while-revalidate
 * Returns cached data immediately and refreshes in background
 */
export const fetchBonusDays = createAsyncThunk(
  "dailyChallenge/fetchBonusDays",
  async (
    { token, force = false, background = false } = {},
    { rejectWithValue, getState },
  ) => {
    try {
      // STALE-WHILE-REVALIDATE: Check cache if not forcing refresh
      if (!force && !background) {
        const state = getState();
        const cachedBonusDays = state.dailyChallenge.bonusDays;
        const cacheTimestamp = state.dailyChallenge.bonusDaysCacheTimestamp;
        const cacheTTL = state.dailyChallenge.bonusDaysCacheTTL;

        if (cachedBonusDays && cacheTimestamp) {
          const cacheAge = Date.now() - cacheTimestamp;

          // If cache is fresh (< 5 minutes), return cached data immediately
          if (cacheAge < cacheTTL) {
            // Trigger background refresh if cache is 80% expired (4 minutes)
            // Use a longer delay to prevent infinite loops
            if (cacheAge > cacheTTL * 0.8) {
              setTimeout(() => {
                const { store } = require("@/lib/redux/store");
                store.dispatch(
                  fetchBonusDays({
                    token,
                    background: true,
                  }),
                );
              }, 5000); // Changed from 0ms to 5000ms to prevent infinite loops
            }

            return {
              ...cachedBonusDays,
              fromCache: true,
              cacheAge,
            };
          }

          // Cache is stale but exists - return it and refresh in background
          // Trigger background refresh with delay to prevent infinite loops
          setTimeout(() => {
            const { store } = require("@/lib/redux/store");
            store.dispatch(
              fetchBonusDays({
                token,
                background: true,
              }),
            );
          }, 3000); // Changed from 0ms to 3000ms

          // Return stale cache immediately (stale-while-revalidate pattern)
          return {
            ...cachedBonusDays,
            fromCache: true,
            cacheAge,
            stale: true,
          };
        }
      }

      // Fetch fresh data from API
      const response = await getBonusDays(token);
      if (!response.success)
        throw new Error(response.error || "Bonus days error");
      return {
        ...response.data,
        fromCache: false,
        timestamp: Date.now(),
        background,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch bonus days");
    }
  },
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate mock challenges for development
 */
function generateMockChallenges() {
  const challenges = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    challenges.push({
      id: `challenge_${date.getTime()}`,
      date: date.toISOString(),
      description: "Complete a purchase in any game",
      coinReward: 20,
      xpReward: 50,
      status: i < 5 ? "completed" : "expired",
      completedAt: i < 5 ? date.toISOString() : null,
    });
  }

  return challenges;
}

/**
 * Generate mock completed dates for development
 */
function generateMockCompletedDates() {
  const dates = [];
  const today = new Date();

  // Simulate completed challenges for the last 5 days
  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString());
  }

  return dates;
}

/**
 * Calculate current streak from completed dates
 */
function calculateStreak(completedDates) {
  if (!completedDates || completedDates.length === 0) return 0;

  // Sort dates in descending order
  const sortedDates = completedDates
    .map((d) => new Date(d))
    .sort((a, b) => b - a);

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sortedDates.length; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    checkDate.setHours(0, 0, 0, 0);

    const completedDate = new Date(sortedDates[i]);
    completedDate.setHours(0, 0, 0, 0);

    if (checkDate.getTime() === completedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get end of current day
 */
function getEndOfDay() {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return end.toISOString();
}

// ============================================================================
// SLICE
// ============================================================================

const dailyChallengeSlice = createSlice({
  name: "dailyChallenge",
  initialState,
  reducers: {
    /**
     * Reset daily challenge state
     */
    resetDailyChallengeState: (state) => {
      return initialState;
    },

    /**
     * Update streak manually (for testing)
     */
    setModalOpen: (state, action) => {
      state.modalOpen = action.payload;
    },

    /**
     * Clear error
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Calendar
      .addCase(fetchCalendar.pending, (state, action) => {
        const isBackground = action.meta.arg?.background || false;
        // IMPORTANT: Background refreshes do NOT set loading status
        if (!isBackground) {
          state.calendarStatus = "loading";
        }
        state.error = null;
      })
      .addCase(fetchCalendar.fulfilled, (state, action) => {
        const isBackground = action.meta.arg?.background || false;
        const fromCache = action.payload.fromCache || false;

        // Only update calendar if not from cache (fresh data)
        if (!fromCache) {
          // Remove cache metadata before storing
          const {
            fromCache: _,
            cacheAge: __,
            stale: ___,
            timestamp: ____,
            background: _____,
            ...calendarData
          } = action.payload;
          state.calendar = calendarData;
          state.calendarCacheTimestamp = Date.now();
        }

        // IMPORTANT: Background refreshes do NOT update status
        if (!isBackground) {
          state.calendarStatus = "succeeded";
        }
        if (action.payload?.streak) state.streak = action.payload.streak;
        state.error = null;
      })
      .addCase(fetchCalendar.rejected, (state, action) => {
        const isBackground = action.meta.arg?.background || false;
        // Only update status if not background refresh
        if (!isBackground) {
          state.calendarStatus = "failed";
          state.error = action.payload;
        }
        // Background refresh errors are silent (don't change status)
        // Keep existing data on error to avoid UI flicker
      })

      // Today
      .addCase(fetchToday.pending, (state, action) => {
        const isBackground = action.meta.arg?.background || false;
        // IMPORTANT: Background refreshes do NOT set loading status
        if (!isBackground) {
          state.todayStatus = "loading";
        }
        state.error = null;
      })
      .addCase(fetchToday.fulfilled, (state, action) => {
        const isBackground = action.meta.arg?.background || false;
        const fromCache = action.payload.fromCache || false;

        // Only update today if not from cache (fresh data)
        if (!fromCache) {
          // Remove cache metadata before storing
          const {
            fromCache: _,
            cacheAge: __,
            stale: ___,
            timestamp: ____,
            background: _____,
            ...todayData
          } = action.payload;
          state.today = todayData;
          state.todayCacheTimestamp = Date.now();
        }

        // IMPORTANT: Background refreshes do NOT update status
        if (!isBackground) {
          state.todayStatus = "succeeded";
        }
        state.error = null;
      })
      .addCase(fetchToday.rejected, (state, action) => {
        const isBackground = action.meta.arg?.background || false;
        // Only update status if not background refresh
        if (!isBackground) {
          state.todayStatus = "failed";
          state.error = action.payload;
        }
        // Background refresh errors are silent (don't change status)
        // Keep existing data on error to avoid UI flicker
      })

      // Bonus days (progress bar)
      .addCase(fetchBonusDays.pending, (state, action) => {
        const isBackground = action.meta.arg?.background || false;
        if (!isBackground) {
          state.bonusDaysStatus = "loading";
        }
        state.error = null;
      })
      .addCase(fetchBonusDays.fulfilled, (state, action) => {
        const isBackground = action.meta.arg?.background || false;
        const fromCache = action.payload.fromCache || false;

        if (!fromCache) {
          const {
            fromCache: _fc,
            cacheAge: _ca,
            stale: _s,
            timestamp: _t,
            background: _b,
            ...bonusDaysData
          } = action.payload;
          state.bonusDays = bonusDaysData;
          state.bonusDaysCacheTimestamp = Date.now();
        }

        if (!isBackground) {
          state.bonusDaysStatus = "succeeded";
        }
        state.error = null;
      })
      .addCase(fetchBonusDays.rejected, (state, action) => {
        const isBackground = action.meta.arg?.background || false;
        if (!isBackground) {
          state.bonusDaysStatus = "failed";
          state.error = action.payload;
        }
      })

      // Select game
      .addCase(selectGame.fulfilled, (state, action) => {
        if (!state.today) state.today = {};
        state.today.selectedGame = action.payload.selectedGame;
        // Some APIs include actions.canPlay flag
        if (state.today.actions) {
          state.today.actions.canPlay = !!action.payload.canPlayNow;
        }
      })

      // Start
      .addCase(startTodayChallenge.fulfilled, (state, action) => {
        if (!state.today) return;
        state.today.progress = state.today.progress || {};
        state.today.progress.status = "started";
        // Track when challenge was started (for 10-minute validation)
        if (action.payload?.progress?.startedAt) {
          state.today.progress.startedAt = action.payload.progress.startedAt;
        } else {
          // Fallback: set startedAt to current time if not provided by API
          state.today.progress.startedAt = new Date().toISOString();
        }
        state.today.started = action.payload;
      })

      // Complete
      .addCase(completeTodayChallenge.pending, (state) => {
        state.completionStatus = "submitting";
        state.error = null;
      })
      .addCase(completeTodayChallenge.fulfilled, (state, action) => {
        state.completionStatus = "succeeded";
        if (state.today) {
          state.today.progress = state.today.progress || {};
          state.today.progress.status = "completed";
          state.today.progress.rewardsEarned = action.payload.rewards;
        }
        if (action.payload?.streak) state.streak = action.payload.streak;
      })
      .addCase(completeTodayChallenge.rejected, (state, action) => {
        state.todayStatus = "failed";
        state.error = action.payload;
      });
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export const { resetDailyChallengeState, setModalOpen, clearError } =
  dailyChallengeSlice.actions;

export default dailyChallengeSlice.reducer;
