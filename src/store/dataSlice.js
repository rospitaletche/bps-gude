// src/store/dataSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Primer RING
  ringData: [],
  apiaData: [],
  processedData: [],
  loadingRing: false,
  loadingApia: false,
  processingData: false,

  // Segundo RING: Pensión Vejez (PV) y Pensión Invalidez (PI)
  ringPVData: [],    // Hoja 0
  ringPIData: [],    // Hoja 1
  loadingRingPV: false,
  loadingRingPI: false,

  // Documento generado
  generatedDocument: null,
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    // Primer RING
    setRingData(state, action) {
      state.ringData = action.payload;
      state.loadingRing = false;
    },
    setApiaData(state, action) {
      state.apiaData = action.payload;
      state.loadingApia = false;
    },
    setProcessedData(state, action) {
      state.processedData = action.payload;
      state.processingData = false;
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

    // Segundo RING
    setRingPVData(state, action) {
      state.ringPVData = action.payload;
      state.loadingRingPV = false;
    },
    setRingPIData(state, action) {
      state.ringPIData = action.payload;
      state.loadingRingPI = false;
    },
    setLoadingRingPV(state, action) {
      state.loadingRingPV = action.payload;
    },
    setLoadingRingPI(state, action) {
      state.loadingRingPI = action.payload;
    },

    // Documento
    setGeneratedDocument(state, action) {
      state.generatedDocument = action.payload;
    },
    resetGeneratedDocument(state) {
      state.generatedDocument = null;
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

  setRingPVData,
  setRingPIData,
  setLoadingRingPV,
  setLoadingRingPI,

  setGeneratedDocument,
  resetGeneratedDocument,
} = dataSlice.actions;

export default dataSlice.reducer;
