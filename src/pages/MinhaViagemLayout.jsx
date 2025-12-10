// src/pages/MinhaViagemLayout.jsx
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { Plane, Loader2, AlertCircle, MessageCircle, LogOut } from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ModalTermos from "@/components/minha-viagem/ModalTermos";

// Abas de Navegação
const tabs = [
  { name: 'Visão Geral', to: '.' },
  { name: 'Itinerário', to: './itinerario' },
  { name: 'Hotel', to: './hotel' },
  { name: 'Comunicados', to: './comunicados' },
];

export default function MinhaViagemLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [termosPendentes, setTermosPendentes] = useState(false);

  // Busca os dados da viagem
  const {
    data: dadosViagem,
    isLoading: isLoadingViagem,
    error: errorViagem
  } = useQuery({
    queryKey: ['minhaViagem'],
    queryFn: api.getMinhaViagem,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Verifica aceite dos termos
  useEffect(() => {
    if (dadosViagem?.perfil) {
      const aceitou = dadosViagem.perfil.termosAceitos === true;
      setTermosPendentes(!aceitou);
    }
  }, [dadosViagem]);

  const handleTermosAceitos = () => {
    setTermosPendentes(false);
    queryClient.invalidateQueries(['minhaViagem']);
  };

  const handleLogout = () => {
    api.logout();
    navigate('/');
  };

  // --- RENDERIZAÇÃO ---
  if (isLoadingViagem) {
    return (
      <div className="h-screen flex items-center justify-center gap-2 text-slate-600 bg-slate-50">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="font-medium">Carregando dados da sua missão...</span>
      </div>
    );
  }

  if (errorViagem) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-red-600 gap-4 bg-slate-50 p-6">
        <AlertCircle className="w-8 h-8" />
        <p>{errorViagem.response?.data?.error || "Erro ao buscar dados."}</p>
        <button onClick={handleLogout} className="underline">Sair</button>
      </div>
    );
  }

  if (!dadosViagem?.viagem) return null;

  const gestorNome = dadosViagem.gestor?.fullName || 'Organização';
  // Link FAKE estático
  const whatsappFakeLink = "https://wa.me/5511999999999"; 

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      
      {/* Modal de Termos */}
      <ModalTermos 
        open={termosPendentes} 
        onAceitar={handleTermosAceitos}
        onLogout={handleLogout}
        dadosUsuario={dadosViagem?.perfil}
        dadosViagem={dadosViagem?.viagem}
      />

      {/* --- CABEÇALHO (DESIGN ORIGINAL AZUL) --- */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Esquerda: Ícone e Título */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Plane className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Meu Itinerário</h1>
            <p className="text-slate-500">
              Missão para <span className="font-semibold text-blue-600">{dadosViagem.viagem.destino}</span>
            </p>
          </div>
        </div>

        {/* Direita: Informação do Gestor + Botão FAKE */}
        <div className="flex flex-col md:items-end gap-1">
          <p className="text-sm text-slate-500">
            Organizada por: <span className="font-semibold text-slate-800">{gestorNome}</span>
          </p>
          
          {/* BOTÃO FAKE: Discreto, sem quebrar layout */}
          <a href={whatsappFakeLink} target="_blank" rel="noopener noreferrer">
            <Button 
              variant="outline" 
              size="sm"
              className="h-8 text-xs border-green-200 text-green-700 hover:bg-green-50 flex items-center gap-2"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Falar com Gestor
            </Button>
          </a>
        </div>
      </div>

      {/* --- MENU DE ABAS --- */}
      <div className="max-w-7xl mx-auto border-b border-slate-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = location.pathname.endsWith(tab.to) || (tab.to === '.' && location.pathname.endsWith('/minha-viagem'));
            return (
              <NavLink
                key={tab.name}
                to={tab.to}
                end={tab.to === '.'}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${isActive
                    ? 'border-blue-600 text-blue-600' // Mantendo o azul original
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
                `}
              >
                {tab.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* --- CONTEÚDO DAS PÁGINAS --- */}
      <div className="max-w-7xl mx-auto pb-20">
        <Outlet context={{ dadosViagem }} />
      </div>

      {/* Botão Sair Mobile */}
      <div className="absolute top-6 right-6 md:hidden">
         <button onClick={handleLogout} className="text-slate-400 hover:text-red-500">
           <LogOut className="w-6 h-6" />
         </button>
      </div>
    </div>
  );
}