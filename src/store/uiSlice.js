// src/store/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoggedIn: false,
  department: null,
  sidebarCollapsed: false,
  selectedSidebarItem: 'Pasivos',
  selectedHeaderItem: 'InformePasivos',
  selectedPage: 'InformePasivos',
  filterOption: 'all', // 'all', 'info', 'safe'
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
      state.selectedHeaderItem = null;
      state.selectedPage = null;
    },
    setSelectedHeaderItem(state, action) {
      state.selectedHeaderItem = action.payload;
    },
    setSelectedPage(state, action) {
      state.selectedPage = action.payload;
    },
    setFilterOption(state, action) {
      state.filterOption = action.payload;
    },
    login(state, action) {
      state.isLoggedIn = true;
      state.department = action.payload;
    },
    logout(state) {
      state.isLoggedIn = false;
      state.department = null;
      state.selectedSidebarItem = null;
      state.selectedHeaderItem = null;
      state.selectedPage = null;
      state.filterOption = 'all';
    },
  },
});

export const {
  toggleSidebar,
  setSelectedSidebarItem,
  setSelectedHeaderItem,
  setSelectedPage,
  setFilterOption,
  login,
  logout,
} = uiSlice.actions;

export default uiSlice.reducer;
