// src/hooks/useSidebar.jsx
import React, { createContext, useContext, useState } from 'react';

// Cria o "contexto" que vai guardar o estado da sidebar (aberta/fechada)
const SidebarContext = createContext();

// Cria o "provedor" que vai envolver nosso aplicativo
export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

// Cria o "hook" que os nossos componentes usarão para aceder ao estado
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}