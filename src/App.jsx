// src/App.jsx
import React from 'react';
import { Provider } from 'react-redux';
import store from './store';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Footer from './components/Footer';

function App() {
  return (
    <Provider store={store}>
      <div className="body">
        <Header />
        <Sidebar />
        <MainContent />
        <Footer />
      </div>
    </Provider>
  );
}

export default App;
