// src/components/FilterOptionsSecond.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterOption2 } from '../store/uiSlice';

const FilterOptionsSecond = () => {
  const dispatch = useDispatch();
  const filterOption2 = useSelector((state) => state.ui.filterOption2);
  const PLAZO_AVISO = parseInt(import.meta.env.VITE_PLAZO_AVISO, 10);

  const handleChange = (e) => {
    dispatch(setFilterOption2(e.target.value));
  };

  return (
    <div className="filter-options mt-3">
      <div className="filter-option">
        <input
          type="radio"
          id="all2"
          name="filterOption2"
          value="all"
          checked={filterOption2 === 'all'}
          onChange={handleChange}
        />
        <label htmlFor="all2">
          <span>Todos los registros</span>
        </label>
      </div>

      <div className="filter-option">
        <input
          type="radio"
          id="info2"
          name="filterOption2"
          value="info"
          checked={filterOption2 === 'info'}
          onChange={handleChange}
        />
        <label htmlFor="info2">
          <span>Faltan menos de {PLAZO_AVISO} días</span>
        </label>
      </div>

      <div className="filter-option">
        <input
          type="radio"
          id="safe2"
          name="filterOption2"
          value="safe"
          checked={filterOption2 === 'safe'}
          onChange={handleChange}
        />
        <label htmlFor="safe2">
          <span>Están al día</span>
        </label>
      </div>
    </div>
  );
};

export default FilterOptionsSecond;
