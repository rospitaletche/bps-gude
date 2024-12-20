// src/components/RightColumn.jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import FileUploader from './FileUploader';
import FilterOptions from './FilterOptions';
import ReporteRing from './ReporteRing';
import FileUploaderSecondRing from './FileUploaderSecondRing';
import ResetButton from './ResetButton'; // Importar el nuevo componente
import { resetGeneratedDocument } from '../store/dataSlice';

function RightColumn({ page }) {
  const generatedDocument = useSelector((state) => state.data.generatedDocument);
  const dispatch = useDispatch();

  const handleDownload = () => {
    if (generatedDocument) {
      const a = document.createElement('a');
      a.href = generatedDocument;
      a.download = 'oficio_completado.docx';
      a.click();
      URL.revokeObjectURL(generatedDocument);
      dispatch(resetGeneratedDocument());
    }
  };

  switch (page) {
    case 'InformePasivos':
      return (
        <section className="container__right-column">
          <h2 className="heading-secondary">Cargar Archivos</h2>
          <FileUploaderSecondRing />
          
          <FileUploader />
          <FilterOptions />
          
          <ReporteRing />

          {/* Botones Adicionales */}
          <div className="mt-3">
            <ResetButton /> {/* Usar el nuevo componente */}
            {generatedDocument && (
              <button className="btn btn-success ms-2" onClick={handleDownload}>
                Descargar Documento Generado
              </button>
            )}
          </div>
        </section>
      );
    case 'AtencionActivos':
      return <div>Archivos retornados</div>;
    case 'OficiosJudiciales':
      return <div>Ver...</div>;
    default:
      return <div>Selecciona una opción.</div>;
  }
}

export default RightColumn;
