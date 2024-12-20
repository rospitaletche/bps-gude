// src/components/FileUploader.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import {
  setRingData,
  setApiaData,
  setLoadingRing,
  setLoadingApia,
} from '../store/dataSlice';

const FileUploader = () => {
  const dispatch = useDispatch();
  const loadingRing = useSelector((state) => state.data.loadingRing);
  const loadingApia = useSelector((state) => state.data.loadingApia);

  const handleRingUpload = (file) => {
    if (!file) return;
    dispatch(setLoadingRing(true)); // Inicia la carga
    readExcel(file, (data) => dispatch(setRingData(data)));
  };

  const handleApiaUpload = (file) => {
    if (!file) return;
    dispatch(setLoadingApia(true)); // Inicia la carga
    readExcel(file, (data) => dispatch(setApiaData(data)), 1);
  };

  const readExcel = (file, callback, sheetIndex = 0) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: 'binary' });
      const sheetName = workbook.SheetNames[sheetIndex];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      callback(jsonData);
    };
    reader.readAsBinaryString(file);
  };

  const triggerFileInput = (id) => {
    document.getElementById(id).click();
  };

  return (
    <div className="upload-buttons">
      <div className="upload-button">
        <label htmlFor="ring-upload"></label>
        <input
          type="file"
          id="ring-upload"
          accept=".xlsx, .xls"
          onChange={(e) => handleRingUpload(e.target.files[0])}
        />
        <button 
          className="btn btn-secondary"
          onClick={() => triggerFileInput('ring-upload')}>
          {loadingRing ? 'Cargando...' : 'Jubilaciones'}
        </button>
      </div>
      <hr />
      <div className="upload-button">
        <label htmlFor="apia-upload"></label>
        <input
          type="file"
          id="apia-upload"
          accept=".xlsx, .xls"
          onChange={(e) => handleApiaUpload(e.target.files[0])}
        />
        <button 
          className="btn btn-secondary btn-primary--complementary"
          onClick={() => triggerFileInput('apia-upload')}
        >
          {loadingApia ? 'Cargando...' : 'Subir archivo APIA'}
        </button>
      </div>
    </div>
  );
};

export default FileUploader;
