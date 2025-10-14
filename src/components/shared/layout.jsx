// src/components/shared/Layout.jsx
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { useSidebar } from '@/hooks/useSidebar';
import { Button } from '@/components/ui/button';
import { 
    Plane, Home, FileText, History, User, 
    LogOut, Menu 
} from 'lucide-react';

function SidebarContent() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: api.getCurrentUser,
  });

  const navigationItems = [
    { title: "Início", to: "/app/dashboard", icon: Home },
    { title: "Nova Viagem", to: "/app/novaviagem", icon: Plane },
    { title: "Prestação de Contas", to: "/app/prestacaocontas", icon: FileText },
    { title: "Histórico", to: "/app/historico", icon: History },
  ];

  return (
    <>
      <header className="border-b border-slate-100 p-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg">
            <Plane className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-xl text-slate-900">Viagens</h2>
            <p className="text-xs text-slate-500 font-medium">Gestão Corporativa</p>
          </div>
        </div>
      </header>

      <nav className="p-4 space-y-1">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold ${
                isActive ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200' : 'hover:bg-slate-100 text-slate-700'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>

      {/* MUDANÇA AQUI: `mt-auto` empurra o footer para o fundo */}
      <footer className="mt-auto border-t border-slate-100 p-4 space-y-3 flex-shrink-0">
        <NavLink to="/app/perfil" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 transition-colors">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-300 to-slate-400 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 text-sm truncate">{user?.fullName || "Usuário"}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email || ""}</p>
          </div>
        </NavLink>
        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </footer>
    </>
  );
}

// O componente de Layout principal
export default function Layout({ children }) {
  const { isOpen, toggleSidebar } = useSidebar();

  return (
    <div className="h-screen flex w-full bg-slate-50 overflow-hidden">
      {/* Sidebar para Desktop */}
      <aside className="hidden md:flex w-72 flex-shrink-0 bg-white border-r border-slate-200 flex-col">
        <SidebarContent />
      </aside>

      {/* Overlay para fechar a sidebar em mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={toggleSidebar}>
          <div className="absolute inset-0 bg-black opacity-25"></div>
        </div>
      )}
      
      {/* Sidebar para Mobile */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-white z-50 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden flex flex-col`}>
        <SidebarContent />
      </aside>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden sticky top-0 bg-white border-b border-slate-200 p-4 z-30 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold text-slate-800">Viagens</h1>
          <div className="w-10"></div>
        </header>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}