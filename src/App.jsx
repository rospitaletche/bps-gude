// src/App.jsx
import React from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Footer from './components/Footer';
import LoginPage from './components/LoginPage';
import { useSelector } from 'react-redux';

function App() {
  const isLoggedIn = useSelector((state) => state.ui.isLoggedIn);

  return (
    <div className="body">
      {isLoggedIn ? (
        <>
          <Header />
          <Sidebar />
          <MainContent />
          <Footer />
        </>
      ) : (
        <LoginPage />
      )}
    </div>
  );
}

export default App;