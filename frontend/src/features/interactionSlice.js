import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  interactions: [],
  loading: false,
};

const interactionSlice = createSlice({
  name: "interaction",
  initialState,
  reducers: {
    setInteractions: (state, action) => {
      state.interactions = action.payload;
    },
  },
});

export const { setInteractions } = interactionSlice.actions;
export default interactionSlice.reducer;