import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getFinancialGoals,
  updateFinancialGoals as apiUpdateFinancialGoals,
} from "@/lib/api";

const calculateSummaryFromGoals = (goals) => {
  return {
    salary: goals.salary ?? 0,
    expense: (goals.rent ?? 0) + (goals.food ?? 0),
    savings: goals.savings ?? 0,
    goals: goals.revenueGoal ?? 0,
  };
};

export const fetchFinancialGoals = createAsyncThunk(
  "cashCoach/fetchFinancialGoals",
  async (token, { rejectWithValue }) => {
    try {
      const data = await getFinancialGoals(token);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch financial goals",
      );
    }
  },
);

export const updateFinancialGoals = createAsyncThunk(
  "cashCoach/updateFinancialGoals",
  async ({ goalsData, token }, { rejectWithValue }) => {
    try {
      const data = await apiUpdateFinancialGoals(goalsData, token);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update goals");
    }
  },
);

const initialState = {
  summary: {
    salary: 0,
    expense: 0,
    savings: 0,
    goals: 0,
  },
  goals: {
    salary: 40,
    rent: 40,
    food: 40,
    savings: 40,
    revenueGoal: 40,
  },
  status: "idle",
  error: null,
};

const cashCoachSlice = createSlice({
  name: "cashCoach",
  initialState,
  reducers: {
    setGoalsLocally: (state, action) => {
      state.goals = { ...state.goals, ...action.payload };
      state.summary = calculateSummaryFromGoals(state.goals);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFinancialGoals.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchFinancialGoals.fulfilled, (state, action) => {
        state.status = "succeeded";
        const responseData = action.payload.data;

        if (responseData?.financialGoals) {
          // Set default value of 40 for any goal that is 0 or undefined
          state.goals = {
            salary: responseData.financialGoals.salary || 40,
            rent: responseData.financialGoals.rent || 40,
            food: responseData.financialGoals.food || 40,
            savings: responseData.financialGoals.savings || 40,
            revenueGoal: responseData.financialGoals.revenueGoal || 40,
          };
        }

        state.summary = calculateSummaryFromGoals(state.goals);
      })
      .addCase(fetchFinancialGoals.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateFinancialGoals.fulfilled, (state, action) => {
        const responseData = action.payload?.data;
        if (responseData?.financialGoals) {
          state.goals = responseData.financialGoals;
        }
        state.summary = calculateSummaryFromGoals(state.goals);
      });
  },
});

export const { setGoalsLocally } = cashCoachSlice.actions;

export default cashCoachSlice.reducer;
