// src/store/dataSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  ringData: [],
  apiaData: [],
  processedData: [],
  loadingRing: false,
  loadingApia: false,
  processingData: false,
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setRingData(state, action) {
      state.ringData = action.payload;
      state.loadingRing = false; // Termina la carga
    },
    setApiaData(state, action) {
      state.apiaData = action.payload;
      state.loadingApia = false; // Termina la carga
    },
    setProcessedData(state, action) {
      state.processedData = action.payload;
      state.processingData = false; // Termina el procesamiento
    },
    setLoadingRing(state, action) {
      state.loadingRing = action.payload;
    },
    setLoadingApia(state, action) {
      state.loadingApia = action.payload;
    },
    setProcessingData(state, action) {
      state.processingData = action.payload;
    },
  },
});

export const {
  setRingData,
  setApiaData,
  setProcessedData,
  setLoadingRing,
  setLoadingApia,
  setProcessingData,
} = dataSlice.actions;

export default dataSlice.reducer;
