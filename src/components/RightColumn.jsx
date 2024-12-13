// src/components/RightColumn.jsx
import React from 'react';
import FileUploader from './FileUploader';
import FilterOptions from './FilterOptions';
import ReporteRing from './ReporteRing';

function RightColumn({page}) {
  switch (page) {
    case 'InformePasivos':
      return (
        <section className="container__right-column">
          <h2 className="heading-secondary">Cargar Archivos</h2>
          <FileUploader />
          <FilterOptions />
          <ReporteRing />
        </section>
      );
    case 'AtencionActivos':
      return <div>Archivos rertornados</div>;
    case 'OficiosJudiciales':
      return <div>Ver...</div>;
    // ...otros casos...
    default:
      return <div>Selecciona una opción.</div>;
  }
}

export default RightColumn;
