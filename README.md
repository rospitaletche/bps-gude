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
