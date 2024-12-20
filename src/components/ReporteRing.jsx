// src/components/ReporteRing.jsx
import React from 'react';
import { useSelector } from 'react-redux';

const ReporteRing = () => {
  const processedData = useSelector((state) => state.data.processedData);
  const PLAZO_JC = parseInt(import.meta.env.VITE_PLAZO_JC, 10);
  const PLAZO_PCUC = parseInt(import.meta.env.VITE_PLAZO_PCUC, 10);
  const PLAZO_AVISO = parseInt(import.meta.env.VITE_PLAZO_AVISO, 10);
  const PLAZO_PV = parseInt(import.meta.env.VITE_PLAZO_PV, 10); // Plazo para Pensión Vejez
  const PLAZO_PI = parseInt(import.meta.env.VITE_PLAZO_PI, 10); // Plazo para Pensión Invalidez

  let pendientes = 0;
  let porVencer = 0;
  let alDia = 0;
  let vencidos = 0;

  const fechaActual = new Date();

  const diasAtraso = (fechaSolicitud) => {
    const fecha = new Date(fechaSolicitud);
    if (isNaN(fecha.getTime())) return 0;
    const diffTime = fechaActual - fecha;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  processedData.forEach((item) => {
    const tipoSolicitud = item.tipo_solicitud;
    const atraso = item.dias_atraso || 0;
    let plazo = PLAZO_JC; // Valor por defecto

    // Asignar el plazo correspondiente según el tipo de solicitud
    switch (tipoSolicitud) {
      case 'Pensión Vejez':
        plazo = PLAZO_PV;
        break;
      case 'Pensión Invalidez':
        plazo = PLAZO_PI;
        break;
      case 'Jubilación Común':
        plazo = PLAZO_JC;
        break;
      default:
        plazo = PLAZO_JC; // Manejar otros tipos como Jubilación Común por defecto
        break;
    }

    // Clasificar los trámites según el atraso y el plazo
    if (atraso >= plazo) {
      vencidos++;
    } else if (atraso >= plazo - PLAZO_AVISO) {
      porVencer++;
    } else {
      alDia++;
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
