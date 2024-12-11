// src/components/RightColumn.jsx
import React from 'react';
import FileUploader from './FileUploader';
import FilterOptions from './FilterOptions';

function RightColumn({page}) {
  switch (page) {
    case 'InformePasivos':
      return (
        <section className="container__right-column">
          <h2 className="heading-secondary">Cargar Archivos</h2>
          <FileUploader />
          <FilterOptions />
        </section>
      );
    case 'Informe2Page':
      return <div>Contenido Informe 2 - Columna Izquierda</div>;
    case 'AtencionPage':
      return <div>Contenido Atención - Columna Izquierda</div>;
    // ...otros casos...
    default:
      return <div>Selecciona una opción.</div>;
  }
}

export default RightColumn;
