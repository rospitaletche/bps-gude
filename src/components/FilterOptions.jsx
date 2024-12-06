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
  );
};

export default FilterOptions;
