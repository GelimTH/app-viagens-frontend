import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Plane, 
  Home, 
  FileText, 
  MessageSquare, 
  History, 
  User,
  LogOut,
  Menu
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";

const navigationItems = [
  {
    title: "Início",
    url: createPageUrl("Dashboard"),
    icon: Home,
  },
  {
    title: "Nova Viagem",
    url: createPageUrl("NovaViagem"),
    icon: Plane,
  },
  {
    title: "Prestação de Contas",
    url: createPageUrl("PrestacaoContas"),
    icon: FileText,
  },
  {
    title: "Chat IA",
    url: createPageUrl("ChatIA"),
    icon: MessageSquare,
  },
  {
    title: "Histórico",
    url: createPageUrl("Historico"),
    icon: History,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => api.auth.me(),
  });

  const handleLogout = () => {
    api.auth.logout();
  };

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --primary: #0F4C81;
          --primary-dark: #0A3661;
          --success: #10B981;
          --warning: #F59E0B;
          --danger: #EF4444;
          --bg-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
      `}</style>
      
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <Sidebar className="border-r border-slate-200 bg-white shadow-xl">
          <SidebarHeader className="border-b border-slate-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-slate-900">Viagens</h2>
                <p className="text-xs text-slate-500 font-medium">Gestão Corporativa</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`
                            rounded-xl mb-1 transition-all duration-200
                            ${isActive 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200' 
                              : 'hover:bg-slate-100 text-slate-700'
                            }
                          `}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                            <span className="font-semibold">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-100 p-4">
            <div className="space-y-3">
              <Link 
                to={createPageUrl("Perfil")}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-slate-300 to-slate-400 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm truncate">
                    {user?.full_name || "Usuário"}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{user?.email || ""}</p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white border-b border-slate-200 px-6 py-4 md:hidden shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors" />
              <h1 className="text-xl font-bold text-slate-900">Gestão de Viagens</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}