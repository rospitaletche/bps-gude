// src/components/ResultCard.jsx
import React from 'react';

const ResultCard = ({ item }) => {
  // Obtener las variables de entorno
  const PLAZO_JC = parseInt(import.meta.env.VITE_PLAZO_JC);
  const PLAZO_PCUC = parseInt(import.meta.env.VITE_PLAZO_PCUC);
  const PLAZO_AVISO = parseInt(import.meta.env.VITE_PLAZO_AVISO);

  let styleOption = ''; // 'info', 'danger' o ''

  // Asegurarse de que los valores sean numéricos
  const codTipoSolicitud = parseInt(item.cod_tipo_solicitud);
  const diasAtraso = parseInt(item.dias_atraso);

  // Determinar la opción de estilo según las condiciones
  if (codTipoSolicitud === 9) {
    if (diasAtraso >= PLAZO_PCUC) {
      styleOption = 'danger';
    } else if (diasAtraso >= PLAZO_PCUC - PLAZO_AVISO) {
      styleOption = 'info';
    }
  } else if ([1, 25, 26].includes(codTipoSolicitud)) {
    if (diasAtraso >= PLAZO_JC) {
      styleOption = 'danger';
    } else if (diasAtraso >= PLAZO_JC - PLAZO_AVISO) {
      styleOption = 'info';
    }
  }

  return (
    <div className={`result-card ${styleOption}`}>
      <div className="gap-data">
        <div className="gap-item">
          <span className="label">Documento:</span> {item.nro_doc}
        </div>
        <div className="gap-item">
          <span className="label">Nombre:</span> {item.nombre}
        </div>
        <div className="gap-item">
          <span className="label">Fecha de solicitud:</span>{' '}
          {item.fecha_solicitud} ({item.dias_atraso} días de atraso)
        </div>
        {item.desc_tipo_solic && (
          <div className="gap-item">
            <span className="label">Tipo de solicitud:</span>{' '}
            {item.desc_tipo_solic}
          </div>
        )}
      </div>
      <div className="divider"></div>
      <div className="atenciones">
        {item.apiaMatches.length > 0 ? (
          item.apiaMatches.map((apia, idx) => (
            <div key={idx} className="atencion-item">
              <div className="atencion-detail">
                <strong>Apia:</strong> {apia.nro_expediente} -{' '}
                {apia.usuario_actual} - {apia.cant_dias} días
              </div>
            </div>
          ))
        ) : (
          <div className="no-atencion">Sin coincidencias en APIA</div>
        )}
      </div>
    </div>
  );
};

export default ResultCard;
