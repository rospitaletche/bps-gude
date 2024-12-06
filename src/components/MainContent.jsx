// src/components/MainContent.jsx
import React from 'react';
import LeftColumn from './LeftColumn';
import RightColumn from './RightColumn';

function MainContent() {
  return (
    <main className="container">
      <LeftColumn />
      <RightColumn />
    </main>
  );
}

export default MainContent;
