// src/App.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Layout from './components/shared/Layout.jsx';
import ChatbotWidget from './components/shared/ChatbotWidget.jsx';

function App() {
  // Este componente agora faz uma única coisa:
  // Ele renderiza o seu Layout e diz onde a página atual deve aparecer.
  return (
    <>
      <Layout>
        <Outlet />
      </Layout>
      <ChatbotWidget />
    </>
  );
}

export default App;