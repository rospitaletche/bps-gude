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

  useEffect(() => {
    // Solo procesar si tenemos tanto ringData como apiaData cargados
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

          return {
            nro_doc: formatDocumento(nroDoc),
            nombre: `${ringItem['nomb_1']} ${ringItem['nomb_2']} ${ringItem['apel_1']} ${ringItem['apel_2']}`,
            fecha_solicitud: parsedFechaSolicitud
              ? parsedFechaSolicitud.toLocaleDateString('es-ES')
              : 'Fecha no disponible',
            dias_atraso: parsedFechaSolicitud
              ? diasAtraso(parsedFechaSolicitud)
              : 0,
            apiaMatches: apiaMatches.map((apiaItem) => ({
              nro_expediente: apiaItem['Nro. expediente'],
              usuario_actual: apiaItem['Usuario actual'],
              cant_dias: apiaItem['Cant. días'],
            })),
            desc_tipo_solic: ringItem['desc_tipo_solic'],
            cod_tipo_solicitud: ringItem['cod_tipo_solicitud'],
          };
        })
        .filter((item) => item !== null);

      // Ordenar el resultado por días de atraso
      result.sort((a, b) => a.dias_atraso - b.dias_atraso);

      // Forzar un retraso de 1 segundo antes de mostrar los resultados
      setTimeout(() => {
        dispatch(setProcessedData(result)); // Esto pone processingData = false en el reducer
      }, 1000);
    }
  }, [ringData, apiaData, dispatch]);

  // Lógica para mostrar contenido:
  // 1. Si estamos procesando, mostrar el spinner.
  if (processingData) {
    return (
      <div className="result-container">
        <LoadingSpinner />
      </div>
    );
  }

  // 2. Si no estamos procesando y tenemos datos, mostrarlos:
  if (processedData.length > 0) {
    return (
      <div className="result-container">
        {processedData.map((item, index) => (
          <ResultCard key={index} item={item} />
        ))}
      </div>
    );
  }

  // 3. Si no estamos procesando y no hay datos, mostrar el mensaje por defecto:
  return (
    <div className="result-container">
      <p>No hay datos para mostrar.</p>
    </div>
  );
};

export default Results;

