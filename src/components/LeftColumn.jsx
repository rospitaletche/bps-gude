// src/components/LeftColumn.jsx
import React from 'react';
import Results from './Results';

function LeftColumn() {
  return (
    <section className="container__left-column">
      <h1 className="heading-primary">Resultado</h1>
      <p>Resultado de la depuración de archivos</p>
      <Results />
    </section>
  );
}

export default LeftColumn;
