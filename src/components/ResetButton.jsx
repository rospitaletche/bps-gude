// src/components/ResetButton.jsx
import React from 'react';
import { useDispatch } from 'react-redux';
import { resetAllProcessedData, resetGeneratedDocument } from '../store/dataSlice';

const ResetButton = () => {
  const dispatch = useDispatch();

  const handleReset = () => {
    dispatch(resetAllProcessedData());
    dispatch(resetGeneratedDocument());
  };

  return (
    <button 
          className="btn btn-invert"
          onClick={handleReset}>
      Resetear
    </button>
  );
};

export default ResetButton;
