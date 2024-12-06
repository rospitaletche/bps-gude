// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './uiSlice';
import dataReducer from './dataSlice';

const store = configureStore({
  reducer: {
    ui: uiReducer,
    data: dataReducer,
  },
});

export default store;

