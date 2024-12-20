// src/components/Results.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setProcessedData, setProcessingData } from '../store/dataSlice';
import ResultCard from './ResultCard';
import LoadingSpinner from './LoadingSpinner';
import { parseDate } from '../utils/dateUtils';
import { formatDocumento } from '../utils/formatUtils';

const Results = () => {
  const dispatch = useDispatch();
  const ringData = useSelector((state) => state.data.ringData);
  const ringPVData = useSelector((state) => state.data.ringPVData);
  const ringPIData = useSelector((state) => state.data.ringPIData);
  const apiaData = useSelector((state) => state.data.apiaData);
  const processedData = useSelector((state) => state.data.processedData);
  const processingData = useSelector((state) => state.data.processingData);
  const filterOption = useSelector((state) => state.ui.filterOption);
  const department = useSelector((state) => state.ui.department);

  const PLAZO_JC = parseInt(import.meta.env.VITE_PLAZO_JC, 10);
  const PLAZO_PCUC = parseInt(import.meta.env.VITE_PLAZO_PCUC, 10);
  const PLAZO_AVISO = parseInt(import.meta.env.VITE_PLAZO_AVISO, 10);
  const PLAZO_PV = parseInt(import.meta.env.VITE_PLAZO_PV, 10); // Plazo para PV
  const PLAZO_PI = parseInt(import.meta.env.VITE_PLAZO_PI, 10); // Plazo para PV

  const fechaActual = new Date();

  const diasAtraso = (fechaSolicitud) => {
    const fecha = parseDate(fechaSolicitud);
    if (!fecha || isNaN(fecha.getTime())) return 0;
    const diffTime = fechaActual - fecha;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const findNroDoc = (item) => {
    // Busca una key que contenga 'nro_doc'
    for (const key of Object.keys(item)) {
      if (key.toLowerCase().includes('nro_doc')) {
        return item[key];
      }
    }
    return null;
  };

  const processRINGData = (data, codTipoLogic) => {
    // codTipoLogic es una función que determina codTipo según el set de datos
    const filtered = department === 'MONTEVIDEO'
      ? data
      : data.filter((item) =>
          item['departamento'] &&
          item['departamento'].toUpperCase() === department.toUpperCase()
        );

    return filtered.map((ringItem) => {
      let codTipo = 1; // default jubilacion comun
      let plazo = PLAZO_JC;

      if (codTipoLogic) {
        const result = codTipoLogic(ringItem);
        codTipo = result.codTipo;
        plazo = result.plazo;
      } else {
        // Logica original del primer RING
        const cTipo = parseInt(ringItem['cod_tipo_solicitud'], 10);
        if (cTipo === 9) {
          codTipo = 9;
          plazo = PLAZO_PCUC;
        } else if ([1, 25, 26].includes(cTipo)) {
          codTipo = cTipo; // mantiene codTipo 1,25,26 asimilable a JC
          plazo = PLAZO_JC;
        } else {
          codTipo = cTipo || 0;
          plazo = PLAZO_JC;
        }
      }

      const nroDoc = codTipoLogic ? findNroDoc(ringItem) : ringItem['nro_doc'];
      const asuntoDoc = nroDoc?.toString() || '';

      const apiaMatches = apiaData.filter((apiaItem) => {
        const asunto = apiaItem['Asunto'] || '';
        const docInAsunto = asunto.split(' ')[0];
        return docInAsunto === asuntoDoc;
      });

      const fechaSolicitud = ringItem['fecha_solicitud'];
      const parsedFechaSolicitud = fechaSolicitud
        ? parseDate(fechaSolicitud)
        : null;

      const atraso = parsedFechaSolicitud
        ? diasAtraso(parsedFechaSolicitud)
        : 0;

      let styleOption = '';
      if (codTipo === 9) { // PCUC
        if (atraso >= plazo) styleOption = 'danger';
        else if (atraso >= plazo - PLAZO_AVISO) styleOption = 'info';
      } else if ([1,25,26].includes(codTipo) || codTipo === 1) { // JC o PV asimilable a JC
        if (atraso >= plazo) styleOption = 'danger';
        else if (atraso >= plazo - PLAZO_AVISO) styleOption = 'info';
      }

      return {
        nro_doc: formatDocumento(nroDoc),
        nombre: `${ringItem['nomb_1'] || ''} ${ringItem['nomb_2'] || ''} ${ringItem['apel_1'] || ''} ${ringItem['apel_2'] || ''}`.trim(),
        fecha_solicitud: parsedFechaSolicitud
          ? parsedFechaSolicitud.toLocaleDateString('es-ES')
          : 'Fecha no disponible',
        dias_atraso: atraso,
        apiaMatches: apiaMatches.map((apiaItem) => ({
          nro_expediente: apiaItem['Nro. expediente'],
          usuario_actual: apiaItem['Usuario actual'],
          cant_dias: apiaItem['Cant. días'],
        })),
        desc_tipo_solic: ringItem['desc_tipo_solic'] || '',
        cod_tipo_solicitud: codTipo.toString(),
        styleOption,
      };
    });
  };

  // Función para lógica PV
  const codTipoLogicPV = () => {
    // PV = codTipo = 1 (asimilar JC), plazo = PLAZO_PV
    return { codTipo: 1, plazo: PLAZO_PV };
  };

  // Función para lógica PI
  const codTipoLogicPI = () => {
    // PI = codTipo = 9 (PCUC), plazo = PLAZO_PCUC
    return { codTipo: 9, plazo: PLAZO_PCUC };
  };

  useEffect(() => {
    // Siempre que cambien los datos, procesamos todo
    if (ringData.length > 0 || ringPVData.length > 0 || ringPIData.length > 0 || apiaData.length > 0) {
      dispatch(setProcessingData(true));

      // Procesa ringData con lógica original (cod_tipo_solicitud)
      const result1 = ringData.length > 0 ? processRINGData(ringData, null) : [];

      // Procesa ringPVData (Pensión Vejez) con lógica PV
      const resultPV = ringPVData.length > 0 ? processRINGData(ringPVData, codTipoLogicPV) : [];

      // Procesa ringPIData (Pensión Invalidez) con lógica PI
      const resultPI = ringPIData.length > 0 ? processRINGData(ringPIData, codTipoLogicPI) : [];

      const combined = [...result1, ...resultPV, ...resultPI];
      combined.sort((a, b) => a.dias_atraso - b.dias_atraso);

      setTimeout(() => {
        dispatch(setProcessedData(combined));
      }, 500);
    }
  }, [ringData, ringPVData, ringPIData, apiaData, department, dispatch]);

  if (processingData) {
    return (
      <div className="result-container">
        <LoadingSpinner />
      </div>
    );
  }

  let filteredData = processedData;
  if (filterOption === 'info') {
    filteredData = processedData.filter((item) => item.styleOption === 'info');
  } else if (filterOption === 'safe') {
    filteredData = processedData.filter((item) => item.styleOption !== 'danger');
  }

  if (filteredData.length > 0) {
    return (
      <div className="result-container">
        {filteredData.map((item, index) => (
          <ResultCard key={index} item={item} />
        ))}
      </div>
    );
  }

  return (
    <div className="result-container">
      <p>No hay datos para mostrar.</p>
    </div>
  );
};

export default Results;
