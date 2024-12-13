// src/components/LoginPage.jsx

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../store/uiSlice';
import { menus } from '../config/menus'; // Importa tu configuración de menús

const departments = [
    'ARTIGAS', 
    'CANELONES', 
    'CERRO LARGO', 
    'COLONIA',      
    'DURAZNO',
    'FLORES', 
    'FLORIDA', 
    'LAVALLEJA', 
    'MALDONADO', 
    'PAYSANDU', 
    'RIO NEGRO', 
    'RIVERA', 
    'ROCHA',     
    'SALTO', 
    'SAN JOSE', 
    'SORIANO', 
    'TACUAREMBO', 
    'TREINTA Y TRES',          
    'MONTEVIDEO']; // Lista de departamentos


const LoginPage = () => {
  const dispatch = useDispatch();
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (departments.includes(selectedDepartment)) {
      dispatch(login(selectedDepartment));
      setError('');
    } else {
      setError('Departamento no válido');
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Iniciar Sesión</h2>
        <div className="form-group">
          <label htmlFor="department">Departamento</label>
          <select
            id="department"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            required
          >
            <option value="" disabled>Selecciona un departamento</option>
            {departments.map((dept, index) => (
              <option key={index} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
};

export default LoginPage;
