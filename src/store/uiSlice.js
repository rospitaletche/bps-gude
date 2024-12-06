// src/store/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarCollapsed: true,
  selectedSidebarItem: null,
  selectedHeaderItem: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSelectedSidebarItem(state, action) {
      state.selectedSidebarItem = action.payload;
      // Resetear el item del header cada vez que cambie el sidebar
      state.selectedHeaderItem = null;
    },
    setSelectedHeaderItem(state, action) {
      state.selectedHeaderItem = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSelectedSidebarItem,
  setSelectedHeaderItem,
} = uiSlice.actions;

export default uiSlice.reducer;
