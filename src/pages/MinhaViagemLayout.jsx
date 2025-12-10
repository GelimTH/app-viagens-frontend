import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Map, Calendar, DollarSign, LogOut, MessageCircle, Home } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/apiClient";
import ModalTermos from "@/components/minha-viagem/ModalTermos"; // Novo componente

export default function MinhaViagemLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [termosPendentes, setTermosPendentes] = useState(false);

  // Busca dados da viagem ("Minha Viagem")
  const { data: dadosViagem, isLoading } = useQuery({
    queryKey: ['minhaViagem'],
    queryFn: api.getMinhaViagem,
    retry: 1,
    onError: () => {
      // Se der erro (ex: não logado), redireciona
      navigate('/');
    }
  });

  // Efeito para verificar se os termos foram aceitos
  useEffect(() => {
    if (dadosViagem?.perfil) {
      // Se termosAceitos for false, o modal deve aparecer
      // Se o campo não existir (null/undefined), assume false para segurança
      const aceitou = dadosViagem.perfil.termosAceitos === true;
      setTermosPendentes(!aceitou);
    }
  }, [dadosViagem]);

  // Ação ao aceitar os termos no Modal
  const handleTermosAceitos = () => {
    setTermosPendentes(false);
    queryClient.invalidateQueries(['minhaViagem']); // Atualiza os dados para confirmar o status no cache
  };

  // Logout
  const handleLogout = () => {
    api.logout();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Lógica do Link do WhatsApp (Tarefa 4)
  // Pega o telefone do gestor vindo da API e remove caracteres não numéricos
  const gestorTelefone = dadosViagem?.gestor?.profile?.telefone;
  const whatsappLink = gestorTelefone 
    ? `https://wa.me/55${gestorTelefone.replace(/\D/g, '')}` 
    : null;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* --- MODAL DE TERMOS (TAREFA 2) --- */}
      {/* Aparece sobre tudo se os termos estiverem pendentes */}
      <ModalTermos 
        open={termosPendentes} 
        onAceitar={handleTermosAceitos}
        onLogout={handleLogout}
        dadosUsuario={{ 
          fullName: dadosViagem?.perfil?.fullName, // Ajuste conforme seu retorno da API
          ...dadosViagem?.perfil 
        }}
        dadosViagem={dadosViagem?.viagem}
      />

      {/* Sidebar de Navegação */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-bold text-slate-800">Minha Viagem</h1>
          <p className="text-sm text-slate-500 mt-1 truncate">
            {dadosViagem?.viagem?.destino || 'Carregando...'}
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavLink 
            to="/minha-viagem" 
            end
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <Home className="w-5 h-5" />
            Visão Geral
          </NavLink>
          
          <NavLink 
            to="/minha-viagem/itinerario" 
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <Calendar className="w-5 h-5" />
            Itinerário
          </NavLink>

          <NavLink 
            to="/minha-viagem/financeiro" 
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <DollarSign className="w-5 h-5" />
            Financeiro
          </NavLink>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-auto relative">
        {/* Header Mobile */}
        <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-20">
          <span className="font-bold text-slate-800">Minha Viagem</span>
          <button onClick={handleLogout} className="text-slate-500">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Renderiza as sub-rotas */}
        <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24"> {/* pb-24 para dar espaço ao botão flutuante no mobile */}
          <Outlet context={{ dadosViagem }} />
        </div>

        {/* --- BOTÃO FLUTUANTE WHATSAPP (TAREFA 4) --- */}
        {/* Só aparece se tiver link e se os termos já tiverem sido aceitos */}
        {whatsappLink && !termosPendentes && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 z-50 flex items-center gap-2 group"
            title="Falar com o Organizador"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="font-semibold hidden group-hover:inline-block transition-all duration-300 whitespace-nowrap overflow-hidden max-w-0 group-hover:max-w-xs">
              Falar com Organizador
            </span>
          </a>
        )}

        {/* Menu Inferior Mobile */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between z-40">
          <NavLink to="/minha-viagem" end className={({ isActive }) => isActive ? "text-blue-600" : "text-slate-400"}>
            <Home className="w-6 h-6" />
          </NavLink>
          <NavLink to="/minha-viagem/itinerario" className={({ isActive }) => isActive ? "text-blue-600" : "text-slate-400"}>
            <Calendar className="w-6 h-6" />
          </NavLink>
          <NavLink to="/minha-viagem/financeiro" className={({ isActive }) => isActive ? "text-blue-600" : "text-slate-400"}>
            <DollarSign className="w-6 h-6" />
          </NavLink>
        </div>
      </main>
    </div>
  );
}