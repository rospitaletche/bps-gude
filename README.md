# Github Pages

1) vite.config.js:

  base: '/bps-gude/',
  build: {
    outDir: 'docs', // Si estás usando 'docs' para GitHub Pages
  },

2) npm run build
3) Realizar el push para que se suba la carpeta 'docs'
4) En github seleccionar Page, seleccionar main > docs 
5) Save





...........

Quiero que me ayudes con lo siguiente:
Actualmente tengo un sitio donde accedo directamente a la URL.
Quisiera tener una pantalla de login donde, para acceder a la pagina, me exija estar logueado. 
El desarrollo de la autenticacion ya lo estoy trabajando en nest. Esto es un punto a parte y no quiero tocar ahora.
Lo que si quiero es que mi sitio actue como si tuviera un logueo de usuario (en forma basica).
No necesito una autenticacion real. Pero lo que si necesito es que lo primero que me muestre es esa pantalla de logueo y solamente si paso la pantalla acceda al contenido del sitio. 
Me interesaria guardar, ya sea en el local storage o en el propio store (como te parezca mejor y más apropiado a ti), por ejemplo, alguna variable del tipo: login:true y departemento:'xxx'.
Tu piensalo de la manera que te parezca. A mi lo que me interesa es que funcione asi:
Te voy a dar una lista de 'departamentos', si el nombre de usuario esta en la lista, se loguea, no importando que password le ponga. Y me guarde el nombre de departamento que use. 

# Asi esta el App actualmente:
'''
<Provider store={store}>
      <div className="body">
        <Header />
        <Sidebar />
        <MainContent />
        <Footer />
      </div>
    </Provider>
'''

Lo que pretendo es que se vea asi solamente en el caso de estar logueado, caso contrario se vea tipo:

'''
<div className="body">
  <LoginPage />
</div>
'''

En principio, mi aplicación busca los datos pertenecientes al departamento de RIVERA. 
La idea es que no lo haga solo para Rivera, y si para los departementos que esten dentro de una lista.
Filtrara solo los datos para el departemento seleccionado (en este caso sera el que le pongamos de nombre de usuario).
La excepcion estara en el departamento de 'Montevideo'. Este no existe en el excel, entonces, en este caso, mostrará todos los departamentos.

'''
# src/components/Results.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setProcessedData, setProcessingData } from '../store/dataSlice';
import ResultCard from './ResultCard';
import LoadingSpinner from './LoadingSpinner';
import { parseDate } from '../utils/dateUtils';
import { formatDocumento } from '../utils/formatUtils';

const Results = () => {
  const dispatch = useDispatch();
  const ringData = useSelector((state) => state.data.ringData);
  const apiaData = useSelector((state) => state.data.apiaData);
  const processedData = useSelector((state) => state.data.processedData);
  const processingData = useSelector((state) => state.data.processingData);
  const filterOption = useSelector((state) => state.ui.filterOption);

  const PLAZO_JC = parseInt(import.meta.env.VITE_PLAZO_JC);
  const PLAZO_PCUC = parseInt(import.meta.env.VITE_PLAZO_PCUC);
  const PLAZO_AVISO = parseInt(import.meta.env.VITE_PLAZO_AVISO);

  useEffect(() => {
    if (ringData.length > 0 && apiaData.length > 0) {
      dispatch(setProcessingData(true)); // Inicia el procesamiento

      const fechaActual = new Date();

      const diasAtraso = (fechaSolicitud) => {
        if (!fechaSolicitud) return 0;
        const fecha = parseDate(fechaSolicitud);
        if (!fecha || isNaN(fecha.getTime())) return 0;
        const diffTime = fechaActual - fecha;
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
      };

      const ringRivera = ringData.filter(
        (item) =>
          item['departamento'] &&
          item['departamento'].toUpperCase() === 'RIVERA'
      );

      let result = ringRivera
        .map((ringItem) => {
          const nroDoc = ringItem['nro_doc'];
          if (!nroDoc) return null;

          const apiaMatches = apiaData.filter((apiaItem) => {
            const asunto = apiaItem['Asunto'] || '';
            const docInAsunto = asunto.split(' ')[0];
            return docInAsunto === nroDoc.toString();
          });

          if (apiaMatches.length === 0) return null;

          const fechaSolicitud = ringItem['fecha_solicitud'];
          const parsedFechaSolicitud = fechaSolicitud
            ? parseDate(fechaSolicitud)
            : null;

          const atraso = parsedFechaSolicitud
            ? diasAtraso(parsedFechaSolicitud)
            : 0;

          // Determinar el styleOption basándonos en la lógica
          const codTipo = parseInt(ringItem['cod_tipo_solicitud'], 10);
          let styleOption = '';
          if (codTipo === 9) {
            if (atraso >= PLAZO_PCUC) styleOption = 'danger';
            else if (atraso >= PLAZO_PCUC - PLAZO_AVISO) styleOption = 'info';
          } else if ([1, 25, 26].includes(codTipo)) {
            if (atraso >= PLAZO_JC) styleOption = 'danger';
            else if (atraso >= PLAZO_JC - PLAZO_AVISO) styleOption = 'info';
          }

          return {
            nro_doc: formatDocumento(nroDoc),
            nombre: `${ringItem['nomb_1']} ${ringItem['nomb_2']} ${ringItem['apel_1']} ${ringItem['apel_2']}`,
            fecha_solicitud: parsedFechaSolicitud
              ? parsedFechaSolicitud.toLocaleDateString('es-ES')
              : 'Fecha no disponible',
            dias_atraso: atraso,
            apiaMatches: apiaMatches.map((apiaItem) => ({
              nro_expediente: apiaItem['Nro. expediente'],
              usuario_actual: apiaItem['Usuario actual'],
              cant_dias: apiaItem['Cant. días'],
            })),
            desc_tipo_solic: ringItem['desc_tipo_solic'],
            cod_tipo_solicitud: ringItem['cod_tipo_solicitud'],
            styleOption, // Guardamos el estilo calculado
          };
        })
        .filter((item) => item !== null);

      // Ordenar el resultado por días de atraso
      result.sort((a, b) => a.dias_atraso - b.dias_atraso);

      setTimeout(() => {
        dispatch(setProcessedData(result));
      }, 1000);
    }
  }, [ringData, apiaData, dispatch, PLAZO_JC, PLAZO_PCUC, PLAZO_AVISO]);

  if (processingData) {
    return (
      <div className="result-container">
        <LoadingSpinner />
      </div>
    );
  }

  // Filtrado según filterOption
  let filteredData = processedData;
  if (filterOption === 'info') {
    // Solo los que tienen styleOption === 'info'
    filteredData = processedData.filter((item) => item.styleOption === 'info');
  } else if (filterOption === 'safe') {
    // Todos menos los que tienen styleOption === 'danger'
    filteredData = processedData.filter((item) => item.styleOption !== 'danger');
  }

  if (filteredData.length > 0) {
    return (
      <div className="result-container">
        {filteredData.map((item, index) => (
          <ResultCard key={index} item={item} />
        ))}
      </div>
    );
  }

  return (
    <div className="result-container">
      <p>No hay datos para mostrar.</p>
    </div>
  );
};

export default Results;

'''

Te paso tambien el css que tengo actualmente, para que los estilos del nuevo componente queden acordes. Quiero algo moderno, siguiendo mi estilo y colores. Tendiendo un poco a estilos de bootstrap

'''
/* Variables CSS para colores y tipografías */
:root {
    /* Colores */
    --color-primario: #21355b; /* Azul */
    --color-primario-oscuro: #182542;
    --color-secundario: #00ace7; /* Gris */
    --color-acentuado: #099595; /* Color complementario (verde) */
    --color-fondo: #f7f7f7; /* Fondo claro */
    --color-texto: #343639; /* Texto oscuro */
    --color-texto-claro: #75777b;

    --color-bg-primary:#cfe2ff;
    --color-txt-primary:#052c65;
    --color-brd-primary:#9ec5fe;
    --color-bg-info:#cff4fc;
    --color-txt-info:#055160;
    --color-brd-info:#9eeaf9;
    --color-bg-danger:#f8d7da;
    --color-txt-danger:#58151c;
    --color-brd-danger:#f1aeb5;
    --color-bg-warning:#fff3cd;
    --color-txt-warning:#664d03;
    --color-brd-warning:#ffe69c;

    /* Tipografías */
    --fuente-principal: 'Barlow', sans-serif;
    --fuente-secundaria: 'Lato', sans-serif;

    /* Tamaños */
    --ancho-sidebar-colapsada: 40px;
    --ancho-sidebar-expandida: 200px;
    --transicion: 0.3s ease;

    --ancho-header: 60px;
}

*, *::before, *::after {
    box-sizing: border-box;
}

/* Estilos globales */
/* Eliminar la clase .body y aplicar estilos al body directamente */
body {
    margin: 0;
    font-family: var(--fuente-principal);
    background-color: var(--color-fondo);
    color: var(--color-texto);
  }
  
  /* Asegurar que html y body ocupen todo el ancho y alto */
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
  }

.heading-primary, .heading-secondary {
    color: var(--color-secundario);
}

/* Header */
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: white;
    color: var(--color-texto);
    height: var(--ancho-header);
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header__logo {
    height: var(--ancho-header);
    width: var(--ancho-sidebar-expandida);
    background-color: var(--color-primario);
    text-align: center;
}

.header__logo img {
    max-height: 60px;
    cursor: pointer;
}

/* Menú de navegación */
.nav-menu {
    list-style: none;
    display: flex;
    margin: 0;
    padding: 0;
    width: 100%;
    justify-content: space-around;
}

.nav-menu__item {
    flex-grow: 1;
    text-align: center;
}

.nav-menu__link {
    color: var(--color-secundario);
    text-decoration: none;
    text-transform: uppercase;
    font-family: var(--fuente-principal);
    display: block;
    padding: 10px;
    height: var(--ancho-header);
    align-content: center;
}

.nav-menu__link:hover {
    background-color: var(--color-fondo);
    border-bottom: var(--color-secundario) 2px solid;
    font-weight: 600;
}

.nav-menu__link--activa {
    background-color: var(--color-secundario);
    color: #fff !important;
    font-weight: 600;
}

/* Barra lateral */
.sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: var(--ancho-sidebar-expandida);
    background-color: var(--color-primario-oscuro);
    color: white;
    overflow-x: hidden;
    transition: width var(--transicion);
    padding-top: var(--ancho-header);
    z-index: 999;
}

.sidebar--collapsed {
    width: var(--ancho-sidebar-colapsada);
}

.sidebar__list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.sidebar__item {
    display: flex;
    align-items: center;
    padding: 15px 10px;
    cursor: pointer;
}

.sidebar__item:hover {
    background-color: var(--color-secundario);
}

.sidebar__item--activo {
    background-color: var(--color-secundario);
}

.sidebar__icon {
    margin-right: 10px;
}

.sidebar__text {
    transition: opacity var(--transicion);
}

.sidebar--collapsed .sidebar__text {
    opacity: 0;
    pointer-events: none;
}

/* Botón de toggle */
.sidebar__toggle-btn {
    position: absolute;
    bottom: 0;
    width: 100%;
    justify-content: center;
}

/* Contenedor principal */
.container {
    margin-left: var(--ancho-sidebar-expandida);
    padding: 20px;
    transition: margin-left var(--transicion);
    padding-top: calc(var(--ancho-header) + 20px);
    /* Migrara a Flexbox */
    display: flex;
    flex-wrap: nowrap;
}

.sidebar--collapsed ~ .container {
    margin-left: var(--ancho-sidebar-colapsada);
}

/* Columnas */
.container__left-column, .container__right-column {
    padding: 20px;
    font-family: var(--fuente-secundaria);
}

.container__left-column {
    width: 70%;
    /* float: left; */
}

.container__right-column {
    width: 30%;
    /* float: right; */
}

/* Limpiar floats */
.container::after {
    content: "";
    display: table;
    clear: both;
}

/* Footer */
.footer {
    text-align: center;
    padding: 10px;
    background-color: var(--color-primario);
    color: white;
    position: fixed;
    width: 100%;
    bottom: 0;
    font-family: var(--fuente-secundaria);
}

/* Diseño responsivo */
@media (max-width: 768px) {
    /* Ajustes para tabletas */
    .container__left-column, .container__right-column {
        width: 100%;
        float: none;
    }

    .container {
        margin-left: var(--ancho-sidebar-expandida);
    }

    .sidebar--collapsed ~ .container {
        margin-left: var(--ancho-sidebar-colapsada);
    }
}

@media (max-width: 480px) {
    /* Ajustes para móviles */
    .header {
        flex-direction: column;
        align-items: flex-start;
    }

    .nav-menu {
        flex-direction: column;
    }

    .nav-menu__item {
        margin-left: 0;
        margin-top: 10px;
    }

    .container {
        margin-left: 0;
    }

    .sidebar {
        display: none;
    }
}

/* src/components/Results.css */

.result-container {
    display: flex;
    flex-wrap: wrap; /* Permite que los elementos se envuelvan */
    gap: 20px; /* Espaciado entre columnas y filas */
    justify-content: flex-start; /* Alinea los elementos al inicio */
    /* padding: 10px; /* Añade un poco de espacio interno */
    width: 100%; /* Asegura que use todo el ancho del contenedor */
    box-sizing: border-box; /* Incluye padding en el cálculo del ancho */
    margin-bottom: 60px;
  }
  
  .result-card {
    background-color: #ffffff;
    border: 1px solid #ddd;
    color: #333;
    border-radius: 10px;
    padding: 15px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    flex: 1 1 calc(50% - 20px); /* Dos columnas menos el espacio del gap */
    max-width: calc(50% - 20px); /* Asegura que no exceda la mitad del ancho */
    box-sizing: border-box; /* Incluye padding y borde en el ancho total */
  }
  
  @media (max-width: 768px) {
    .result-card {
      flex: 1 1 100%; /* Una columna en pantallas pequeñas */
    }
  }
  
  .gap-data {
    margin-bottom: 10px;
  }
  
  .gap-item {
    font-size: 16px;
    margin-bottom: 5px;
  }
  
  .label {
    font-weight: bold;
    color: #333;
  }
  
  .divider {
    height: 1px;
    background-color: #ddd;
    margin: 10px 0;
  }
  
  .atenciones {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .atencion-item {
    padding: 10px;
    background-color: #f9f9f9;
    border: 1px solid #eee;
    border-radius: 5px;
  }
  
  .atencion-item:hover {
    background-color: #f1f1f1;
  }
  
  .atencion-detail {
    font-size: 14px;
    color: #555;
    margin-bottom: 5px;
  }
  
  .no-atencion {
    font-style: italic;
    color: #888;
  }

  /* Estilos para la clase 'info' */
.result-card.info {
  /*background-color: var(--color-bg-info);*/
  background-color: white;
  border-color: var(--color-brd-info);
  color: var(--color-txt-info);
}

.result-card.info .label,
.result-card.info .atencion-detail,
.result-card.info .no-atencion {
  color: var(--color-txt-info);
}

.result-card.info .atencion-item {
  background-color: var(--color-bg-info);
  border-color: var(--color-brd-info);
}

/* Estilos para la clase 'danger' */
.result-card.danger {
  /*background-color: var(--color-bg-danger);*/
  background-color: white;
  border-color: var(--color-brd-danger);
  color: var(--color-txt-danger);
}

.result-card.danger .label,
.result-card.danger .atencion-detail,
.result-card.danger .no-atencion {
  color: var(--color-txt-danger);
}

.result-card.danger .atencion-item {
  background-color: var(--color-bg-danger);
  border-color: var(--color-brd-danger);
}
  
  /* Upload buttons */

 /* Contenedor de los botones */
.upload-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Cada botón de carga */
.upload-button {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Ocultar el input pero mantener su funcionalidad */
.upload-button input[type="file"] {
  display: none;
}

/* Estilo para el botón */
.upload-button button {
  background-color: var(--color-secundario);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 16px;
  font-family: var(--fuente-principal);
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

/* Hover del botón */
.upload-button button:hover {
  background-color: #008bb5; /* Un tono más oscuro del color secundario */
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
}

/* Estado activo (clic) */
.upload-button button:active {
  background-color: #006f8f; /* Aún más oscuro */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transform: scale(0.98); /* Pequeño efecto de "clic" */
}

/* Estilo del label */
.upload-button label {
  font-size: 16px;
  font-weight: bold;
  color: var(--color-texto);
  font-family: var(--fuente-secundaria);
}


/* src/components/LoadingSpinner.css */

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100px; /* Ajusta según tus necesidades */
}

.spinner {
  border: 8px solid #f3f3f3;
  border-top: 8px solid var(--color-secundario);
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.header__user-register {
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-icon {
  font-size: 20px;
  color: var(--color-secundario);
}

.user-logout {
  font-size: 16px;
  cursor: pointer;
  color: var(--color-primario);
}

.user-logout:hover {
  text-decoration: underline;
}



/* src/components/FilterOptions.css */

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-option input[type="radio"] {
  display: none; /* Ocultar el radio button nativo */
}

.filter-option label {
  position: relative;
  padding-left: 30px;
  cursor: pointer;
  font-size: 16px;
  color: var(--color-texto);
  font-family: 'Lato', sans-serif;
  user-select: none;
}

/* Círculo exterior */
.filter-option label::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-primario-oscuro);
  border-radius: 50%;
  background-color: var(--color-fondo);
  transition: all 0.3s ease;
}

/* Círculo interior (visible cuando está seleccionado) */
.filter-option label::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--color-secundario);
  opacity: 0;
  transition: opacity 0.3s ease;
}

/* Cuando el radio está seleccionado */
.filter-option input[type="radio"]:checked + label::after {
  opacity: 1;
}

/* Cambiar el color del círculo exterior cuando está seleccionado */
.filter-option input[type="radio"]:checked + label::before {
  border-color: var(--color-secundario);
}

/* Efecto hover */
.filter-option label:hover::before {
  background-color: var(--color-acentuado);
  border-color: var(--color-acentuado);
}

.filter-option label:hover::after {
  opacity: 1;
}

/* Transición suave para el círculo interior */
.filter-option label::after {
  transition: opacity 0.3s ease;
}

'''







Creo que no se esta esta mostrando bien el resultado.
Estamos cargando 2 archivos (RING y APIA). Sin embargo el resultado solo muestra los archivos de RING que tienen coincidencia con APIA.
Eso esta mal. Deberian mostrar todos los de RING (filtrando por departamento) y en el caso de que no haya un apia coincidente, lo debe mostrar igual (sin el campo correspondiente al apia y usuario que lo realiza)
'''
// src/components/Results.jsx

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setProcessedData, setProcessingData } from '../store/dataSlice';
import ResultCard from './ResultCard';
import LoadingSpinner from './LoadingSpinner';
import { parseDate } from '../utils/dateUtils';
import { formatDocumento } from '../utils/formatUtils';

const Results = () => {
  const dispatch = useDispatch();
  const ringData = useSelector((state) => state.data.ringData);
  const apiaData = useSelector((state) => state.data.apiaData);
  const processedData = useSelector((state) => state.data.processedData);
  const processingData = useSelector((state) => state.data.processingData);
  const filterOption = useSelector((state) => state.ui.filterOption);
  const department = useSelector((state) => state.ui.department); // Obtener el departamento

  const PLAZO_JC = parseInt(import.meta.env.VITE_PLAZO_JC, 10);
  const PLAZO_PCUC = parseInt(import.meta.env.VITE_PLAZO_PCUC, 10);
  const PLAZO_AVISO = parseInt(import.meta.env.VITE_PLAZO_AVISO, 10);

  useEffect(() => {
    if (ringData.length > 0 && apiaData.length > 0) {
      dispatch(setProcessingData(true)); // Inicia el procesamiento

      const fechaActual = new Date();

      const diasAtraso = (fechaSolicitud) => {
        const fecha = parseDate(fechaSolicitud);
        if (!fecha || isNaN(fecha.getTime())) return 0;
        const diffTime = fechaActual - fecha;
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
      };

      // Filtrar los datos basados en el departamento
      const ringFiltered = department === 'Montevideo' 
        ? ringData 
        : ringData.filter(
            (item) =>
              item['departamento'] &&
              item['departamento'].toUpperCase() === department.toUpperCase()
          );

      let result = ringFiltered
        .map((ringItem) => {
          const nroDoc = ringItem['nro_doc'];
          if (!nroDoc) return null;

          const apiaMatches = apiaData.filter((apiaItem) => {
            const asunto = apiaItem['Asunto'] || '';
            const docInAsunto = asunto.split(' ')[0];
            return docInAsunto === nroDoc.toString();
          });

          if (apiaMatches.length === 0) return null;

          const fechaSolicitud = ringItem['fecha_solicitud'];
          const parsedFechaSolicitud = fechaSolicitud
            ? parseDate(fechaSolicitud)
            : null;

          const atraso = parsedFechaSolicitud
            ? diasAtraso(parsedFechaSolicitud)
            : 0;

          // Determinar el styleOption basándonos en la lógica
          const codTipo = parseInt(ringItem['cod_tipo_solicitud'], 10);
          let styleOption = '';
          if (codTipo === 9) {
            if (atraso >= PLAZO_PCUC) styleOption = 'danger';
            else if (atraso >= PLAZO_PCUC - PLAZO_AVISO) styleOption = 'info';
          } else if ([1, 25, 26].includes(codTipo)) {
            if (atraso >= PLAZO_JC) styleOption = 'danger';
            else if (atraso >= PLAZO_JC - PLAZO_AVISO) styleOption = 'info';
          }

          return {
            nro_doc: formatDocumento(nroDoc),
            nombre: `${ringItem['nomb_1']} ${ringItem['nomb_2']} ${ringItem['apel_1']} ${ringItem['apel_2']}`,
            fecha_solicitud: parsedFechaSolicitud
              ? parsedFechaSolicitud.toLocaleDateString('es-ES')
              : 'Fecha no disponible',
            dias_atraso: atraso,
            apiaMatches: apiaMatches.map((apiaItem) => ({
              nro_expediente: apiaItem['Nro. expediente'],
              usuario_actual: apiaItem['Usuario actual'],
              cant_dias: apiaItem['Cant. días'],
            })),
            desc_tipo_solic: ringItem['desc_tipo_solic'],
            cod_tipo_solicitud: ringItem['cod_tipo_solicitud'],
            styleOption, // Guardamos el estilo calculado
          };
        })
        .filter((item) => item !== null);

      // Ordenar el resultado por días de atraso
      result.sort((a, b) => a.dias_atraso - b.dias_atraso);

      setTimeout(() => {
        dispatch(setProcessedData(result));
        dispatch(setProcessingData(false));
      }, 1000);
    }
  }, [ringData, apiaData, dispatch, PLAZO_JC, PLAZO_PCUC, PLAZO_AVISO, department]);

  if (processingData) {
    return (
      <div className="result-container">
        <LoadingSpinner />
      </div>
    );
  }

  // Filtrado según filterOption
  let filteredData = processedData;
  if (filterOption === 'info') {
    // Solo los que tienen styleOption === 'info'
    filteredData = processedData.filter((item) => item.styleOption === 'info');
  } else if (filterOption === 'safe') {
    // Todos menos los que tienen styleOption === 'danger'
    filteredData = processedData.filter((item) => item.styleOption !== 'danger');
  }

  if (filteredData.length > 0) {
    return (
      <div className="result-container">
        {filteredData.map((item, index) => (
          <ResultCard key={index} item={item} />
        ))}
      </div>
    );
  }

  return (
    <div className="result-container">
      <p>No hay datos para mostrar.</p>
    </div>
  );
};

export default Results;

'''




Quisiera crear un componente: 'Reporte.jsx' que sea un reporte del resultado obtenido en Result.jsx:

x {TRAMITES} pendientes
y {TRAMITES} por vencer en x días
z {TRAMITES} al día
w {TRAMITES} vencidos

{TRAMITES} 
Si cod_tipo=1 o cod_tipo=25 o cod_tipo=26 seria 'Jubilación comun' 
Si cod_tipo=9 seria 'Incapacidad' 

Me guiaría por la siguiente logica para determinar 'pendientes', 'por vencer en x dias', 'al día' y 'vencidos':
'''
// Determinar el styleOption basándonos en la lógica
        const codTipo = parseInt(ringItem['cod_tipo_solicitud'], 10);
        let styleOption = '';
        if (codTipo === 9) {
          if (atraso >= PLAZO_PCUC) styleOption = 'danger';
          else if (atraso >= PLAZO_PCUC - PLAZO_AVISO) styleOption = 'info';
        } else if ([1, 25, 26].includes(codTipo)) {
          if (atraso >= PLAZO_JC) styleOption = 'danger';
          else if (atraso >= PLAZO_JC - PLAZO_AVISO) styleOption = 'info';
        }
'''
'pendientes' serian todos.
'por vencer en x días' serian los que tienen la clase 'info'
'al día' serian los de la clase 'info' y los sin clase
'vencidos' serian los de la clase 'danger'

Te paso, por las dudas, el componente Result, como lo tengo y el store.
'''
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setProcessedData, setProcessingData } from '../store/dataSlice';
import ResultCard from './ResultCard';
import LoadingSpinner from './LoadingSpinner';
import { parseDate } from '../utils/dateUtils';
import { formatDocumento } from '../utils/formatUtils';

const Results = () => {
  const dispatch = useDispatch();
  const ringData = useSelector((state) => state.data.ringData);
  const apiaData = useSelector((state) => state.data.apiaData);
  const processedData = useSelector((state) => state.data.processedData);
  const processingData = useSelector((state) => state.data.processingData);
  const filterOption = useSelector((state) => state.ui.filterOption);
  const department = useSelector((state) => state.ui.department); // Obtener el departamento

  const PLAZO_JC = parseInt(import.meta.env.VITE_PLAZO_JC, 10);
  const PLAZO_PCUC = parseInt(import.meta.env.VITE_PLAZO_PCUC, 10);
  const PLAZO_AVISO = parseInt(import.meta.env.VITE_PLAZO_AVISO, 10);

  useEffect(() => {
    if (ringData.length > 0) {
      dispatch(setProcessingData(true)); // Inicia el procesamiento

      const fechaActual = new Date();

      const diasAtraso = (fechaSolicitud) => {
        const fecha = parseDate(fechaSolicitud);
        if (!fecha || isNaN(fecha.getTime())) return 0;
        const diffTime = fechaActual - fecha;
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
      };

      // Filtrar los datos basados en el departamento
      const ringFiltered = department === 'MONTEVIDEO'
        ? ringData
        : ringData.filter(
            (item) =>
              item['departamento'] &&
              item['departamento'].toUpperCase() === department.toUpperCase()
          );

      let result = ringFiltered.map((ringItem) => {
        const nroDoc = ringItem['nro_doc'];

        // Buscar coincidencias en APIA
        const apiaMatches = apiaData.filter((apiaItem) => {
          const asunto = apiaItem['Asunto'] || '';
          const docInAsunto = asunto.split(' ')[0];
          return docInAsunto === nroDoc?.toString();
        });

        const fechaSolicitud = ringItem['fecha_solicitud'];
        const parsedFechaSolicitud = fechaSolicitud
          ? parseDate(fechaSolicitud)
          : null;

        const atraso = parsedFechaSolicitud
          ? diasAtraso(parsedFechaSolicitud)
          : 0;

        // Determinar el styleOption basándonos en la lógica
        const codTipo = parseInt(ringItem['cod_tipo_solicitud'], 10);
        let styleOption = '';
        if (codTipo === 9) {
          if (atraso >= PLAZO_PCUC) styleOption = 'danger';
          else if (atraso >= PLAZO_PCUC - PLAZO_AVISO) styleOption = 'info';
        } else if ([1, 25, 26].includes(codTipo)) {
          if (atraso >= PLAZO_JC) styleOption = 'danger';
          else if (atraso >= PLAZO_JC - PLAZO_AVISO) styleOption = 'info';
        }

        // Retorna siempre el item de RING con o sin coincidencias en APIA
        return {
          nro_doc: formatDocumento(nroDoc),
          nombre: `${ringItem['nomb_1']} ${ringItem['nomb_2']} ${ringItem['apel_1']} ${ringItem['apel_2']}`,
          fecha_solicitud: parsedFechaSolicitud
            ? parsedFechaSolicitud.toLocaleDateString('es-ES')
            : 'Fecha no disponible',
          dias_atraso: atraso,
          apiaMatches: apiaMatches.map((apiaItem) => ({
            nro_expediente: apiaItem['Nro. expediente'],
            usuario_actual: apiaItem['Usuario actual'],
            cant_dias: apiaItem['Cant. días'],
          })),
          desc_tipo_solic: ringItem['desc_tipo_solic'],
          cod_tipo_solicitud: ringItem['cod_tipo_solicitud'],
          styleOption, // Guardamos el estilo calculado
        };
      });

      // Ordenar el resultado por días de atraso
      result.sort((a, b) => a.dias_atraso - b.dias_atraso);

      setTimeout(() => {
        dispatch(setProcessedData(result));
        dispatch(setProcessingData(false));
      }, 1000);
    }
  }, [ringData, apiaData, dispatch, PLAZO_JC, PLAZO_PCUC, PLAZO_AVISO, department]);

  if (processingData) {
    return (
      <div className="result-container">
        <LoadingSpinner />
      </div>
    );
  }

  // Filtrado según filterOption
  let filteredData = processedData;
  if (filterOption === 'info') {
    // Solo los que tienen styleOption === 'info'
    filteredData = processedData.filter((item) => item.styleOption === 'info');
  } else if (filterOption === 'safe') {
    // Todos menos los que tienen styleOption === 'danger'
    filteredData = processedData.filter((item) => item.styleOption !== 'danger');
  }

  if (filteredData.length > 0) {
    return (
      <div className="result-container">
        {filteredData.map((item, index) => (
          <ResultCard key={index} item={item} />
        ))}
      </div>
    );
  }

  return (
    <div className="result-container">
      <p>No hay datos para mostrar.</p>
    </div>
  );
};

export default Results;

'''
'''
// src/store/dataSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  ringData: [],
  apiaData: [],
  processedData: [],
  loadingRing: false,
  loadingApia: false,
  processingData: false,
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setRingData(state, action) {
      state.ringData = action.payload;
      state.loadingRing = false; // Termina la carga
    },
    setApiaData(state, action) {
      state.apiaData = action.payload;
      state.loadingApia = false; // Termina la carga
    },
    setProcessedData(state, action) {
      state.processedData = action.payload;
      state.processingData = false; // Termina el procesamiento
    },
    setLoadingRing(state, action) {
      state.loadingRing = action.payload;
    },
    setLoadingApia(state, action) {
      state.loadingApia = action.payload;
    },
    setProcessingData(state, action) {
      state.processingData = action.payload;
    },
  },
});

export const {
  setRingData,
  setApiaData,
  setProcessedData,
  setLoadingRing,
  setLoadingApia,
  setProcessingData,
} = dataSlice.actions;

export default dataSlice.reducer;

'''































Te recuerdo que estamos trabajando con una app en React+Redux cuyo contenido se abre en un contenedor que contiene RightColumn y LeftColumn.
Generalmente los botones y algun reporte se hace en RightColumn y el resultado o lo principal en LeftColumn.
Para este caso crearemos en LeftColumn un componente que sera un formulario con campos que al completar y apretar un boton, completaran un archivo en WORD predefinido.
El archivo de word tendra campos entre corchetes {}, que seran completados por los datos que llene en el formulario. Ejemplo: Si el campo se llama NOMBRE_ATRIBUTO_INSC, dentro del word existira el dato {NOMBRE_ATRIBUTO_INSC} que sera reemplazado por el valor que complete.
Te voy a pasar un custom hook que he creado, que seria util que lo utilizara para mejorar la usabilidad del codigo:
'''
# useForm.js

import { useState } from 'react';

export const useForm = ( initialForm = {} ) => {
  
    const [ formState, setFormState ] = useState( initialForm );

    const onInputChange = ({ target }) => {
        const { name, value } = target;
        setFormState({
            ...formState,
            [ name ]: value
        });
    }

    const onResetForm = () => {
        setFormState( initialForm );
    }

    return {
        ...formState,
        formState,
        onInputChange,
        onResetForm,
    }
}
'''

Tambien te paso los archivos del proyecto que te pueden ser utiles:
'''
# src/components/LeftColumn.jsx
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
            <p>Infromación Personal</p>
          </section>
        );
      // ...otros casos...
      default:
        return <div>Selecciona una opción.</div>;
    }

}

export default LeftColumn;

'''
'''
# src/components/RightColumn.jsx
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

'''
'''
# src/store/dataSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  ringData: [],
  apiaData: [],
  processedData: [],
  loadingRing: false,
  loadingApia: false,
  processingData: false,
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setRingData(state, action) {
      state.ringData = action.payload;
      state.loadingRing = false; // Termina la carga
    },
    setApiaData(state, action) {
      state.apiaData = action.payload;
      state.loadingApia = false; // Termina la carga
    },
    setProcessedData(state, action) {
      state.processedData = action.payload;
      state.processingData = false; // Termina el procesamiento
    },
    setLoadingRing(state, action) {
      state.loadingRing = action.payload;
    },
    setLoadingApia(state, action) {
      state.loadingApia = action.payload;
    },
    setProcessingData(state, action) {
      state.processingData = action.payload;
    },
  },
});

export const {
  setRingData,
  setApiaData,
  setProcessedData,
  setLoadingRing,
  setLoadingApia,
  setProcessingData,
} = dataSlice.actions;

export default dataSlice.reducer;

'''
'''
# src/store/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoggedIn: false,
  department: null,
  sidebarCollapsed: false,
  selectedSidebarItem: 'Pasivos',
  selectedHeaderItem: 'InformePasivos',
  selectedPage: 'InformePasivos',
  filterOption: 'all', // 'all', 'info', 'safe'
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSelectedSidebarItem(state, action) {
      state.selectedSidebarItem = action.payload;
      // Resetear el item del header cada vez que cambie el sidebar
      state.selectedHeaderItem = null;
      // Resetear la página seleccionada al cambiar de sidebar
      state.selectedPage = null;
    },
    setSelectedHeaderItem(state, action) {
      state.selectedHeaderItem = action.payload;
    },
    setSelectedPage(state, action) {
      state.selectedPage = action.payload;
    },
    setFilterOption(state, action) {
      state.filterOption = action.payload;
    },
    login(state, action) {
      state.isLoggedIn = true;
      state.department = action.payload;
      // Opcional: Seleccionar automáticamente el sidebar y header basado en el departamento
      // Por ejemplo, si el departamento es "Informes", seleccionar "Informes" en el sidebar
      // Puedes personalizar esta lógica según tus necesidades
    },
    logout(state) {
      state.isLoggedIn = false;
      state.department = null;
      state.selectedSidebarItem = null;
      state.selectedHeaderItem = null;
      state.selectedPage = null;
    },
  },
});

export const {
  toggleSidebar,
  setSelectedSidebarItem,
  setSelectedHeaderItem,
  setSelectedPage,
  setFilterOption,
  login,
  logout,
} = uiSlice.actions;

export default uiSlice.reducer;

'''


En principio seria eso. Vamos a tener un archivo WORD, ingresamos datos desde un formulario de React y los completamos en el formulario.
Explicame al detalle que es lo que tengo que hacer. Donde deberia poner el archivo de word. Las librerias que debo instalar para trabajar con word, etc.

## CAMPOS

# Campos con datos completados en el formulario (coloque la etiqueta y el nombre del campo)
Documento del menor
{MENOR_DOCUMENTO}
Nombres
{MENOR_NOMBRE}
Apellidos
{MENOR_APELLIDO}

Documento del atributario
{ATRIB_DOCUMENTO}
Nombres
{ATRIB_NOMBRE}
Apellidos
{ATRIB_APELLIDO}

Domicilio
{DOMICILIO}
Teléfono
{TELEFONO}

# Campos que se cargan solos
{AUTO_CIUDAD} (en este campo se carga 'Rivera', por ahora. Luego se cambiará)
{AUTO_FECHA_LARGA} (en este campo se carga la fecha actual, del tipo: 'jueves, 19 de diciembre de 2024') 
{AUTO_BPS_NOMBRE} (en este campo se carga 'BPS Rivera', por ahora. Luego se cambiará)
{AUTO_BPS_DIRECCION} (en este campo se carga 'Uruguay 783', por ahora. Luego se cambiará)
{AUTO_NOMBRE_FUNC} (en este campo se carga 'Ricardo Ospitaletche', por ahora. Luego se cambiará)
{AUTO_NRO_FUNC} (en este campo se carga '16.251', por ahora. Luego se cambiará)
{AUTO_BPS_TEL} (en este campo se carga '46224529 int. 1', por ahora. Luego se cambiará)
{AUTO_BPS_EMAIL} (en este campo se carga 'administracionrivera@bps.gub.uy', por ahora. Luego se cambiará)

....

Te voy a pasar tambien los estilos que vengo usando. Para que el diseño siga un poco esa linea. Quiero que se vea con buena usabilidad. Tipo bootstrap.

































Esto es lo que me retorna, asi como esta. Creo que no esta encontrando el archivo de template.docx
'''
AsignacionDobleForm.jsx:37 
 GET http://localhost:5174/templates/template.docx 404 (Not Found)
pizzip.js?v=e9358f0a:2970 Uncaught (in promise) Error: Can't find end of central directory : is this a zip file ?
    at handleDownload (AsignacionDobleForm.jsx:39:17)

'''
Te recuerdo que tengo la siguiete configuracio en vite.config.js. Puede que sea por eso.
'''
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      overlay: false
    }
  },
  base: '/bps-gude/',
  build: {
    outDir: 'docs', // Si estás usando 'docs' para GitHub Pages
  },
})
'''

Por otro lado, creo que me olvide de pasarte los estilos que manejo. Te los paso acá. Porque no quedo muy bien. 
'''
/* Variables CSS para colores y tipografías */
:root {
    /* Colores */
    --color-primario: #21355b; /* Azul */
    --color-primario-oscuro: #182542;
    --color-secundario: #00ace7; /* Gris */
    --color-acentuado: #099595; /* Color complementario (verde) */
    --color-fondo: #f7f7f7; /* Fondo claro */
    --color-texto: #343639; /* Texto oscuro */
    --color-texto-claro: #75777b;

    --color-bg-primary:#cfe2ff;
    --color-txt-primary:#052c65;
    --color-brd-primary:#9ec5fe;
    --color-bg-info:#cff4fc;
    --color-txt-info:#055160;
    --color-brd-info:#9eeaf9;
    --color-bg-danger:#f8d7da;
    --color-txt-danger:#58151c;
    --color-brd-danger:#f1aeb5;
    --color-bg-warning:#fff3cd;
    --color-txt-warning:#664d03;
    --color-brd-warning:#ffe69c;

    /* Tipografías */
    --fuente-principal: 'Barlow', sans-serif;
    --fuente-secundaria: 'Lato', sans-serif;

    /* Tamaños */
    --ancho-sidebar-colapsada: 40px;
    --ancho-sidebar-expandida: 200px;
    --transicion: 0.3s ease;

    --ancho-header: 60px;
}

*, *::before, *::after {
    box-sizing: border-box;
}

/* Estilos globales */
/* Eliminar la clase .body y aplicar estilos al body directamente */
body {
    margin: 0;
    font-family: var(--fuente-principal);
    background-color: var(--color-fondo);
    color: var(--color-texto);
  }
  
  /* Asegurar que html y body ocupen todo el ancho y alto */
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
  }

.heading-primary, .heading-secondary {
    color: var(--color-secundario);
}

/* Header */
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: white;
    color: var(--color-texto);
    height: var(--ancho-header);
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header__logo {
    height: var(--ancho-header);
    width: var(--ancho-sidebar-expandida);
    background-color: var(--color-primario);
    text-align: center;
}

.header__logo img {
    max-height: 60px;
    cursor: pointer;
}

/* Menú de navegación */
.nav-menu {
    list-style: none;
    display: flex;
    margin: 0;
    padding: 0;
    width: 100%;
    justify-content: space-around;
}

.nav-menu__item {
    flex-grow: 1;
    text-align: center;
}

.nav-menu__link {
    color: var(--color-secundario);
    text-decoration: none;
    text-transform: uppercase;
    font-family: var(--fuente-principal);
    display: block;
    padding: 10px;
    height: var(--ancho-header);
    align-content: center;
}

.nav-menu__link:hover {
    background-color: var(--color-fondo);
    border-bottom: var(--color-secundario) 2px solid;
    font-weight: 600;
}

.nav-menu__link--activa {
    background-color: var(--color-secundario);
    color: #fff !important;
    font-weight: 600;
}

/* Barra lateral */
.sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: var(--ancho-sidebar-expandida);
    background-color: var(--color-primario-oscuro);
    color: white;
    overflow-x: hidden;
    transition: width var(--transicion);
    padding-top: var(--ancho-header);
    z-index: 999;
}

.sidebar--collapsed {
    width: var(--ancho-sidebar-colapsada);
}

.sidebar__list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.sidebar__item {
    display: flex;
    align-items: center;
    padding: 15px 10px;
    cursor: pointer;
}

.sidebar__item:hover {
    background-color: var(--color-secundario);
}

.sidebar__item--activo {
    background-color: var(--color-secundario);
}

.sidebar__icon {
    margin-right: 10px;
}

.sidebar__text {
    transition: opacity var(--transicion);
}

.sidebar--collapsed .sidebar__text {
    opacity: 0;
    pointer-events: none;
}

/* Botón de toggle */
.sidebar__toggle-btn {
    position: absolute;
    bottom: 0;
    width: 100%;
    justify-content: center;
}

/* Contenedor principal */
.container {
    margin-left: var(--ancho-sidebar-expandida);
    padding: 20px;
    transition: margin-left var(--transicion);
    padding-top: calc(var(--ancho-header) + 20px);
    /* Migrara a Flexbox */
    display: flex;
    flex-wrap: nowrap;
}

.sidebar--collapsed ~ .container {
    margin-left: var(--ancho-sidebar-colapsada);
}

/* Columnas */
.container__left-column, .container__right-column {
    padding: 20px;
    font-family: var(--fuente-secundaria);
}

.container__left-column {
    width: 70%;
    /* float: left; */
}

.container__right-column {
    width: 30%;
    /* float: right; */
}

/* Limpiar floats */
.container::after {
    content: "";
    display: table;
    clear: both;
}

/* Footer */
.footer {
    text-align: center;
    padding: 10px;
    background-color: var(--color-primario);
    color: white;
    position: fixed;
    width: 100%;
    bottom: 0;
    font-family: var(--fuente-secundaria);
}

/* Diseño responsivo */
@media (max-width: 768px) {
    /* Ajustes para tabletas */
    .container__left-column, .container__right-column {
        width: 100%;
        float: none;
    }

    .container {
        margin-left: var(--ancho-sidebar-expandida);
    }

    .sidebar--collapsed ~ .container {
        margin-left: var(--ancho-sidebar-colapsada);
    }
}

@media (max-width: 480px) {
    /* Ajustes para móviles */
    .header {
        flex-direction: column;
        align-items: flex-start;
    }

    .nav-menu {
        flex-direction: column;
    }

    .nav-menu__item {
        margin-left: 0;
        margin-top: 10px;
    }

    .container {
        margin-left: 0;
    }

    .sidebar {
        display: none;
    }
}

/* src/components/Results.css */

.result-container {
    display: flex;
    flex-wrap: wrap; /* Permite que los elementos se envuelvan */
    gap: 20px; /* Espaciado entre columnas y filas */
    justify-content: flex-start; /* Alinea los elementos al inicio */
    /* padding: 10px; /* Añade un poco de espacio interno */
    width: 100%; /* Asegura que use todo el ancho del contenedor */
    box-sizing: border-box; /* Incluye padding en el cálculo del ancho */
    margin-bottom: 60px;
  }
  
  .result-card {
    background-color: #ffffff;
    border: 1px solid #ddd;
    color: #333;
    border-radius: 10px;
    padding: 15px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    flex: 1 1 calc(50% - 20px); /* Dos columnas menos el espacio del gap */
    max-width: calc(50% - 20px); /* Asegura que no exceda la mitad del ancho */
    box-sizing: border-box; /* Incluye padding y borde en el ancho total */
  }
  
  @media (max-width: 768px) {
    .result-card {
      flex: 1 1 100%; /* Una columna en pantallas pequeñas */
    }
  }
  
  .gap-data {
    margin-bottom: 10px;
  }
  
  .gap-item {
    font-size: 16px;
    margin-bottom: 5px;
  }
  
  .label {
    font-weight: bold;
    color: #333;
  }
  
  .divider {
    height: 1px;
    background-color: #ddd;
    margin: 10px 0;
  }
  
  .atenciones {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .atencion-item {
    padding: 10px;
    background-color: #f9f9f9;
    border: 1px solid #eee;
    border-radius: 5px;
  }
  
  .atencion-item:hover {
    background-color: #f1f1f1;
  }
  
  .atencion-detail {
    font-size: 14px;
    color: #555;
    margin-bottom: 5px;
  }
  
  .no-atencion {
    font-style: italic;
    color: #888;
  }

  /* Estilos para la clase 'info' */
.result-card.info {
  /*background-color: var(--color-bg-info);*/
  background-color: white;
  border-color: var(--color-brd-info);
  color: var(--color-txt-info);
}

.result-card.info .label,
.result-card.info .atencion-detail,
.result-card.info .no-atencion {
  color: var(--color-txt-info);
}

.result-card.info .atencion-item {
  background-color: var(--color-bg-info);
  border-color: var(--color-brd-info);
}

/* Estilos para la clase 'danger' */
.result-card.danger {
  /*background-color: var(--color-bg-danger);*/
  background-color: white;
  border-color: var(--color-brd-danger);
  color: var(--color-txt-danger);
}

.result-card.danger .label,
.result-card.danger .atencion-detail,
.result-card.danger .no-atencion {
  color: var(--color-txt-danger);
}

.result-card.danger .atencion-item {
  background-color: var(--color-bg-danger);
  border-color: var(--color-brd-danger);
}
  
  /* Upload buttons */

 /* Contenedor de los botones */
.upload-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Cada botón de carga */
.upload-button {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Ocultar el input pero mantener su funcionalidad */
.upload-button input[type="file"] {
  display: none;
}

/* Estilo para el botón */
.upload-button button {
  background-color: var(--color-secundario);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 16px;
  font-family: var(--fuente-principal);
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

/* Hover del botón */
.upload-button button:hover {
  background-color: #008bb5; /* Un tono más oscuro del color secundario */
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
}

/* Estado activo (clic) */
.upload-button button:active {
  background-color: #006f8f; /* Aún más oscuro */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transform: scale(0.98); /* Pequeño efecto de "clic" */
}

/* Estilo del label */
.upload-button label {
  font-size: 16px;
  font-weight: bold;
  color: var(--color-texto);
  font-family: var(--fuente-secundaria);
}


/* src/components/LoadingSpinner.css */

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100px; /* Ajusta según tus necesidades */
}

.spinner {
  border: 8px solid #f3f3f3;
  border-top: 8px solid var(--color-secundario);
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.header__user-register {
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-icon {
  font-size: 20px;
  color: var(--color-secundario);
}

.user-logout {
  font-size: 16px;
  cursor: pointer;
  color: var(--color-primario);
}

.user-logout:hover {
  text-decoration: underline;
}



/* src/components/FilterOptions.css */

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-option input[type="radio"] {
  display: none; /* Ocultar el radio button nativo */
}

.filter-option label {
  position: relative;
  padding-left: 30px;
  cursor: pointer;
  font-size: 16px;
  color: var(--color-texto);
  font-family: 'Lato', sans-serif;
  user-select: none;
}

/* Círculo exterior */
.filter-option label::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-primario-oscuro);
  border-radius: 50%;
  background-color: var(--color-fondo);
  transition: all 0.3s ease;
}

/* Círculo interior (visible cuando está seleccionado) */
.filter-option label::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--color-secundario);
  opacity: 0;
  transition: opacity 0.3s ease;
}

/* Cuando el radio está seleccionado */
.filter-option input[type="radio"]:checked + label::after {
  opacity: 1;
}

/* Cambiar el color del círculo exterior cuando está seleccionado */
.filter-option input[type="radio"]:checked + label::before {
  border-color: var(--color-secundario);
}

/* Efecto hover */
.filter-option label:hover::before {
  background-color: var(--color-acentuado);
  border-color: var(--color-acentuado);
}

.filter-option label:hover::after {
  opacity: 1;
}

/* Transición suave para el círculo interior */
.filter-option label::after {
  transition: opacity 0.3s ease;
}



/* src/components/LoginPage.css */

.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* Altura completa de la ventana */
  background-color: var(--color-fondo);
}

.login-form {
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 40px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 400px;
  max-width: 90%;
}

.login-form h2 {
  text-align: center;
  color: var(--color-primario);
  margin-bottom: 30px;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: 600;
  color: var(--color-texto);
}

.form-group select {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  font-family: var(--fuente-secundaria);
}

.form-group select:focus {
  outline: none;
  border-color: var(--color-secundario);
  box-shadow: 0 0 5px rgba(0, 172, 231, 0.5);
}

.error-message {
  color: var(--color-danger);
  text-align: center;
  margin-bottom: 10px;
}

button[type="submit"] {
  width: 100%;
  padding: 12px;
  background-color: var(--color-secundario);
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-family: var(--fuente-principal);
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button[type="submit"]:hover {
  background-color: #008bb5; /* Tono más oscuro */
}

button[type="submit"]:active {
  background-color: #006f8f;
}



.reporte-ring {
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 20px;
  margin: 20px 0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Lato', sans-serif;
}

.reporte-ring h2 {
  color: var(--color-primario);
  margin-bottom: 15px;
}

.reporte-ring ul {
  list-style: none;
  padding: 0;
}

.reporte-ring li {
  font-size: 16px;
  color: var(--color-texto);
  margin-bottom: 10px;
}

.reporte-ring strong {
  color: var(--color-secundario);
  font-weight: bold;
}

'''
Por otro lado, quisiera que, luego de convertir el archivo, se me colocase un boton en RightColumn, que me permita descargarlo. Puede



























Vamos a volver a trabajar la carga de archivos de la RING. 
Te voy a pasar los archivos que tengo. Pero te refrezco la memoria:
En 'LeftColumn' cargo archivos de 'RING' y de 'APIA'. 
Dependiendo el tipo_solicitud que se ve en 'RING' manejo los tiempos para el despliegue de plazos.
'''
import React from 'react';
import { useSelector } from 'react-redux';

const ReporteRing = () => {
  const processedData = useSelector((state) => state.data.processedData);
  const PLAZO_JC = parseInt(import.meta.env.VITE_PLAZO_JC, 10);
  const PLAZO_PCUC = parseInt(import.meta.env.VITE_PLAZO_PCUC, 10);
  const PLAZO_AVISO = parseInt(import.meta.env.VITE_PLAZO_AVISO, 10);

  let pendientes = 0;
  let porVencer = 0;
  let alDia = 0;
  let vencidos = 0;

  const getTipoTramite = (codTipo) => {
    if ([1, 25, 26].includes(codTipo)) {
      return 'Jubilación común';
    }
    if (codTipo === 9) {
      return 'Incapacidad';
    }
    return 'Otro';
  };

  processedData.forEach((item) => {
    const codTipo = parseInt(item.cod_tipo_solicitud, 10);
    const atraso = item.dias_atraso || 0;

    // Calcular clasificaciones
    if (codTipo === 9) {
      if (atraso >= PLAZO_PCUC) {
        vencidos++;
      } else if (atraso >= PLAZO_PCUC - PLAZO_AVISO) {
        porVencer++;
        alDia++;
      } else {
        alDia++;
      }
    } else if ([1, 25, 26].includes(codTipo)) {
      if (atraso >= PLAZO_JC) {
        vencidos++;
      } else if (atraso >= PLAZO_JC - PLAZO_AVISO) {
        porVencer++;
        alDia++;
      } else {
        alDia++;
      }
    }

    pendientes++;
  });

  return (
    <div className="reporte-ring">
      
      <ul>
        <li>
          <strong>{pendientes}</strong> trámites pendientes
        </li>
        <li>
          <strong>{porVencer}</strong> trámites por vencer en {PLAZO_AVISO} días
        </li>
        <li>
          <strong>{alDia}</strong> trámites al día
        </li>
        <li>
          <strong>{vencidos}</strong> trámites vencidos
        </li>
      </ul>
    
      
    </div>
  );
};

export default ReporteRing;

'''
'''
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

'''
'''
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

'''
'''
// src/components/FileUploader.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import {
  setRingData,
  setApiaData,
  setLoadingRing,
  setLoadingApia,
} from '../store/dataSlice';

const FileUploader = () => {
  const dispatch = useDispatch();
  const loadingRing = useSelector((state) => state.data.loadingRing);
  const loadingApia = useSelector((state) => state.data.loadingApia);

  const handleRingUpload = (file) => {
    if (!file) return;
    dispatch(setLoadingRing(true)); // Inicia la carga
    readExcel(file, (data) => dispatch(setRingData(data)));
  };

  const handleApiaUpload = (file) => {
    if (!file) return;
    dispatch(setLoadingApia(true)); // Inicia la carga
    readExcel(file, (data) => dispatch(setApiaData(data)), 1);
  };

  const readExcel = (file, callback, sheetIndex = 0) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: 'binary' });
      const sheetName = workbook.SheetNames[sheetIndex];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      callback(jsonData);
    };
    reader.readAsBinaryString(file);
  };

  const triggerFileInput = (id) => {
    document.getElementById(id).click();
  };

  return (
    <div className="upload-buttons">
      <div className="upload-button">
        <label htmlFor="ring-upload"></label>
        <input
          type="file"
          id="ring-upload"
          accept=".xlsx, .xls"
          onChange={(e) => handleRingUpload(e.target.files[0])}
        />
        <button onClick={() => triggerFileInput('ring-upload')}>
          {loadingRing ? 'Cargando...' : 'Subir Archivo RING'}
        </button>
      </div>
      <div className="upload-button">
        <label htmlFor="apia-upload"></label>
        <input
          type="file"
          id="apia-upload"
          accept=".xlsx, .xls"
          onChange={(e) => handleApiaUpload(e.target.files[0])}
        />
        <button onClick={() => triggerFileInput('apia-upload')}>
          {loadingApia ? 'Cargando...' : 'Subir Archivo APIA'}
        </button>
      </div>
    </div>
  );
};

export default FileUploader;


'''
'''
// src/components/FilterOptions.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterOption } from '../store/uiSlice';

const FilterOptions = () => {
  const dispatch = useDispatch();
  const filterOption = useSelector((state) => state.ui.filterOption);
  const PLAZO_AVISO = import.meta.env.VITE_PLAZO_AVISO;

  const handleChange = (e) => {
    dispatch(setFilterOption(e.target.value));
  };

  return (
    <div className="filter-options">
      <div className="filter-option">
        <input
          type="radio"
          id="all"
          name="filterOption"
          value="all"
          checked={filterOption === 'all'}
          onChange={handleChange}
        />
        <label htmlFor="all">
          <span>Todos los registros</span>
        </label>
      </div>

      <div className="filter-option">
        <input
          type="radio"
          id="info"
          name="filterOption"
          value="info"
          checked={filterOption === 'info'}
          onChange={handleChange}
        />
        <label htmlFor="info">
          <span>Faltan menos de {PLAZO_AVISO} días</span>
        </label>
      </div>

      <div className="filter-option">
        <input
          type="radio"
          id="safe"
          name="filterOption"
          value="safe"
          checked={filterOption === 'safe'}
          onChange={handleChange}
        />
        <label htmlFor="safe">
          <span>Están al día</span>
        </label>
      </div>
    </div>
  );
};

export default FilterOptions;

'''
'''
import React from 'react';
import { useSelector } from 'react-redux';

const ReporteRing = () => {
  const processedData = useSelector((state) => state.data.processedData);
  const PLAZO_JC = parseInt(import.meta.env.VITE_PLAZO_JC, 10);
  const PLAZO_PCUC = parseInt(import.meta.env.VITE_PLAZO_PCUC, 10);
  const PLAZO_AVISO = parseInt(import.meta.env.VITE_PLAZO_AVISO, 10);

  let pendientes = 0;
  let porVencer = 0;
  let alDia = 0;
  let vencidos = 0;

  const getTipoTramite = (codTipo) => {
    if ([1, 25, 26].includes(codTipo)) {
      return 'Jubilación común';
    }
    if (codTipo === 9) {
      return 'Incapacidad';
    }
    return 'Otro';
  };

  processedData.forEach((item) => {
    const codTipo = parseInt(item.cod_tipo_solicitud, 10);
    const atraso = item.dias_atraso || 0;

    // Calcular clasificaciones
    if (codTipo === 9) {
      if (atraso >= PLAZO_PCUC) {
        vencidos++;
      } else if (atraso >= PLAZO_PCUC - PLAZO_AVISO) {
        porVencer++;
        alDia++;
      } else {
        alDia++;
      }
    } else if ([1, 25, 26].includes(codTipo)) {
      if (atraso >= PLAZO_JC) {
        vencidos++;
      } else if (atraso >= PLAZO_JC - PLAZO_AVISO) {
        porVencer++;
        alDia++;
      } else {
        alDia++;
      }
    }

    pendientes++;
  });

  return (
    <div className="reporte-ring">
      
      <ul>
        <li>
          <strong>{pendientes}</strong> trámites pendientes
        </li>
        <li>
          <strong>{porVencer}</strong> trámites por vencer en {PLAZO_AVISO} días
        </li>
        <li>
          <strong>{alDia}</strong> trámites al día
        </li>
        <li>
          <strong>{vencidos}</strong> trámites vencidos
        </li>
      </ul>
    
      
    </div>
  );
};

export default ReporteRing;

'''
'''
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setProcessedData, setProcessingData } from '../store/dataSlice';
import ResultCard from './ResultCard';
import LoadingSpinner from './LoadingSpinner';
import { parseDate } from '../utils/dateUtils';
import { formatDocumento } from '../utils/formatUtils';

const Results = () => {
  const dispatch = useDispatch();
  const ringData = useSelector((state) => state.data.ringData);
  const apiaData = useSelector((state) => state.data.apiaData);
  const processedData = useSelector((state) => state.data.processedData);
  const processingData = useSelector((state) => state.data.processingData);
  const filterOption = useSelector((state) => state.ui.filterOption);
  const department = useSelector((state) => state.ui.department); // Obtener el departamento

  const PLAZO_JC = parseInt(import.meta.env.VITE_PLAZO_JC, 10);
  const PLAZO_PCUC = parseInt(import.meta.env.VITE_PLAZO_PCUC, 10);
  const PLAZO_AVISO = parseInt(import.meta.env.VITE_PLAZO_AVISO, 10);

  useEffect(() => {
    if (ringData.length > 0) {
      dispatch(setProcessingData(true)); // Inicia el procesamiento

      const fechaActual = new Date();

      const diasAtraso = (fechaSolicitud) => {
        const fecha = parseDate(fechaSolicitud);
        if (!fecha || isNaN(fecha.getTime())) return 0;
        const diffTime = fechaActual - fecha;
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
      };

      // Filtrar los datos basados en el departamento
      const ringFiltered = department === 'MONTEVIDEO'
        ? ringData
        : ringData.filter(
            (item) =>
              item['departamento'] &&
              item['departamento'].toUpperCase() === department.toUpperCase()
          );

      let result = ringFiltered.map((ringItem) => {
        const nroDoc = ringItem['nro_doc'];

        // Buscar coincidencias en APIA
        const apiaMatches = apiaData.filter((apiaItem) => {
          const asunto = apiaItem['Asunto'] || '';
          const docInAsunto = asunto.split(' ')[0];
          return docInAsunto === nroDoc?.toString();
        });

        const fechaSolicitud = ringItem['fecha_solicitud'];
        const parsedFechaSolicitud = fechaSolicitud
          ? parseDate(fechaSolicitud)
          : null;

        const atraso = parsedFechaSolicitud
          ? diasAtraso(parsedFechaSolicitud)
          : 0;

        // Determinar el styleOption basándonos en la lógica
        const codTipo = parseInt(ringItem['cod_tipo_solicitud'], 10);
        let styleOption = '';
        if (codTipo === 9) {
          if (atraso >= PLAZO_PCUC) styleOption = 'danger';
          else if (atraso >= PLAZO_PCUC - PLAZO_AVISO) styleOption = 'info';
        } else if ([1, 25, 26].includes(codTipo)) {
          if (atraso >= PLAZO_JC) styleOption = 'danger';
          else if (atraso >= PLAZO_JC - PLAZO_AVISO) styleOption = 'info';
        }

        // Retorna siempre el item de RING con o sin coincidencias en APIA
        return {
          nro_doc: formatDocumento(nroDoc),
          nombre: `${ringItem['nomb_1']} ${ringItem['nomb_2']} ${ringItem['apel_1']} ${ringItem['apel_2']}`,
          fecha_solicitud: parsedFechaSolicitud
            ? parsedFechaSolicitud.toLocaleDateString('es-ES')
            : 'Fecha no disponible',
          dias_atraso: atraso,
          apiaMatches: apiaMatches.map((apiaItem) => ({
            nro_expediente: apiaItem['Nro. expediente'],
            usuario_actual: apiaItem['Usuario actual'],
            cant_dias: apiaItem['Cant. días'],
          })),
          desc_tipo_solic: ringItem['desc_tipo_solic'],
          cod_tipo_solicitud: ringItem['cod_tipo_solicitud'],
          styleOption, // Guardamos el estilo calculado
        };
      });

      // Ordenar el resultado por días de atraso
      result.sort((a, b) => a.dias_atraso - b.dias_atraso);

      setTimeout(() => {
        dispatch(setProcessedData(result));
        dispatch(setProcessingData(false));
      }, 1000);
    }
  }, [ringData, apiaData, dispatch, PLAZO_JC, PLAZO_PCUC, PLAZO_AVISO, department]);

  if (processingData) {
    return (
      <div className="result-container">
        <LoadingSpinner />
      </div>
    );
  }

  // Filtrado según filterOption
  let filteredData = processedData;
  if (filterOption === 'info') {
    // Solo los que tienen styleOption === 'info'
    filteredData = processedData.filter((item) => item.styleOption === 'info');
  } else if (filterOption === 'safe') {
    // Todos menos los que tienen styleOption === 'danger'
    filteredData = processedData.filter((item) => item.styleOption !== 'danger');
  }

  if (filteredData.length > 0) {
    return (
      <div className="result-container">
        {filteredData.map((item, index) => (
          <ResultCard key={index} item={item} />
        ))}
      </div>
    );
  }

  return (
    <div className="result-container">
      <p>No hay datos para mostrar.</p>
    </div>
  );
};

export default Results;

'''

Voy a necesitar hacer practicamente lo mismo con otro archivo RING. El tema es que difiere un poco del archivo RING anterior.
En este caso no tiene el campo 'tipo_sol'. Sin embargo el tipo de solicitud se saca por la 'hoja' de excel en la que se trabaja. 
La primera hoja trabajará con el plazo (de .env) VITE_PLAZO_PV y la segunda hora con el plazo VITE_PLAZO_PCUC.
El resto se hara igual. Por lo tanto, a mi criterio, se podria usar el mismo componente Result.jsx

Se me ocurre que por debajo de esta parte (de rightColumn):
'''

          <h2 className="heading-secondary">Cargar Archivos</h2>
          <FileUploader />
          <FilterOptions />
          <ReporteRing />

'''

Podrian haber componentes parecidos (o los mismos con modificaciones) para realizar ese proceso.
Un detalle que he notado es que el campo 'nro_doc', en la hoja 2, se ve mal: 'nombre:PENSION INVALIDEZ>nro_doc' (no se si es en este archivo en particular o en todos), por lo tanto seria conveniente no trabajarlo por el nombre. Es posible?

Puedes ayudarme con esto?
Te pido por favor que me pases los archivos completos.























No quede muy conforme con como quedó la modificación.
Quisiera cambiar un poco

Podemos modificar los archivos para que no se utilice el select (entre hoja 1 y hoja 2)
En su lugar, que se utilice 2 botones. [Pension Invalidez] y [Pension Vejez]

Aparecerian 3 botones:
En que se venia usando hasta ahora que funcionaba bien: 

[Subir Archivo RING]

[Pension Vejez]
[Pension Invalidez]

Luego, los radio buttons de filtros serian los mismos para ambos
El cuadro de Reporte seria el mismo para ambos

Cuando subo el APIA, deberia actualizar tambien los resultados de [Pension Vejez] y [Pension Invalidez]

....

Por otro lado, asi como esta, no esta funcionando. Por lo que te pediria que reveas el codigo. No esta subiendo el archivo, o por lo menos no lo esta mostrando
Te voy a pasar la info que contiene el archivo:
# Hoja 1:
nro_doc	apel_1	apel_2	nomb_1	nomb_2	fecha_nac	fecha_fallec	nro_solicitud	fecha_solicitud	fecha_estado	usuario_id	cod_agencia	usuaro_id	nombre_usuario	cod_agencia	desc_agencia	localidad	departamento								
# Hoja 2:
nombre:PENSION INVALIDEZ>nro_doc	apel_1	apel_2	nomb_1	nomb_2	fecha_nac	fecha_fallec	nro_solicitud	fecha_solicitud	fecha_estado	usuario_id	cod_agencia	usuaro_id	nombre_usuario	cod_agencia	desc_agencia	localidad	departamento

Recuerda lo que te habia comentado sobre el nombre de la columna 1 de la Hoja 2: nombre:PENSION INVALIDEZ>nro_doc. Calculo que es un error, el dato corresponde al de nro_doc. Pienso que los archivos vendrian con el campo: nro_doc. Pero si pudieramos hacerlo para que funcione de cualquier modo, mejor.
.....

Te voy a volver pasar los archivos, asi como se ven. Para que los modifiques. Ten cuidado en tocar lo de lo anterior que ya andaba bien. Y si pudes mandame los archivos completos, pero con mucho cuidado de no olvidarte de nada de lo que ya funcionaba.
'''
# src/store/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoggedIn: false,
  department: null,
  sidebarCollapsed: false,
  selectedSidebarItem: 'Pasivos',
  selectedHeaderItem: 'InformePasivos',
  selectedPage: 'InformePasivos',
  filterOption: 'all', // 'all', 'info', 'safe'
  filterOption2: 'all', // Para el segundo RING
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSelectedSidebarItem(state, action) {
      state.selectedSidebarItem = action.payload;
      // Resetear el item del header cada vez que cambie el sidebar
      state.selectedHeaderItem = null;
      // Resetear la página seleccionada al cambiar de sidebar
      state.selectedPage = null;
    },
    setSelectedHeaderItem(state, action) {
      state.selectedHeaderItem = action.payload;
    },
    setSelectedPage(state, action) {
      state.selectedPage = action.payload;
    },
    setFilterOption(state, action) {
      state.filterOption = action.payload;
    },
    setFilterOption2(state, action) {
      state.filterOption2 = action.payload;
    },
    login(state, action) {
      state.isLoggedIn = true;
      state.department = action.payload;
      // Opcional: Seleccionar automáticamente el sidebar y header basado en el departamento
      // Por ejemplo, si el departamento es "Informes", seleccionar "Informes" en el sidebar
      // Puedes personalizar esta lógica según tus necesidades
    },
    logout(state) {
      state.isLoggedIn = false;
      state.department = null;
      state.selectedSidebarItem = null;
      state.selectedHeaderItem = null;
      state.selectedPage = null;
      state.filterOption = 'all';
      state.filterOption2 = 'all';
    },
  },
});

export const {
  toggleSidebar,
  setSelectedSidebarItem,
  setSelectedHeaderItem,
  setSelectedPage,
  setFilterOption,
  setFilterOption2,
  login,
  logout,
} = uiSlice.actions;

export default uiSlice.reducer;

'''
'''
# src/store/dataSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Primer RING
  ringData: [],
  apiaData: [],
  processedData: [],
  loadingRing: false,
  loadingApia: false,
  processingData: false,

  // Segundo RING
  ring2Data: [],
  loadingRing2: false,
  processedData2: [],
  processingData2: false,

  // Documento generado
  generatedDocument: null,
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    // Acciones para el primer RING
    setRingData(state, action) {
      state.ringData = action.payload;
      state.loadingRing = false;
    },
    setApiaData(state, action) {
      state.apiaData = action.payload;
      state.loadingApia = false;
    },
    setProcessedData(state, action) {
      state.processedData = action.payload;
      state.processingData = false;
    },
    setLoadingRing(state, action) {
      state.loadingRing = action.payload;
    },
    setLoadingApia(state, action) {
      state.loadingApia = action.payload;
    },
    setProcessingData(state, action) {
      state.processingData = action.payload;
    },

    // Acciones para el segundo RING
    setRing2Data(state, action) {
      state.ring2Data = action.payload;
      state.loadingRing2 = false;
    },
    setLoadingRing2(state, action) {
      state.loadingRing2 = action.payload;
    },
    setProcessedData2(state, action) {
      state.processedData2 = action.payload;
      state.processingData2 = false;
    },
    setProcessingData2(state, action) {
      state.processingData2 = action.payload;
    },

    // Acciones para el documento generado
    setGeneratedDocument(state, action) {
      state.generatedDocument = action.payload;
    },
    resetGeneratedDocument(state) {
      state.generatedDocument = null;
    },
  },
});

export const {
  // Acciones para el primer RING
  setRingData,
  setApiaData,
  setProcessedData,
  setLoadingRing,
  setLoadingApia,
  setProcessingData,

  // Acciones para el segundo RING
  setRing2Data,
  setLoadingRing2,
  setProcessedData2,
  setProcessingData2,

  // Acciones para el documento generado
  setGeneratedDocument,
  resetGeneratedDocument,
} = dataSlice.actions;

export default dataSlice.reducer;


'''
'''

# src/components/RightColumn.jsx
import React from 'react';
import FileUploader from './FileUploader';
import FilterOptions from './FilterOptions';
import ReporteRing from './ReporteRing';
import FileUploaderSecondRing from './FileUploaderSecondRing';
import FilterOptionsSecond from './FilterOptionsSecond';
import ReporteRingSecond from './ReporteRingSecond';

function RightColumn({page}) {
  switch (page) {
    case 'InformePasivos':
      return (
        <section className="container__right-column">
          <h2 className="heading-secondary">Cargar Archivos RING y APIA</h2>
          <FileUploader />
          <FilterOptions />
          <ReporteRing />

          <hr />

          <h2 className="heading-secondary">Cargar Segundo Archivo RING</h2>
          <FileUploaderSecondRing />
          <FilterOptionsSecond />
          <ReporteRingSecond />
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

'''
'''

import React from 'react';
import { useSelector } from 'react-redux';

const ReporteRing = () => {
  const processedData = useSelector((state) => state.data.processedData);
  const PLAZO_JC = parseInt(import.meta.env.VITE_PLAZO_JC, 10);
  const PLAZO_PCUC = parseInt(import.meta.env.VITE_PLAZO_PCUC, 10);
  const PLAZO_AVISO = parseInt(import.meta.env.VITE_PLAZO_AVISO, 10);

  let pendientes = 0;
  let porVencer = 0;
  let alDia = 0;
  let vencidos = 0;

  const getTipoTramite = (codTipo) => {
    if ([1, 25, 26].includes(codTipo)) {
      return 'Jubilación común';
    }
    if (codTipo === 9) {
      return 'Incapacidad';
    }
    return 'Otro';
  };

  processedData.forEach((item) => {
    const codTipo = parseInt(item.cod_tipo_solicitud, 10);
    const atraso = item.dias_atraso || 0;

    // Calcular clasificaciones
    if (codTipo === 9) {
      if (atraso >= PLAZO_PCUC) {
        vencidos++;
      } else if (atraso >= PLAZO_PCUC - PLAZO_AVISO) {
        porVencer++;
        alDia++;
      } else {
        alDia++;
      }
    } else if ([1, 25, 26].includes(codTipo)) {
      if (atraso >= PLAZO_JC) {
        vencidos++;
      } else if (atraso >= PLAZO_JC - PLAZO_AVISO) {
        porVencer++;
        alDia++;
      } else {
        alDia++;
      }
    }

    pendientes++;
  });

  return (
    <div className="reporte-ring">
      
      <ul>
        <li>
          <strong>{pendientes}</strong> trámites pendientes
        </li>
        <li>
          <strong>{porVencer}</strong> trámites por vencer en {PLAZO_AVISO} días
        </li>
        <li>
          <strong>{alDia}</strong> trámites al día
        </li>
        <li>
          <strong>{vencidos}</strong> trámites vencidos
        </li>
      </ul>
    
      
    </div>
  );
};

export default ReporteRing;


'''
'''

# src/components/FileUploader.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import {
  setRingData,
  setApiaData,
  setLoadingRing,
  setLoadingApia,
} from '../store/dataSlice';

const FileUploader = () => {
  const dispatch = useDispatch();
  const loadingRing = useSelector((state) => state.data.loadingRing);
  const loadingApia = useSelector((state) => state.data.loadingApia);

  const handleRingUpload = (file) => {
    if (!file) return;
    dispatch(setLoadingRing(true)); // Inicia la carga
    readExcel(file, (data) => dispatch(setRingData(data)));
  };

  const handleApiaUpload = (file) => {
    if (!file) return;
    dispatch(setLoadingApia(true)); // Inicia la carga
    readExcel(file, (data) => dispatch(setApiaData(data)), 1);
  };

  const readExcel = (file, callback, sheetIndex = 0) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: 'binary' });
      const sheetName = workbook.SheetNames[sheetIndex];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      callback(jsonData);
    };
    reader.readAsBinaryString(file);
  };

  const triggerFileInput = (id) => {
    document.getElementById(id).click();
  };

  return (
    <div className="upload-buttons">
      <div className="upload-button">
        <label htmlFor="ring-upload"></label>
        <input
          type="file"
          id="ring-upload"
          accept=".xlsx, .xls"
          onChange={(e) => handleRingUpload(e.target.files[0])}
        />
        <button onClick={() => triggerFileInput('ring-upload')}>
          {loadingRing ? 'Cargando...' : 'Subir Archivo RING'}
        </button>
      </div>
      <div className="upload-button">
        <label htmlFor="apia-upload"></label>
        <input
          type="file"
          id="apia-upload"
          accept=".xlsx, .xls"
          onChange={(e) => handleApiaUpload(e.target.files[0])}
        />
        <button onClick={() => triggerFileInput('apia-upload')}>
          {loadingApia ? 'Cargando...' : 'Subir Archivo APIA'}
        </button>
      </div>
    </div>
  );
};

export default FileUploader;


'''
'''

// src/components/FileUploaderSecondRing.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import { setRing2Data, setLoadingRing2 } from '../store/dataSlice';

const FileUploaderSecondRing = () => {
  const dispatch = useDispatch();
  const loadingRing2 = useSelector((state) => state.data.loadingRing2);
  const [sheetIndex, setSheetIndex] = useState(0); // 0 = PV, 1 = PCUC
  
  const handleRing2Upload = (file) => {
    if (!file) return;
    dispatch(setLoadingRing2(true));
    readExcel(file, (data) => dispatch(setRing2Data(data)), sheetIndex);
  };

  const readExcel = (file, callback, sheetIndex = 0) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const binaryStr = event.target.result;
            const workbook = XLSX.read(binaryStr, { type: 'binary' });
            const sheetName = workbook.SheetNames[sheetIndex];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            callback(jsonData);
          } catch (error) {
            console.error('Error al leer el archivo Excel:', error);
            dispatch(setLoadingRing2(false));
            alert('Ocurrió un error al procesar el archivo. Asegúrate de que sea un archivo Excel válido.');
          }
    };
    reader.readAsBinaryString(file);
  };

  const triggerFileInput = () => {
    document.getElementById('ring2-upload').click();
  };

  return (
    <div className="upload-buttons">
      <div className="upload-button mb-3">
        <label htmlFor="sheet-select" className="form-label">Seleccionar hoja:</label>
        <select
          id="sheet-select"
          value={sheetIndex}
          onChange={(e) => setSheetIndex(parseInt(e.target.value, 10))}
          className="form-select"
        >
          <option value={0}>Hoja PV (Plazo VITE_PLAZO_PV)</option>
          <option value={1}>Hoja PCUC (Plazo VITE_PLAZO_PCUC)</option>
        </select>
      </div>

      <div className="upload-button">
        <input
          type="file"
          id="ring2-upload"
          accept=".xlsx, .xls"
          onChange={(e) => handleRing2Upload(e.target.files[0])}
          style={{ display: 'none' }}
        />
        <button
          onClick={triggerFileInput}
          className="btn btn-secondary"
          disabled={loadingRing2}
        >
          {loadingRing2 ? 'Cargando...' : 'Subir Segundo Archivo RING'}
        </button>
      </div>
    </div>
  );
};

export default FileUploaderSecondRing;


'''

'''

// src/components/FilterOptions.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterOption } from '../store/uiSlice';

const FilterOptions = () => {
  const dispatch = useDispatch();
  const filterOption = useSelector((state) => state.ui.filterOption);
  const PLAZO_AVISO = import.meta.env.VITE_PLAZO_AVISO;

  const handleChange = (e) => {
    dispatch(setFilterOption(e.target.value));
  };

  return (
    <div className="filter-options">
      <div className="filter-option">
        <input
          type="radio"
          id="all"
          name="filterOption"
          value="all"
          checked={filterOption === 'all'}
          onChange={handleChange}
        />
        <label htmlFor="all">
          <span>Todos los registros</span>
        </label>
      </div>

      <div className="filter-option">
        <input
          type="radio"
          id="info"
          name="filterOption"
          value="info"
          checked={filterOption === 'info'}
          onChange={handleChange}
        />
        <label htmlFor="info">
          <span>Faltan menos de {PLAZO_AVISO} días</span>
        </label>
      </div>

      <div className="filter-option">
        <input
          type="radio"
          id="safe"
          name="filterOption"
          value="safe"
          checked={filterOption === 'safe'}
          onChange={handleChange}
        />
        <label htmlFor="safe">
          <span>Están al día</span>
        </label>
      </div>
    </div>
  );
};

export default FilterOptions;


'''

Puedes ayudarme con eso?













































Esta quedando muy bien el codigo. 
Ya estan solucionados todos los temitas anteriores, por lo tanto ya no es necesario que sigas mostrandome la solucion. 
Partamos de la base que esta todo funcionando bien. Pero quiero algunos cambios y agregados.
1) En los cards, para los tipos PI (Pension Invalidez) y PV (Pensión Vejez) no se está imprimiendo 'Tipo de Solicitud'. Si bien la planilla no lo muestra, quisiera que apareciera: 'Pension Invalidez' o 'Pensión Vejez', dependiendo de cual sea el caso.
Sobre esos tambien tengo una consulta. Veo que el codigo, para definirlos, dice:
'''
// Función para lógica PV (Pensión Vejez)
  const codTipoLogicPV = () => {
    // PV = codTipo = 1 (asimilar JC), plazo = PLAZO_PV
    return { codTipo: 1, plazo: PLAZO_PV };
  };

  // Función para lógica PI (Pensión Invalidez)
  const codTipoLogicPI = () => {
    // PI = codTipo = 9 (Pensión Invalidez), plazo = PLAZO_PI
    return { codTipo: 9, plazo: PLAZO_PI };
  };

'''
Sin embargo no me queda claro porque tienen codTipo: 9 o codTipo: 1. 
Eso no altera su comportamiento en otra parte del codigo (confundirlos con los tipos que realmente son 1 o 9). Si consideras que no, no hay razon de modificarlo. Como te dije, el codigo anda bien y prefiero no tocar para no romper nada.

2) Me gustaria de un componente que sea un boton, y que al presionar RESETEE el componente de los datos procesados.
Hoy, asi como esta, si cargo PV me muestra los cards correspondientes. Si luego cargo PI me muestra los de PV + los de PI. Y lo mismo con el otro boton. 
Me parece genial el funcionamiento. Y no quiero que se altere. 
Pero quiero que con ese boton, pueda cancelar (borrar) lo que se proceso anter y cargar, por ejemplo, solo los datos de un processo.
Ej.:
Cargo PI. Me muestra los cards de PI.
Hago Reset: No me muestra mas cards 
Cargo PV. Me muesta solo los cards de PV

Te paso los archivos que considero que puedes necesitar, para que solo modifiquees lo necesario:

'''
# src/store/dataSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Primer RING
  ringData: [],
  apiaData: [],
  processedData: [],
  loadingRing: false,
  loadingApia: false,
  processingData: false,

  // Segundo RING: Pensión Vejez (PV) y Pensión Invalidez (PI)
  ringPVData: [],    // Hoja 0
  ringPIData: [],    // Hoja 1
  loadingRingPV: false,
  loadingRingPI: false,

  // Documento generado
  generatedDocument: null,
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    // Primer RING
    setRingData(state, action) {
      state.ringData = action.payload;
      state.loadingRing = false;
    },
    setApiaData(state, action) {
      state.apiaData = action.payload;
      state.loadingApia = false;
    },
    setProcessedData(state, action) {
      state.processedData = action.payload;
      state.processingData = false;
    },
    setLoadingRing(state, action) {
      state.loadingRing = action.payload;
    },
    setLoadingApia(state, action) {
      state.loadingApia = action.payload;
    },
    setProcessingData(state, action) {
      state.processingData = action.payload;
    },

    // Segundo RING
    setRingPVData(state, action) {
      state.ringPVData = action.payload;
      state.loadingRingPV = false;
    },
    setRingPIData(state, action) {
      state.ringPIData = action.payload;
      state.loadingRingPI = false;
    },
    setLoadingRingPV(state, action) {
      state.loadingRingPV = action.payload;
    },
    setLoadingRingPI(state, action) {
      state.loadingRingPI = action.payload;
    },

    // Documento
    setGeneratedDocument(state, action) {
      state.generatedDocument = action.payload;
    },
    resetGeneratedDocument(state) {
      state.generatedDocument = null;
    },
  },
});

export const {
  setRingData,
  setApiaData,
  setProcessedData,
  setLoadingRing,
  setLoadingApia,
  setProcessingData,

  setRingPVData,
  setRingPIData,
  setLoadingRingPV,
  setLoadingRingPI,

  setGeneratedDocument,
  resetGeneratedDocument,
} = dataSlice.actions;

export default dataSlice.reducer;

'''
'''
# src/components/Results.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setProcessedData, setProcessingData } from '../store/dataSlice';
import ResultCard from './ResultCard';
import LoadingSpinner from './LoadingSpinner';
import { parseDate } from '../utils/dateUtils';
import { formatDocumento } from '../utils/formatUtils';

const Results = () => {
  const dispatch = useDispatch();
  const ringData = useSelector((state) => state.data.ringData);
  const ringPVData = useSelector((state) => state.data.ringPVData);
  const ringPIData = useSelector((state) => state.data.ringPIData);
  const apiaData = useSelector((state) => state.data.apiaData);
  const processedData = useSelector((state) => state.data.processedData);
  const processingData = useSelector((state) => state.data.processingData);
  const filterOption = useSelector((state) => state.ui.filterOption);
  const department = useSelector((state) => state.ui.department);

  const PLAZO_JC = parseInt(import.meta.env.VITE_PLAZO_JC, 10);
  const PLAZO_PCUC = parseInt(import.meta.env.VITE_PLAZO_PCUC, 10);
  const PLAZO_AVISO = parseInt(import.meta.env.VITE_PLAZO_AVISO, 10);
  const PLAZO_PV = parseInt(import.meta.env.VITE_PLAZO_PV, 10); // Plazo para Pensión Vejez
  const PLAZO_PI = parseInt(import.meta.env.VITE_PLAZO_PI, 10); // Plazo para Pensión Invalidez

  const fechaActual = new Date();

  const diasAtraso = (fechaSolicitud) => {
    const fecha = parseDate(fechaSolicitud);
    if (!fecha || isNaN(fecha.getTime())) return 0;
    const diffTime = fechaActual - fecha;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const findNroDoc = (item) => {
    // Busca una key que contenga 'nro_doc' (ignorando mayúsculas y caracteres especiales)
    for (const key of Object.keys(item)) {
      if (key.toLowerCase().includes('nro_doc')) {
        return item[key];
      }
    }
    return null;
  };

  const processRINGData = (data, codTipoLogic) => {
    // codTipoLogic es una función que determina codTipo según el set de datos
    const filtered = department === 'MONTEVIDEO'
      ? data
      : data.filter((item) =>
          item['departamento'] &&
          item['departamento'].toUpperCase() === department.toUpperCase()
        );

    return filtered.map((ringItem) => {
      let codTipo = 1; // default jubilación común
      let plazo = PLAZO_JC;

      if (codTipoLogic) {
        const result = codTipoLogic(ringItem);
        codTipo = result.codTipo;
        plazo = result.plazo;
      } else {
        // Lógica original del primer RING
        const cTipo = parseInt(ringItem['cod_tipo_solicitud'], 10);
        if (cTipo === 9) {
          codTipo = 9;
          plazo = PLAZO_PCUC;
        } else if ([1, 25, 26, 27].includes(cTipo)) {
          codTipo = cTipo; // mantiene codTipo 1,25,26 asimilable a JC
          plazo = PLAZO_JC;
        } else {
          codTipo = cTipo || 0;
          plazo = PLAZO_JC;
        }
      }

      const nroDoc = codTipoLogic ? findNroDoc(ringItem) : ringItem['nro_doc'];
      const asuntoDoc = nroDoc?.toString() || '';

      const apiaMatches = apiaData.filter((apiaItem) => {
        const asunto = apiaItem['Asunto'] || '';
        const docInAsunto = asunto.split(' ')[0];
        return docInAsunto === asuntoDoc;
      });

      const fechaSolicitud = ringItem['fecha_solicitud'];
      const parsedFechaSolicitud = fechaSolicitud
        ? parseDate(fechaSolicitud)
        : null;

      const atraso = parsedFechaSolicitud
        ? diasAtraso(parsedFechaSolicitud)
        : 0;

      let styleOption = '';
      if (codTipo === 9) { // Pensión Invalidez
        if (atraso >= plazo) styleOption = 'danger';
        else if (atraso >= plazo - PLAZO_AVISO) styleOption = 'info';
      } else if ([1, 25, 26, 27].includes(codTipo) || codTipo === 1) { // JC o Pensión Vejez
        if (atraso >= plazo) styleOption = 'danger';
        else if (atraso >= plazo - PLAZO_AVISO) styleOption = 'info';
      }

      return {
        nro_doc: formatDocumento(nroDoc),
        nombre: `${ringItem['nomb_1'] || ''} ${ringItem['nomb_2'] || ''} ${ringItem['apel_1'] || ''} ${ringItem['apel_2'] || ''}`.trim(),
        fecha_solicitud: parsedFechaSolicitud
          ? parsedFechaSolicitud.toLocaleDateString('es-ES')
          : 'Fecha no disponible',
        dias_atraso: atraso,
        apiaMatches: apiaMatches.map((apiaItem) => ({
          nro_expediente: apiaItem['Nro. expediente'],
          usuario_actual: apiaItem['Usuario actual'],
          cant_dias: apiaItem['Cant. días'],
        })),
        desc_tipo_solic: ringItem['desc_tipo_solic'] || '',
        cod_tipo_solicitud: codTipo.toString(),
        styleOption,
      };
    });
  };

  // Función para lógica PV (Pensión Vejez)
  const codTipoLogicPV = () => {
    // PV = codTipo = 1 (asimilar JC), plazo = PLAZO_PV
    return { codTipo: 1, plazo: PLAZO_PV };
  };

  // Función para lógica PI (Pensión Invalidez)
  const codTipoLogicPI = () => {
    // PI = codTipo = 9 (Pensión Invalidez), plazo = PLAZO_PI
    return { codTipo: 9, plazo: PLAZO_PI };
  };

  useEffect(() => {
    // Siempre que cambien los datos, procesamos todo
    if (ringData.length > 0 || ringPVData.length > 0 || ringPIData.length > 0 || apiaData.length > 0) {
      dispatch(setProcessingData(true));

      // Procesa ringData con lógica original (cod_tipo_solicitud)
      const result1 = ringData.length > 0 ? processRINGData(ringData, null) : [];

      // Procesa ringPVData (Pensión Vejez) con lógica PV
      const resultPV = ringPVData.length > 0 ? processRINGData(ringPVData, codTipoLogicPV) : [];

      // Procesa ringPIData (Pensión Invalidez) con lógica PI
      const resultPI = ringPIData.length > 0 ? processRINGData(ringPIData, codTipoLogicPI) : [];

      const combined = [...result1, ...resultPV, ...resultPI];
      combined.sort((a, b) => a.dias_atraso - b.dias_atraso);

      setTimeout(() => {
        dispatch(setProcessedData(combined));
        dispatch(setProcessingData(false));
      }, 500);
    }
  }, [ringData, ringPVData, ringPIData, apiaData, department, dispatch]);

  if (processingData) {
    return (
      <div className="result-container">
        <LoadingSpinner />
      </div>
    );
  }

  let filteredData = processedData;
  if (filterOption === 'info') {
    filteredData = processedData.filter((item) => item.styleOption === 'info');
  } else if (filterOption === 'safe') {
    filteredData = processedData.filter((item) => item.styleOption !== 'danger');
  }

  if (filteredData.length > 0) {
    return (
      <div className="result-container">
        {filteredData.map((item, index) => (
          <ResultCard key={index} item={item} />
        ))}
      </div>
    );
  }

  return (
    <div className="result-container">
      <p>No hay datos para mostrar.</p>
    </div>
  );
};

export default Results;

'''
'''
# src/components/RightColumn.jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import FileUploader from './FileUploader';
import FilterOptions from './FilterOptions';
import ReporteRing from './ReporteRing';
import FileUploaderSecondRing from './FileUploaderSecondRing';
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
          <hr />
          <ReporteRing />

          <hr />
          {generatedDocument && (
            <button className="btn btn-success mt-3" onClick={handleDownload}>
              Descargar Documento Generado
            </button>
          )}
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

'''
'''
'''

# OJO!!!!!!!!!!!!!!!!!!!!!!!
Borre 
{item.desc_tipo_solic && (
          <div className="gap-item">
            <span className="label">Tipo de solicitud:</span>{' '}
            {item.desc_tipo_solic}
          </div>
        )}

      Para colocar 


<strong>Tipo de Solicitud:</strong> {item.tipo_solicitud}<br />



























La parte 1 funciono bien. Muestra bien el tipo de solicitud. Gracias
En cambio la parte 2. El reseteo que te pedi. No lo hace bien.
Cuando reseteo PI o PV, por ejemplo. Luego no me permite volver a subir los arhivos. O sea:
. Subo PI
. Muestra resultados de PI
. Subo PI
. No muestra nada
Por otro lado, el otro boton, 'Jubilaciones', no resetea.
Por las dudas te voy a pasar ademas el codigo de:
FileUploader (donde se encuentra el boton [Jubilaciones])
FileUploaderSecondring (donde se encuentran los botones de PI y PV)

'''
# src/components/FileUploader.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import {
  setRingData,
  setApiaData,
  setLoadingRing,
  setLoadingApia,
} from '../store/dataSlice';

const FileUploader = () => {
  const dispatch = useDispatch();
  const loadingRing = useSelector((state) => state.data.loadingRing);
  const loadingApia = useSelector((state) => state.data.loadingApia);

  const handleRingUpload = (file) => {
    if (!file) return;
    dispatch(setLoadingRing(true)); // Inicia la carga
    readExcel(file, (data) => dispatch(setRingData(data)));
  };

  const handleApiaUpload = (file) => {
    if (!file) return;
    dispatch(setLoadingApia(true)); // Inicia la carga
    readExcel(file, (data) => dispatch(setApiaData(data)), 1);
  };

  const readExcel = (file, callback, sheetIndex = 0) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: 'binary' });
      const sheetName = workbook.SheetNames[sheetIndex];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      callback(jsonData);
    };
    reader.readAsBinaryString(file);
  };

  const triggerFileInput = (id) => {
    document.getElementById(id).click();
  };

  return (
    <div className="upload-buttons">
      <div className="upload-button">
        <label htmlFor="ring-upload"></label>
        <input
          type="file"
          id="ring-upload"
          accept=".xlsx, .xls"
          onChange={(e) => handleRingUpload(e.target.files[0])}
        />
        <button 
          className="btn btn-secondary"
          onClick={() => triggerFileInput('ring-upload')}>
          {loadingRing ? 'Cargando...' : 'Jubilaciones'}
        </button>
      </div>
      <hr />
      <div className="upload-button">
        <label htmlFor="apia-upload"></label>
        <input
          type="file"
          id="apia-upload"
          accept=".xlsx, .xls"
          onChange={(e) => handleApiaUpload(e.target.files[0])}
        />
        <button 
          className="btn btn-secondary btn-primary--complementary"
          onClick={() => triggerFileInput('apia-upload')}
        >
          {loadingApia ? 'Cargando...' : 'Subir archivo APIA'}
        </button>
      </div>
    </div>
  );
};

export default FileUploader;

'''
'''
# src/components/FileUploaderSecondRing.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import { setRingPVData, setRingPIData, setLoadingRingPV, setLoadingRingPI } from '../store/dataSlice';

const FileUploaderSecondRing = () => {
  const dispatch = useDispatch();
  const loadingRingPV = useSelector((state) => state.data.loadingRingPV);
  const loadingRingPI = useSelector((state) => state.data.loadingRingPI);

  const readExcel = (file, callback, sheetIndex = 0) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const binaryStr = event.target.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const sheetName = workbook.SheetNames[sheetIndex];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        callback(jsonData);
      } catch (error) {
        console.error('Error al leer el archivo Excel:', error);
        alert('Ocurrió un error al procesar el archivo. Asegúrate de que sea un archivo Excel válido.');
        if (sheetIndex === 0) dispatch(setLoadingRingPV(false));
        if (sheetIndex === 1) dispatch(setLoadingRingPI(false));
      }
    };
    reader.readAsBinaryString(file);
  };

  const handlePVUpload = (file) => {
    if (!file) return;
    dispatch(setLoadingRingPV(true));
    readExcel(file, (data) => dispatch(setRingPVData(data)), 0); // Hoja 0 = PV
  };

  const handlePIUpload = (file) => {
    if (!file) return;
    dispatch(setLoadingRingPI(true));
    readExcel(file, (data) => dispatch(setRingPIData(data)), 1); // Hoja 1 = PCUC
  };

  const triggerFileInput = (id) => {
    document.getElementById(id).click();
  };

  return (
    <div className="upload-buttons">
      <div className="upload-button">
        <input
          type="file"
          id="pv-upload"
          accept=".xlsx, .xls"
          onChange={(e) => handlePVUpload(e.target.files[0])}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => triggerFileInput('pv-upload')}
          className="btn btn-secondary"
          disabled={loadingRingPV}
        >
          {loadingRingPV ? 'Cargando...' : 'Pensión Vejez'}
        </button>
      </div>

      <div className="upload-button">
        <div className="upload-button">
          <input
            type="file"
            id="pi-upload"
            accept=".xlsx, .xls"
            onChange={(e) => handlePIUpload(e.target.files[0])}
            style={{ display: 'none' }}
          />
        </div>
        <div className="upload-button">
          <button
            onClick={() => triggerFileInput('pi-upload')}
            className="btn btn-secondary"
            disabled={loadingRingPI}
          >
            {loadingRingPI ? 'Cargando...' : 'Pensión Invalidez'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploaderSecondRing;

'''

Tambien te paso como tengo el restante de los archivos que puedas necesitar:

'''
'''
# src/components/Results.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setProcessedData, setProcessingData } from '../store/dataSlice';
import ResultCard from './ResultCard';
import LoadingSpinner from './LoadingSpinner';
import { parseDate } from '../utils/dateUtils';
import { formatDocumento } from '../utils/formatUtils';

const Results = () => {
  const dispatch = useDispatch();
  const ringData = useSelector((state) => state.data.ringData);
  const ringPVData = useSelector((state) => state.data.ringPVData);
  const ringPIData = useSelector((state) => state.data.ringPIData);
  const apiaData = useSelector((state) => state.data.apiaData);
  const processedData = useSelector((state) => state.data.processedData);
  const processingData = useSelector((state) => state.data.processingData);
  const filterOption = useSelector((state) => state.ui.filterOption);
  const department = useSelector((state) => state.ui.department);

  const PLAZO_JC = parseInt(import.meta.env.VITE_PLAZO_JC, 10);
  const PLAZO_PCUC = parseInt(import.meta.env.VITE_PLAZO_PCUC, 10);
  const PLAZO_AVISO = parseInt(import.meta.env.VITE_PLAZO_AVISO, 10);
  const PLAZO_PV = parseInt(import.meta.env.VITE_PLAZO_PV, 10); // Plazo para Pensión Vejez
  const PLAZO_PI = parseInt(import.meta.env.VITE_PLAZO_PI, 10); // Plazo para Pensión Invalidez

  const fechaActual = new Date();

  const diasAtraso = (fechaSolicitud) => {
    const fecha = parseDate(fechaSolicitud);
    if (!fecha || isNaN(fecha.getTime())) return 0;
    const diffTime = fechaActual - fecha;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const findNroDoc = (item) => {
    // Busca una key que contenga 'nro_doc' (ignorando mayúsculas y caracteres especiales)
    for (const key of Object.keys(item)) {
      if (key.toLowerCase().includes('nro_doc')) {
        return item[key];
      }
    }
    return null;
  };

  const processRINGData = (data, codTipoLogic) => {
    // codTipoLogic es una función que determina codTipo según el set de datos
    const filtered = department === 'MONTEVIDEO'
      ? data
      : data.filter((item) =>
          item['departamento'] &&
          item['departamento'].toUpperCase() === department.toUpperCase()
        );

    return filtered.map((ringItem) => {
      let codTipo = 1; // default jubilación común
      let plazo = PLAZO_JC;
      let tipoSolicitud = 'Jubilación Común'; // Default

      if (codTipoLogic) {
        const result = codTipoLogic(ringItem);
        codTipo = result.codTipo;
        plazo = result.plazo;
        tipoSolicitud = result.tipoSolicitud;
      } else {
        // Lógica original del primer RING
        const cTipo = parseInt(ringItem['cod_tipo_solicitud'], 10);
        if (cTipo === 9) {
          codTipo = 9;
          plazo = PLAZO_PCUC;
          tipoSolicitud = 'Incapacidad';
        } else if ([1, 25, 26].includes(cTipo)) {
          codTipo = cTipo; // mantiene codTipo 1,25,26 asimilable a JC
          plazo = PLAZO_JC;
          tipoSolicitud = 'Jubilación Común';
        } else {
          codTipo = cTipo || 0;
          plazo = PLAZO_JC;
          tipoSolicitud = 'Otro';
        }
      }

      const nroDoc = codTipoLogic ? findNroDoc(ringItem) : ringItem['nro_doc'];
      const asuntoDoc = nroDoc?.toString() || '';

      const apiaMatches = apiaData.filter((apiaItem) => {
        const asunto = apiaItem['Asunto'] || '';
        const docInAsunto = asunto.split(' ')[0];
        return docInAsunto === asuntoDoc;
      });

      const fechaSolicitud = ringItem['fecha_solicitud'];
      const parsedFechaSolicitud = fechaSolicitud
        ? parseDate(fechaSolicitud)
        : null;

      const atraso = parsedFechaSolicitud
        ? diasAtraso(parsedFechaSolicitud)
        : 0;

      let styleOption = '';
      if (codTipo === 9) { // Pensión Invalidez
        if (atraso >= plazo) styleOption = 'danger';
        else if (atraso >= plazo - PLAZO_AVISO) styleOption = 'info';
      } else if ([1, 25, 26].includes(codTipo) || codTipo === 1) { // JC o Pensión Vejez
        if (atraso >= plazo) styleOption = 'danger';
        else if (atraso >= plazo - PLAZO_AVISO) styleOption = 'info';
      }

      return {
        nro_doc: formatDocumento(nroDoc),
        nombre: `${ringItem['nomb_1'] || ''} ${ringItem['nomb_2'] || ''} ${ringItem['apel_1'] || ''} ${ringItem['apel_2'] || ''}`.trim(),
        fecha_solicitud: parsedFechaSolicitud
          ? parsedFechaSolicitud.toLocaleDateString('es-ES')
          : 'Fecha no disponible',
        dias_atraso: atraso,
        apiaMatches: apiaMatches.map((apiaItem) => ({
          nro_expediente: apiaItem['Nro. expediente'],
          usuario_actual: apiaItem['Usuario actual'],
          cant_dias: apiaItem['Cant. días'],
        })),
        desc_tipo_solic: ringItem['desc_tipo_solic'] || '',
        cod_tipo_solicitud: codTipo.toString(),
        styleOption,
        tipo_solicitud: tipoSolicitud, // Nuevo campo
      };
    });
  };

  // Función para lógica PV (Pensión Vejez)
  const codTipoLogicPV = () => {
    // PV = codTipo = 1 (asimilar JC), plazo = PLAZO_PV
    return { codTipo: 1, plazo: PLAZO_PV, tipoSolicitud: 'Pensión Vejez' };
  };

  // Función para lógica PI (Pensión Invalidez)
  const codTipoLogicPI = () => {
    // PI = codTipo = 9 (Pensión Invalidez), plazo = PLAZO_PI
    return { codTipo: 9, plazo: PLAZO_PI, tipoSolicitud: 'Pensión Invalidez' };
  };

  useEffect(() => {
    // Siempre que cambien los datos, procesamos todo
    if (ringData.length > 0 || ringPVData.length > 0 || ringPIData.length > 0 || apiaData.length > 0) {
      dispatch(setProcessingData(true));

      // Procesa ringData con lógica original (cod_tipo_solicitud)
      const result1 = ringData.length > 0 ? processRINGData(ringData, null) : [];

      // Procesa ringPVData (Pensión Vejez) con lógica PV
      const resultPV = ringPVData.length > 0 ? processRINGData(ringPVData, codTipoLogicPV) : [];

      // Procesa ringPIData (Pensión Invalidez) con lógica PI
      const resultPI = ringPIData.length > 0 ? processRINGData(ringPIData, codTipoLogicPI) : [];

      const combined = [...result1, ...resultPV, ...resultPI];
      combined.sort((a, b) => a.dias_atraso - b.dias_atraso);

      setTimeout(() => {
        dispatch(setProcessedData(combined));
        dispatch(setProcessingData(false));
      }, 500);
    }
  }, [ringData, ringPVData, ringPIData, apiaData, department, dispatch]);

  if (processingData) {
    return (
      <div className="result-container">
        <LoadingSpinner />
      </div>
    );
  }

  let filteredData = processedData;
  if (filterOption === 'info') {
    filteredData = processedData.filter((item) => item.styleOption === 'info');
  } else if (filterOption === 'safe') {
    filteredData = processedData.filter((item) => item.styleOption !== 'danger');
  }

  if (filteredData.length > 0) {
    return (
      <div className="result-container">
        {filteredData.map((item, index) => (
          <ResultCard key={index} item={item} />
        ))}
      </div>
    );
  }

  return (
    <div className="result-container">
      <p>No hay datos para mostrar.</p>
    </div>
  );
};

export default Results;

'''
'''
# src/store/dataSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Primer RING
  ringData: [],
  apiaData: [],
  processedData: [],
  loadingRing: false,
  loadingApia: false,
  processingData: false,

  // Segundo RING: Pensión Vejez (PV) y Pensión Invalidez (PI)
  ringPVData: [],    // Hoja 0
  ringPIData: [],    // Hoja 1
  loadingRingPV: false,
  loadingRingPI: false,

  // Documento generado
  generatedDocument: null,
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    // Primer RING
    setRingData(state, action) {
      state.ringData = action.payload;
      state.loadingRing = false;
    },
    setApiaData(state, action) {
      state.apiaData = action.payload;
      state.loadingApia = false;
    },
    setProcessedData(state, action) {
      state.processedData = action.payload;
      state.processingData = false;
    },
    setLoadingRing(state, action) {
      state.loadingRing = action.payload;
    },
    setLoadingApia(state, action) {
      state.loadingApia = action.payload;
    },
    setProcessingData(state, action) {
      state.processingData = action.payload;
    },

    // Segundo RING
    setRingPVData(state, action) {
      state.ringPVData = action.payload;
      state.loadingRingPV = false;
    },
    setRingPIData(state, action) {
      state.ringPIData = action.payload;
      state.loadingRingPI = false;
    },
    setLoadingRingPV(state, action) {
      state.loadingRingPV = action.payload;
    },
    setLoadingRingPI(state, action) {
      state.loadingRingPI = action.payload;
    },

    // Documento
    setGeneratedDocument(state, action) {
      state.generatedDocument = action.payload;
    },
    resetGeneratedDocument(state) {
      state.generatedDocument = null;
    },

    // Nuevas Acciones de Reset
    resetProcessedData(state) {
      state.processedData = [];
    },
    resetRingPVData(state) {
      state.ringPVData = [];
    },
    resetRingPIData(state) {
      state.ringPIData = [];
    },
    resetAllProcessedData(state) {
      state.processedData = [];
      state.ringPVData = [];
      state.ringPIData = [];
    },
  },
});

export const {
  setRingData,
  setApiaData,
  setProcessedData,
  setLoadingRing,
  setLoadingApia,
  setProcessingData,

  setRingPVData,
  setRingPIData,
  setLoadingRingPV,
  setLoadingRingPI,

  setGeneratedDocument,
  resetGeneratedDocument,

  resetProcessedData,
  resetRingPVData,
  resetRingPIData,
  resetAllProcessedData,
} = dataSlice.actions;

export default dataSlice.reducer;

'''

'''
# src/components/RightColumn.jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import FileUploader from './FileUploader';
import FilterOptions from './FilterOptions';
import ReporteRing from './ReporteRing';
import FileUploaderSecondRing from './FileUploaderSecondRing';
import { resetAllProcessedData, resetGeneratedDocument } from '../store/dataSlice';

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

  const handleReset = () => {
    dispatch(resetAllProcessedData());
  };

  switch (page) {
    case 'InformePasivos':
      return (
        <section className="container__right-column">
          <h2 className="heading-secondary">Cargar Archivos</h2>
          <FileUploaderSecondRing />
          
          <FileUploader />
          <FilterOptions />
          <hr />
          <ReporteRing />

          <hr />
          <button className="btn btn-warning me-2" onClick={handleReset}>
              Resetear Datos Procesados
            </button>
          {generatedDocument && (
            <button className="btn btn-success mt-3" onClick={handleDownload}>
              Descargar Documento Generado
            </button>
          )}
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

'''

Tambien quisiera que RESET se vea en un componente nuevo (no colocado en RightColumn) y que se respetase el estilo de botones del resto