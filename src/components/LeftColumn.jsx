// src/components/LeftColumn.jsx
import React from 'react';
import Results from './Results';
import AsignacionDobleForm from './AsignacionDobleForm';

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
      case 'OficiosJudiciales':
        return (
          <section className="container__left-column">
            <h1 className="heading-primary">Oficios Judiciales</h1>
            <p>Ver...</p>
          </section>
        );
      case 'AtencionActivos':
        return (
          <section className="container__left-column">
            <h1 className="heading-primary">Asignación doble</h1>
            <p>Complete la información para generar el documento:</p>
            <AsignacionDobleForm />
          </section>
        );
      // ...otros casos...
      default:
        return <div>Selecciona una opción.</div>;
    }

}

export default LeftColumn;
