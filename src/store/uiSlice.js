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
      // Resetear el item del header cada vez que cambie el sidebar
      state.selectedHeaderItem = null;
      // Resetear la página seleccionada al cambiar de sidebar
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
      // Opcional: Seleccionar automáticamente el sidebar y header basado en el departamento
      // Por ejemplo, si el departamento es "Informes", seleccionar "Informes" en el sidebar
      // Puedes personalizar esta lógica según tus necesidades
    },
    logout(state) {
      state.isLoggedIn = false;
      state.department = null;
      state.selectedSidebarItem = null;
      state.selectedHeaderItem = null;
      state.selectedPage = null;
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
