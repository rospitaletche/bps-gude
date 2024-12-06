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
  const apiaData = useSelector((state) => state.data.apiaData);
  const processedData = useSelector((state) => state.data.processedData);
  const processingData = useSelector((state) => state.data.processingData);
  const filterOption = useSelector((state) => state.ui.filterOption);

  const PLAZO_JC = parseInt(import.meta.env.VITE_PLAZO_JC);
  const PLAZO_PCUC = parseInt(import.meta.env.VITE_PLAZO_PCUC);
  const PLAZO_AVISO = parseInt(import.meta.env.VITE_PLAZO_AVISO);

  useEffect(() => {
    if (ringData.length > 0 && apiaData.length > 0) {
      dispatch(setProcessingData(true)); // Inicia el procesamiento

      const fechaActual = new Date();

      const diasAtraso = (fechaSolicitud) => {
        if (!fechaSolicitud) return 0;
        const fecha = parseDate(fechaSolicitud);
        if (!fecha || isNaN(fecha.getTime())) return 0;
        const diffTime = fechaActual - fecha;
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
      };

      const ringRivera = ringData.filter(
        (item) =>
          item['departamento'] &&
          item['departamento'].toUpperCase() === 'RIVERA'
      );

      let result = ringRivera
        .map((ringItem) => {
          const nroDoc = ringItem['nro_doc'];
          if (!nroDoc) return null;

          const apiaMatches = apiaData.filter((apiaItem) => {
            const asunto = apiaItem['Asunto'] || '';
            const docInAsunto = asunto.split(' ')[0];
            return docInAsunto === nroDoc.toString();
          });

          if (apiaMatches.length === 0) return null;

          const fechaSolicitud = ringItem['fecha_solicitud'];
          const parsedFechaSolicitud = fechaSolicitud
            ? parseDate(fechaSolicitud)
            : null;

          const atraso = parsedFechaSolicitud
            ? diasAtraso(parsedFechaSolicitud)
            : 0;

          // Determinar el styleOption basándonos en la lógica
          const codTipo = parseInt(ringItem['cod_tipo_solicitud'], 10);
          let styleOption = '';
          if (codTipo === 9) {
            if (atraso >= PLAZO_PCUC) styleOption = 'danger';
            else if (atraso >= PLAZO_PCUC - PLAZO_AVISO) styleOption = 'info';
          } else if ([1, 25, 26].includes(codTipo)) {
            if (atraso >= PLAZO_JC) styleOption = 'danger';
            else if (atraso >= PLAZO_JC - PLAZO_AVISO) styleOption = 'info';
          }

          return {
            nro_doc: formatDocumento(nroDoc),
            nombre: `${ringItem['nomb_1']} ${ringItem['nomb_2']} ${ringItem['apel_1']} ${ringItem['apel_2']}`,
            fecha_solicitud: parsedFechaSolicitud
              ? parsedFechaSolicitud.toLocaleDateString('es-ES')
              : 'Fecha no disponible',
            dias_atraso: atraso,
            apiaMatches: apiaMatches.map((apiaItem) => ({
              nro_expediente: apiaItem['Nro. expediente'],
              usuario_actual: apiaItem['Usuario actual'],
              cant_dias: apiaItem['Cant. días'],
            })),
            desc_tipo_solic: ringItem['desc_tipo_solic'],
            cod_tipo_solicitud: ringItem['cod_tipo_solicitud'],
            styleOption, // Guardamos el estilo calculado
          };
        })
        .filter((item) => item !== null);

      // Ordenar el resultado por días de atraso
      result.sort((a, b) => a.dias_atraso - b.dias_atraso);

      setTimeout(() => {
        dispatch(setProcessedData(result));
      }, 1000);
    }
  }, [ringData, apiaData, dispatch, PLAZO_JC, PLAZO_PCUC, PLAZO_AVISO]);

  if (processingData) {
    return (
      <div className="result-container">
        <LoadingSpinner />
      </div>
    );
  }

  // Filtrado según filterOption
  let filteredData = processedData;
  if (filterOption === 'info') {
    // Solo los que tienen styleOption === 'info'
    filteredData = processedData.filter((item) => item.styleOption === 'info');
  } else if (filterOption === 'safe') {
    // Todos menos los que tienen styleOption === 'danger'
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
