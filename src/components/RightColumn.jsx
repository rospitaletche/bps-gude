// src/components/RightColumn.jsx
import React from 'react';
import FileUploader from './FileUploader';

function RightColumn() {
  return (
    <section className="container__right-column">
      <h2 className="heading-secondary">Cargar Archivos</h2>
      <FileUploader />
    </section>
  );
}

export default RightColumn;
