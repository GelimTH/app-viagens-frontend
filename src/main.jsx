// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SidebarProvider } from './hooks/useSidebar'; // 1. LINHA ADICIONADA

import App from './App.jsx';
import './index.css';

// Importe todas as suas páginas
import Dashboard from './pages/Dashboard.jsx';
import NovaViagem from './pages/NovaViagem.jsx';
import PrestacaoContas from './pages/PrestacaoContas.jsx';
import Historico from './pages/Historico.jsx';
import Perfil from './pages/Perfil.jsx';
//import ChatIA from './pages/ChatIA.jsx';
import LoginPage from './pages/LoginPage.jsx';
import EditarViagem from './pages/EditarViagem.jsx';

// Crie uma instância do "gerenciador" de queries
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SidebarProvider> {/* 2. LINHA ADICIONADA */}
          <Routes>
            {/* A rota principal "/" agora é a LoginPage */}
            <Route path="/" element={<LoginPage />} />
            
            {/* O resto do aplicativo agora vive dentro de "/app" */}
            <Route path="/app" element={<App />}>
              {/* A rota inicial de "/app" será o dashboard */}
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="novaviagem" element={<NovaViagem />} />
              <Route path="prestacaocontas" element={<PrestacaoContas />} />
              <Route path="historico" element={<Historico />} />
              <Route path="perfil" element={<Perfil />} />
              {/*<Route path="chatia" element={<ChatIA />} />*/}
              <Route path="viagens/editar/:id" element={<EditarViagem />} />
            </Route>
          </Routes>
        </SidebarProvider> {/* 2. LINHA ADICIONADA */}
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);