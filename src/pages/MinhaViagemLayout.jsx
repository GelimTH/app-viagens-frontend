// src/pages/MinhaViagemLayout.jsx
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { Plane, Loader2, AlertCircle } from 'lucide-react'; // Removi MessageCircle
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import ModalTermos from "@/components/minha-viagem/ModalTermos";

// As Abas
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

  // Efeito para verificar se os termos foram aceitos
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

  // --- RENDER ---
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
        <div className="bg-red-100 p-4 rounded-full">
          <AlertCircle className="w-8 h-8" />
        </div>
        <p className="text-lg font-medium">
          {errorViagem.response?.data?.error || "Erro ao buscar sua viagem."}
        </p>
        <button 
          onClick={handleLogout}
          className="text-sm text-slate-500 underline hover:text-slate-800"
        >
          Voltar para o login
        </button>
      </div>
    );
  }

  if (!dadosViagem || !dadosViagem.viagem) {
    return (
      <div className="p-8 text-center text-slate-500 h-screen flex flex-col justify-center items-center">
        <p>Nenhuma viagem encontrada para você.</p>
        <button onClick={handleLogout} className="mt-4 text-blue-600 hover:underline">Sair</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 relative">
      
      {/* Modal de Termos */}
      <ModalTermos 
        open={termosPendentes} 
        onAceitar={handleTermosAceitos}
        onLogout={handleLogout}
        dadosUsuario={dadosViagem?.perfil}
        dadosViagem={dadosViagem?.viagem}
      />

      {/* Header */}
      <div className="max-w-7xl mx-auto flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Plane className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Meu Itinerário</h1>
            <p className="text-slate-500">
              Resumo da missão para <span className="font-semibold text-blue-600">{dadosViagem.viagem.destino}</span>.
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="hidden md:block text-sm font-medium text-slate-500 hover:text-red-600 transition-colors"
        >
          Sair do Sistema
        </button>
      </div>

      {/* Navegação por Abas */}
      <div className="max-w-7xl mx-auto border-b border-slate-200 mb-8">
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
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
                `}
              >
                {tab.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Conteúdo da Aba */}
      <div className="max-w-7xl mx-auto pb-20">
        <Outlet context={{ dadosViagem }} />
      </div>
    </div>
  );
}