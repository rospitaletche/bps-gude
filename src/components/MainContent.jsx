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
      {selectedPage === 'AtencionActivos' && (
        <>
          <LeftColumn page="AtencionActivos" />
          <RightColumn page="AtencionActivos" />
        </>
      )}
      {selectedPage === 'OficiosJudiciales' && (
        <>
          <LeftColumn page="OficiosJudiciales" />
          <RightColumn page="OficiosJudiciales" />
        </>
      )}
      {/* ...otros casos... */}
    </main>
  );
}

export default MainContent;
