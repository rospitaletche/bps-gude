// src/store/dataSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  ringData: [],
  apiaData: [],
  processedData: [],
  loadingRing: false,
  loadingApia: false,
  processingData: false,
  generatedDocument: null, // Nuevo estado para almacenar la URL del documento
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
  setGeneratedDocument, // Nueva acción
  resetGeneratedDocument, // Nueva acción opcional
} = dataSlice.actions;

export default dataSlice.reducer;
