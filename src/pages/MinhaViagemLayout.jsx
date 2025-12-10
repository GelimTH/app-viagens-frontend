// src/pages/MinhaViagemLayout.jsx
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { Plane, Loader2, AlertCircle, MessageCircle, LogOut, Home, Calendar, DollarSign, Megaphone } from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import ModalTermos from "@/components/minha-viagem/ModalTermos";
import { Button } from '@/components/ui/button'; // Importando botão

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

  // --- LÓGICA DO WHATSAPP (FAKE) ---
  // Link estático para a Sprint
  const whatsappLink = "https://wa.me/5511999999999"; 

  if (isLoadingViagem) {
    return (
      <div className="h-screen flex items-center justify-center gap-2 text-slate-600 bg-slate-50">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="font-medium">Carregando...</span>
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

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Modal de Termos */}
      <ModalTermos 
        open={termosPendentes} 
        onAceitar={handleTermosAceitos}
        onLogout={handleLogout}
        dadosUsuario={dadosViagem?.perfil}
        dadosViagem={dadosViagem?.viagem}
      />

      {/* --- SIDEBAR (Barra Lateral Esquerda) --- */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden md:flex flex-col z-10 shadow-sm">
        
        {/* Cabeçalho da Sidebar */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-slate-800 text-lg">Minha Viagem</span>
          </div>

          {/* Destino */}
          <h2 className="text-xl font-bold text-slate-900 leading-tight">
            {dadosViagem.viagem.destino}
          </h2>

          {/* INFORMAÇÃO DO GESTOR + BOTÃO WHATSAPP (AQUI!) */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
              Organizada por:
            </p>
            <p className="text-sm font-medium text-slate-800 mb-3 truncate" title={gestorNome}>
              {gestorNome}
            </p>
            
            {/* Botão Fixo FAKE */}
            <a 
              href={whatsappLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full border-green-200 text-green-700 bg-green-50 hover:bg-green-100 hover:text-green-800 flex items-center justify-center gap-2 text-xs h-9"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Falar com Gestor
              </Button>
            </a>
          </div>
        </div>

        {/* Menu de Navegação */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavLink to="/minha-viagem" end className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}>
            <Home className="w-5 h-5" /> Visão Geral
          </NavLink>
          <NavLink to="/minha-viagem/itinerario" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}>
            <Calendar className="w-5 h-5" /> Itinerário
          </NavLink>
          <NavLink to="/minha-viagem/comunicados" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}>
            <Megaphone className="w-5 h-5" /> Comunicados
          </NavLink>
        </nav>

        {/* Rodapé Sidebar */}
        <div className="p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5" /> Sair
          </button>
        </div>
      </aside>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Header Mobile (Só aparece em telas pequenas) */}
        <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between shadow-sm z-20">
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-slate-800 truncate max-w-[150px]">{dadosViagem.viagem.destino}</span>
          </div>
          <button onClick={handleLogout} className="text-slate-500 hover:text-red-600">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Área de Conteúdo Scrollável */}
        <div className="flex-1 overflow-auto p-4 md:p-8 pb-24 md:pb-8">
          <Outlet context={{ dadosViagem }} />
          
          {/* Fallback Mobile: Botão do Gestor aparece no rodapé do conteúdo se for mobile */}
          <div className="md:hidden mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500 uppercase mb-2">Organizada por: {gestorNome}</p>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full border-green-200 text-green-700">
                <MessageCircle className="w-4 h-4 mr-2" /> Falar com Gestor
              </Button>
            </a>
          </div>
        </div>

        {/* Menu Inferior Mobile (Tab Bar) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <NavLink to="/minha-viagem" end className={({ isActive }) => isActive ? "text-blue-600" : "text-slate-400"}>
            <Home className="w-6 h-6" />
          </NavLink>
          <NavLink to="/minha-viagem/itinerario" className={({ isActive }) => isActive ? "text-blue-600" : "text-slate-400"}>
            <Calendar className="w-6 h-6" />
          </NavLink>
          <NavLink to="/minha-viagem/comunicados" className={({ isActive }) => isActive ? "text-blue-600" : "text-slate-400"}>
            <Megaphone className="w-6 h-6" />
          </NavLink>
        </div>

      </main>
    </div>
  );
}