// src/components/Header.jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar, setSelectedHeaderItem, setSelectedPage } from '../store/uiSlice';
import logo from '../assets/logo.png';
import { menus } from '../config/menus';

function Header() {
  const dispatch = useDispatch();
  const selectedSidebarItem = useSelector((state) => state.ui.selectedSidebarItem);
  const selectedHeaderItem = useSelector((state) => state.ui.selectedHeaderItem);

  const handleLogoClick = () => {
    dispatch(toggleSidebar());
  };

  // Obtener el menú actual según el item del sidebar
  const currentMenu = menus[selectedSidebarItem] || menus.default;

  const handleHeaderItemClick = (itemText) => {
    dispatch(setSelectedHeaderItem(itemText));
    const menuItem = currentMenu.find(m => m.text === itemText);
    if (menuItem) {
      dispatch(setSelectedPage(menuItem.page));
    }
  };

  return (
    <header className="header">
      <div className="header__logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
        <img src={logo} alt="BPS" />
      </div>
      <nav className="header__nav">
        <ul className="nav-menu">
          {currentMenu.map((item, index) => (
            <li key={index} className="nav-menu__item" onClick={() => handleHeaderItemClick(item.text)}>
              <a href="#" className={`nav-menu__link ${selectedHeaderItem === item.text ? 'nav-menu__link--activa' : ''}`}>
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="header__user-register">
        <div className="user-section">
          <i className="fa fa-user user-icon"></i>
          <span className="user-logout">Salir</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
