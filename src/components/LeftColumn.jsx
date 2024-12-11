// src/components/LeftColumn.jsx
import React from 'react';
import Results from './Results';

function LeftColumn({ page }) {
    switch (page) {
      case 'InformePasivos':
        return (
          <section className="container__left-column">
            <h1 className="heading-primary">Resultado</h1>
            <p>Resultado de la depuración de archivos</p>
            <Results />
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

export default LeftColumn;
