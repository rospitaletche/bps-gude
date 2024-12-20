// src/components/FileUploaderSecondRing.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import { setRingPVData, setRingPIData, setLoadingRingPV, setLoadingRingPI } from '../store/dataSlice';

const FileUploaderSecondRing = () => {
  const dispatch = useDispatch();
  const loadingRingPV = useSelector((state) => state.data.loadingRingPV);
  const loadingRingPI = useSelector((state) => state.data.loadingRingPI);

  const readExcel = (file, callback, sheetIndex = 0) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const binaryStr = event.target.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const sheetName = workbook.SheetNames[sheetIndex];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        callback(jsonData);
      } catch (error) {
        console.error('Error al leer el archivo Excel:', error);
        alert('Ocurrió un error al procesar el archivo. Asegúrate de que sea un archivo Excel válido.');
        if (sheetIndex === 0) dispatch(setLoadingRingPV(false));
        if (sheetIndex === 1) dispatch(setLoadingRingPI(false));
      }
    };
    reader.readAsBinaryString(file);
  };

  const handlePVUpload = (file) => {
    if (!file) return;
    dispatch(setLoadingRingPV(true));
    readExcel(file, (data) => dispatch(setRingPVData(data)), 0); // Hoja 0 = PV
  };

  const handlePIUpload = (file) => {
    if (!file) return;
    dispatch(setLoadingRingPI(true));
    readExcel(file, (data) => dispatch(setRingPIData(data)), 1); // Hoja 1 = PCUC
  };

  const triggerFileInput = (id) => {
    document.getElementById(id).click();
  };

  return (
    <div className="upload-buttons">
      <div className="upload-button">
        <input
          type="file"
          id="pv-upload"
          accept=".xlsx, .xls"
          onChange={(e) => handlePVUpload(e.target.files[0])}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => triggerFileInput('pv-upload')}
          className="btn btn-secondary"
          disabled={loadingRingPV}
        >
          {loadingRingPV ? 'Cargando...' : 'Pensión Vejez'}
        </button>
      </div>

      <div className="upload-button">
        <div className="upload-button">
          <input
            type="file"
            id="pi-upload"
            accept=".xlsx, .xls"
            onChange={(e) => handlePIUpload(e.target.files[0])}
            style={{ display: 'none' }}
          />
        </div>
        <div className="upload-button">
          <button
            onClick={() => triggerFileInput('pi-upload')}
            className="btn btn-secondary"
            disabled={loadingRingPI}
          >
            {loadingRingPI ? 'Cargando...' : 'Pensión Invalidez'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploaderSecondRing;
