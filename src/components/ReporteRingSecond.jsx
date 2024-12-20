// src/components/ReporteRingSecond.jsx
import React from 'react';
import { useSelector } from 'react-redux';

const ReporteRingSecond = () => {
  const processedData2 = useSelector((state) => state.data.processedData2);
  const PLAZO_AVISO = parseInt(import.meta.env.VITE_PLAZO_AVISO, 10);
  const PLAZO_JC = parseInt(import.meta.env.VITE_PLAZO_JC, 10);
  const PLAZO_PCUC = parseInt(import.meta.env.VITE_PLAZO_PCUC, 10);
  const PLAZO_PV = parseInt(import.meta.env.VITE_PLAZO_PV, 10);

  // Verificar si processedData2 es un array
  if (!Array.isArray(processedData2)) {
    console.error('processedData2 is not an array:', processedData2);
    return (
      <div className="reporte-ring">
        <p>Error al cargar los datos del segundo RING.</p>
      </div>
    );
  }

  let pendientes = 0;
  let porVencer = 0;
  let alDia = 0;
  let vencidos = 0;

  processedData2.forEach((item) => {
    const codTipo = parseInt(item.cod_tipo_solicitud, 10);
    const atraso = item.dias_atraso || 0;

    let plazo = (codTipo === 9) ? PLAZO_PCUC : PLAZO_PV;

    if (codTipo === 9) { // PCUC
      if (atraso >= plazo) {
        vencidos++;
      } else if (atraso >= plazo - PLAZO_AVISO) {
        porVencer++;
        alDia++;
      } else {
        alDia++;
      }
    } else { // PV
      if (atraso >= plazo) {
        vencidos++;
      } else if (atraso >= plazo - PLAZO_AVISO) {
        porVencer++;
        alDia++;
      } else {
        alDia++;
      }
    }

    pendientes++;
  });

  return (
    <div className="reporte-ring">
      <h2>Reporte de Segundo RING</h2>
      <ul>
        <li>
          <strong>{pendientes}</strong> trámites pendientes
        </li>
        <li>
          <strong>{porVencer}</strong> trámites por vencer en {PLAZO_AVISO} días
        </li>
        <li>
          <strong>{alDia}</strong> trámites al día
        </li>
        <li>
          <strong>{vencidos}</strong> trámites vencidos
        </li>
      </ul>
    </div>
  );
};

export default ReporteRingSecond;
