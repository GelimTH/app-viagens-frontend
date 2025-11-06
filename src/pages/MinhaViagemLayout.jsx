import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { Plane, Loader2, AlertCircle } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

// As Abas
const tabs = [
  { name: 'Visão Geral', to: '.' },
  { name: 'Itinerário', to: './itinerario' },
  { name: 'Hotel', to: './hotel' },
  { name: 'Comunicados', to: './comunicados' },
];

export default function MinhaViagemLayout() {
  const location = useLocation();

  // Busca os dados da viagem (igual antes)
  const { 
    data: dadosViagem, 
    isLoading: isLoadingViagem, 
    error: errorViagem 
  } = useQuery({
    queryKey: ['minhaViagem'], // A chave que já funciona
    queryFn: api.getMinhaViagem,
    enabled: true,
  });

  // --- RENDER ---
  if (isLoadingViagem) {
    return (
      <div className="p-8 flex items-center justify-center gap-2 text-slate-600">
        <Loader2 className="w-5 h-5 animate-spin" />
        Carregando dados da sua missão...
      </div>
    );
  }

  if (errorViagem) {
    return (
      <div className="p-8 text-red-600 flex items-center justify-center gap-2">
        <AlertCircle className="w-5 h-5" />
        {errorViagem.response?.data?.error || "Erro ao buscar sua viagem."}
      </div>
    );
  }

  if (!dadosViagem || !dadosViagem.viagem) {
    return <div className="p-8 text-center text-slate-500">Nenhuma viagem encontrada para você.</div>;
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Plane className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Meu Itinerário</h1>
          <p className="text-slate-600">Resumo completo da sua missão para {dadosViagem.viagem.destino}.</p>
        </div>
      </div>

      {/* Navegação por Abas (Tabs) */}
      <div className="max-w-7xl mx-auto border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            // Checa se a aba está ativa (lógica complexa para a rota 'index')
            const isActive = location.pathname.endsWith(tab.to) || (tab.to === '.' && location.pathname.endsWith('/minha-viagem'));

            return (
              <NavLink
                key={tab.name}
                to={tab.to}
                end // Garante que a rota 'index' ('.') não dê match em outras
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                {tab.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Conteúdo da Aba (as páginas filhas) */}
      <div className="max-w-7xl mx-auto">
        {/* O 'Outlet' renderiza a página filha e passa os dados da viagem para ela */}
        <Outlet context={{ dadosViagem }} />
      </div>
    </div>
  );
}