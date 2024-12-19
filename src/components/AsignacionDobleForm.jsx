// src/components/AsignacionDobleForm.jsx

import React from 'react';
import { useForm } from '../hooks/useForm'; // Ajusta la ruta si es necesario
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { useDispatch } from 'react-redux';
import { setGeneratedDocument } from '../store/dataSlice'; // Asegúrate de exportar esta acción
//import './AsignacionDobleForm.css'; // Crea y ajusta los estilos según necesites

const AsignacionDobleForm = () => {
  const dispatch = useDispatch();
  const {
    formState,
    onInputChange,
    onResetForm
  } = useForm({
    MENOR_DOCUMENTO: '',
    MENOR_NOMBRE: '',
    MENOR_APELLIDO: '',
    ATRIB_DOCUMENTO: '',
    ATRIB_NOMBRE: '',
    ATRIB_APELLIDO: '',
    DOMICILIO: '',
    TELEFONO: '',
  });

  const handleGenerateDocument = async (e) => {
    e.preventDefault();

    // Valores automáticos
    const AUTO_CIUDAD = 'Rivera';
    const AUTO_FECHA_LARGA = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const AUTO_BPS_NOMBRE = 'BPS Rivera';
    const AUTO_BPS_DIRECCION = 'Uruguay 783';
    const AUTO_NOMBRE_FUNC = 'Ricardo Ospitaletche';
    const AUTO_NRO_FUNC = '16.251';
    const AUTO_BPS_TEL = '46224529 int. 1';
    const AUTO_BPS_EMAIL = 'administracionrivera@bps.gub.uy';

    try {
      // Cargar el template
      const response = await fetch(`${import.meta.env.BASE_URL}templates/template.docx`);
      if (!response.ok) {
        throw new Error('No se pudo cargar el template.docx');
      }
      const arrayBuffer = await response.arrayBuffer();
      const zip = new PizZip(arrayBuffer);
      const doc = new Docxtemplater().loadZip(zip);

      // Preparar datos
      const dataToFill = {
        ...formState,
        AUTO_CIUDAD,
        AUTO_FECHA_LARGA,
        AUTO_BPS_NOMBRE,
        AUTO_BPS_DIRECCION,
        AUTO_NOMBRE_FUNC,
        AUTO_NRO_FUNC,
        AUTO_BPS_TEL,
        AUTO_BPS_EMAIL,
      };

      doc.setData(dataToFill);

      try {
        doc.render();
      } catch (error) {
        console.error('Error al renderizar la plantilla:', error);
        return;
      }

      const out = doc.getZip().generate({
        type: 'blob',
        mimeType:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      // Crear una URL para el documento generado
      const url = URL.createObjectURL(out);

      // Guardar la URL en el store para que el botón de descarga pueda acceder a ella
      dispatch(setGeneratedDocument(url));

      // Opcional: Resetear el formulario después de generar el documento
      onResetForm();
    } catch (error) {
      console.error('Error al generar el documento:', error);
      alert('Ocurrió un error al generar el documento. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <form onSubmit={handleGenerateDocument} className="form-asignacion-doble">
      <h3>Generar Documento</h3>
      
      {/* Campos del menor */}
      <div className="form-group">
        <label>Documento del menor:</label>
        <input
          type="text"
          name="MENOR_DOCUMENTO"
          value={formState.MENOR_DOCUMENTO}
          onChange={onInputChange}
          className="form-control"
          required
        />
      </div>

      <div className="form-group">
        <label>Nombres del menor:</label>
        <input
          type="text"
          name="MENOR_NOMBRE"
          value={formState.MENOR_NOMBRE}
          onChange={onInputChange}
          className="form-control"
          required
        />
      </div>

      <div className="form-group">
        <label>Apellidos del menor:</label>
        <input
          type="text"
          name="MENOR_APELLIDO"
          value={formState.MENOR_APELLIDO}
          onChange={onInputChange}
          className="form-control"
          required
        />
      </div>

      <hr />

      {/* Campos del atributario */}
      <div className="form-group">
        <label>Documento del atributario:</label>
        <input
          type="text"
          name="ATRIB_DOCUMENTO"
          value={formState.ATRIB_DOCUMENTO}
          onChange={onInputChange}
          className="form-control"
          required
        />
      </div>

      <div className="form-group">
        <label>Nombres del atributario:</label>
        <input
          type="text"
          name="ATRIB_NOMBRE"
          value={formState.ATRIB_NOMBRE}
          onChange={onInputChange}
          className="form-control"
          required
        />
      </div>

      <div className="form-group">
        <label>Apellidos del atributario:</label>
        <input
          type="text"
          name="ATRIB_APELLIDO"
          value={formState.ATRIB_APELLIDO}
          onChange={onInputChange}
          className="form-control"
          required
        />
      </div>

      <hr />

      {/* Datos de contacto */}
      <div className="form-group">
        <label>Domicilio:</label>
        <input
          type="text"
          name="DOMICILIO"
          value={formState.DOMICILIO}
          onChange={onInputChange}
          className="form-control"
          required
        />
      </div>

      <div className="form-group">
        <label>Teléfono:</label>
        <input
          type="text"
          name="TELEFONO"
          value={formState.TELEFONO}
          onChange={onInputChange}
          className="form-control"
          required
        />
      </div>

      <button type="submit" className="btn btn-primary">Generar Documento</button>
    </form>
  );
};

export default AsignacionDobleForm;
