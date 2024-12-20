// src/components/ResultCard.jsx
import React from 'react';

const ResultCard = ({ item }) => {
  // item.styleOption puede ser 'info', 'danger' o ''
  return (
    <div className={`result-card ${item.styleOption || ''}`}>
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
        {item.tipo_solicitud && (
          <div className="gap-item">
            <span className="label">Tipo de solicitud:</span>{' '}
            {item.tipo_solicitud}
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
