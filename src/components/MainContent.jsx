// src/components/MainContent.jsx
import React from 'react';
import LeftColumn from './LeftColumn';
import RightColumn from './RightColumn';
import { useSelector } from 'react-redux';

function MainContent() {

  const selectedPage = useSelector(state => state.ui.selectedPage);

  console.log(selectedPage);

  return (
    <main className="container">
      {selectedPage === 'InformePasivos' && (
        <>
          <LeftColumn page="InformePasivos" />
          <RightColumn page="InformePasivos" />
        </>
      )}
      {selectedPage === 'Informe2Page' && (
        <>
          <LeftColumn page="Informe2Page" />
          <RightColumn page="Informe2Page" />
        </>
      )}
      {selectedPage === 'AtencionPage' && (
        <>
          <LeftColumn page="AtencionPage" />
          <RightColumn page="AtencionPage" />
        </>
      )}
      {selectedPage === 'ResumenPage' && (
        <>
          <LeftColumn page="ResumenPage" />
          <RightColumn page="ResumenPage" />
        </>
      )}
      {selectedPage === 'NovedadesPage' && (
        <>
          <LeftColumn page="NovedadesPage" />
          <RightColumn page="NovedadesPage" />
        </>
      )}
      {/* ...otros casos... */}
    </main>
  );
}

export default MainContent;
