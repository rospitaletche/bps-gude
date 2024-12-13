import React from 'react';
import { useSelector } from 'react-redux';

const ReporteRing = () => {
  const processedData = useSelector((state) => state.data.processedData);
  const PLAZO_JC = parseInt(import.meta.env.VITE_PLAZO_JC, 10);
  const PLAZO_PCUC = parseInt(import.meta.env.VITE_PLAZO_PCUC, 10);
  const PLAZO_AVISO = parseInt(import.meta.env.VITE_PLAZO_AVISO, 10);

  let pendientes = 0;
  let porVencer = 0;
  let alDia = 0;
  let vencidos = 0;

  const getTipoTramite = (codTipo) => {
    if ([1, 25, 26].includes(codTipo)) {
      return 'Jubilación común';
    }
    if (codTipo === 9) {
      return 'Incapacidad';
    }
    return 'Otro';
  };

  processedData.forEach((item) => {
    const codTipo = parseInt(item.cod_tipo_solicitud, 10);
    const atraso = item.dias_atraso || 0;

    // Calcular clasificaciones
    if (codTipo === 9) {
      if (atraso >= PLAZO_PCUC) {
        vencidos++;
      } else if (atraso >= PLAZO_PCUC - PLAZO_AVISO) {
        porVencer++;
        alDia++;
      } else {
        alDia++;
      }
    } else if ([1, 25, 26].includes(codTipo)) {
      if (atraso >= PLAZO_JC) {
        vencidos++;
      } else if (atraso >= PLAZO_JC - PLAZO_AVISO) {
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

export default ReporteRing;
