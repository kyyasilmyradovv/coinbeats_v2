import { TAcademySendInfo } from "@/types/academy";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

type SliceState = {
  academySendInfo: TAcademySendInfo;
};

const initialState: SliceState = {
  academySendInfo: { offset: 0, limit: 30 },
};

export const academySlice = createSlice({
  name: "academy",
  initialState,
  reducers: {
    setAcademySendInfo(state, action: PayloadAction<TAcademySendInfo>) {
      state.academySendInfo = action.payload;
    },
  },
});

export const { setAcademySendInfo } = academySlice.actions;
export default academySlice.reducer;
