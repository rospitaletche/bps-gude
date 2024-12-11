// src/components/Sidebar.jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { menus } from '../config/menus.js';
import { toggleSidebar, setSelectedSidebarItem, setSelectedHeaderItem, setSelectedPage } from '../store/uiSlice';

function Sidebar() {
  const dispatch = useDispatch();
  const collapsed = useSelector((state) => state.ui.sidebarCollapsed);
  const selectedSidebarItem = useSelector((state) => state.ui.selectedSidebarItem);

  const handleToggleClick = () => {
    dispatch(toggleSidebar());
  };

  const handleSelectItem = (itemName) => {
    dispatch(setSelectedSidebarItem(itemName));
    // Tomar el primer ítem del menú correspondiente
    const firstHeaderItem = menus[itemName][0];
    dispatch(setSelectedHeaderItem(firstHeaderItem.text));
    dispatch(setSelectedPage(firstHeaderItem.page));
  };

  const getItemClass = (itemName) => {
    return `sidebar__item ${selectedSidebarItem === itemName ? 'sidebar__item--activo' : ''}`;
  };

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <ul className="sidebar__list">
        <li className={getItemClass('Inicio')} onClick={() => handleSelectItem('Inicio')}>
          <i className="sidebar__icon fa fa-home"></i>
          <span className="sidebar__text">Inicio</span>
        </li>
        <li className={getItemClass('Informes')} onClick={() => handleSelectItem('Informes')}>
          <i className="sidebar__icon fa-solid fa-share-from-square"></i>
          <span className="sidebar__text">Informes</span>
        </li>
        <li className={getItemClass('Atención')} onClick={() => handleSelectItem('Atención')}>
          <i className="sidebar__icon fa fa-person"></i>
          <span className="sidebar__text">Atención</span>
        </li>
        {/* Botón para expandir/colapsar la barra lateral */}
        <li className="sidebar__item sidebar__toggle-btn" onClick={handleToggleClick}>
          <i className={`fa ${collapsed ? 'fa-angle-right' : 'fa-angle-left'}`}></i>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;
