// src/components/ResultsSecondRing.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setProcessedData2, setProcessingData2 } from '../store/dataSlice';
import ResultCard from './ResultCard';
import LoadingSpinner from './LoadingSpinner';
import { parseDate } from '../utils/dateUtils';
import { formatDocumento } from '../utils/formatUtils';

const ResultsSecondRing = () => {
  const dispatch = useDispatch();
  const ring2Data = useSelector((state) => state.data.ring2Data);
  const apiaData = useSelector((state) => state.data.apiaData);
  const processedData2 = useSelector((state) => state.data.processedData2);
  const processingData2 = useSelector((state) => state.data.processingData2);
  const filterOption2 = useSelector((state) => state.ui.filterOption2);
  const department = useSelector((state) => state.ui.department);

  const PLAZO_PV = parseInt(import.meta.env.VITE_PLAZO_PV, 10); // Plazo para PV
  const PLAZO_PCUC = parseInt(import.meta.env.VITE_PLAZO_PCUC, 10);
  const PLAZO_AVISO = parseInt(import.meta.env.VITE_PLAZO_AVISO, 10);

  // Función para determinar si es PCUC o PV basado en ring2Data
  const isPCUC = () => {
    if (ring2Data.length > 0) {
      const keys = Object.keys(ring2Data[0]);
      return keys.some(k => k.toLowerCase().includes('pension'));
    }
    return false;
  };

  useEffect(() => {
    if (ring2Data.length > 0) {
      dispatch(setProcessingData2(true));

      const fechaActual = new Date();

      const diasAtraso = (fechaSolicitud) => {
        const fecha = parseDate(fechaSolicitud);
        if (!fecha || isNaN(fecha.getTime())) return 0;
        const diffTime = fechaActual - fecha;
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
      };

      // Filtrar por departamento
      const ring2Filtered = department === 'MONTEVIDEO'
        ? ring2Data
        : ring2Data.filter(
            (item) =>
              item['departamento'] &&
              item['departamento'].toUpperCase() === department.toUpperCase()
          );

      const pcuc = isPCUC();
      const codTipo = pcuc ? 9 : 1; // PCUC=9, PV=1
      const plazo = pcuc ? PLAZO_PCUC : PLAZO_PV;

      const findNroDoc = (item) => {
        // Busca una key que contenga 'nro_doc'
        for (const key of Object.keys(item)) {
          if (key.toLowerCase().includes('nro_doc')) {
            return item[key];
          }
        }
        return null;
      };

      let result = ring2Filtered.map((ringItem) => {
        const rawNroDoc = findNroDoc(ringItem);
        if (!rawNroDoc) {
          console.warn('No se encontró nro_doc en:', ringItem);
        }
        const nroDoc = rawNroDoc;

        // Buscar coincidencias en APIA
        const apiaMatches = apiaData.filter((apiaItem) => {
          const asunto = apiaItem['Asunto'] || '';
          const docInAsunto = asunto.split(' ')[0];
          return docInAsunto === (nroDoc?.toString() || '');
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
        } else { // PV
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

      // Ordenar el resultado por días de atraso
      result.sort((a, b) => a.dias_atraso - b.dias_atraso);

      // Simular procesamiento
      setTimeout(() => {
        dispatch(setProcessedData2(result));
        dispatch(setProcessingData2(false));
      }, 1000);
    }
  }, [ring2Data, apiaData, dispatch, PLAZO_PV, PLAZO_PCUC, PLAZO_AVISO, department]);

  if (processingData2) {
    return (
      <div className="result-container">
        <LoadingSpinner />
      </div>
    );
  }

  let filteredData = processedData2;
  if (filterOption2 === 'info') {
    filteredData = processedData2.filter((item) => item.styleOption === 'info');
  } else if (filterOption2 === 'safe') {
    filteredData = processedData2.filter((item) => item.styleOption !== 'danger');
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

export default ResultsSecondRing;
