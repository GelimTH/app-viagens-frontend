// src/components/shared/layout.jsx
import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { useSidebar } from '@/hooks/useSidebar';
import { Button } from '@/components/ui/button';
import { 
    Plane, Home, FileText, History, User, 
    LogOut, Menu, ClipboardCheck, Settings, BookOpen, Hotel, Megaphone 
} from 'lucide-react';
// 1. Importe a versão do seu `package.json`
import { version } from '../../../package.json';

function SidebarContent() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: api.getCurrentUser,
  });

  const navigate = useNavigate();

  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const handleLogout = () => {
    // Esta é a função que criamos no apiClient.js
    api.logout();
    // Redireciona para a página de login
    navigate('/');
  };

  let navigationItems = [];
  const role = user?.role; // Pega a role do usuário

  if (role === 'VISITANTE') {
    // --- Menu do Visitante ---
    navigationItems = [
      { title: "Minha Viagem", to: "/app/minha-viagem", icon: Plane },
      // (Links baseados na sua descrição)
      { title: "Itinerário", to: "/app/minha-viagem/itinerario", icon: BookOpen },
      { title: "Hotel", to: "/app/minha-viagem/hotel", icon: Hotel },
      { title: "Comunicados", to: "/app/minha-viagem/comunicados", icon: Megaphone },
      
      // (Prestação de contas do visitante pode vir aqui no futuro)
      // { title: "Minhas Despesas", to: "/app/prestacaocontas", icon: FileText },
    ];
  } else {
    // --- Menu do Colaborador (e outros) ---
    navigationItems = [
      { title: "Início", to: "/app/dashboard", icon: Home },
      { title: "Nova Viagem", to: "/app/novaviagem", icon: Plane },
      { title: "Prestação de Contas", to: "/app/prestacaocontas", icon: FileText },
    ];

    // Adiciona Aprovações e Histórico para roles com permissão
    if (role === 'GESTOR' || role === 'ASSESSOR_DIRETOR' || role === 'DESENVOLVEDOR') {
      navigationItems.push({ title: "Aprovações", to: "/app/aprovacoes", icon: ClipboardCheck });
    }
    
    navigationItems.push({ title: "Histórico", to: "/app/historico", icon: History });
  }

  return (
    <>
      <header className="border-b border-slate-100 p-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg">
            <Plane className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-xl text-slate-900">Embarque Coração 💙</h2>
            <p className="text-xs text-slate-500 font-medium">SGV - Sistema Gestor de Viagem</p>
          </div>
        </div>
      </header>
      <nav className="p-4 space-y-1">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold ${isActive ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200' : 'hover:bg-slate-100 text-slate-700'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>
      <footer ref={menuRef} className="relative mt-auto border-t border-slate-100 p-4 flex-shrink-0">

        {isProfileMenuOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-2 p-1 bg-white rounded-xl shadow-2xl border border-slate-100 animate-in fade-in-0 zoom-in-95">
            <ul className="space-y-1">
              <li>
                <NavLink
                  to="/app/perfil"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                  onClick={() => setProfileMenuOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  <span>Configurações da conta</span>
                </NavLink>
              </li>
              <li>
                <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              </li>
            </ul>
          </div>
        )}

        <button
          onClick={() => setProfileMenuOpen(prev => !prev)}
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 transition-colors text-left"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-slate-300 to-slate-400 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 text-sm truncate">{user?.fullName || "Usuário"}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email || ""}</p>
          </div>
        </button>

        {/* 2. NOVO RODAPÉ DA SIDEBAR */}
        <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-100 mt-4">
          <p>Versão {version}</p>
          {/*<p className="mt-1">Criado por Ângelo Lena - Github/@GelimTH</p>*/}
        </div>
      </footer>
    </>
  );
}

// O componente de Layout principal, agora com a lógica de responsividade
export default function Layout({ children }) {
  const { isOpen, toggleSidebar } = useSidebar();

  return (
    <div className="h-screen flex w-full bg-slate-50">
      {/* ===== Sidebar para Desktop (visível em ecrãs `md` ou maiores) ===== */}
      <aside className="hidden md:flex w-73 flex-shrink-0 bg-white border-r border-slate-200 flex-col">
        <SidebarContent />
      </aside>

      {/* ===== Sidebar para Mobile (deslizante e com fundo escuro) ===== */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-73 bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <SidebarContent />
      </aside>

      {/* ===== Conteúdo Principal (que ocupa o resto do espaço) ===== */}
      <div className="flex-1 flex flex-col overflow-x-hidden">
        <header className="md:hidden sticky top-0 bg-white border-b border-slate-200 p-4 z-30 flex items-center">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold text-slate-800 mx-auto">Viagens</h1>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}