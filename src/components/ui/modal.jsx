// CRIE O NOVO ARQUIVO: src/components/ui/modal.jsx

import React from 'react';
import ReactDOM from 'react-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Fundo escuro
const ModalOverlay = ({ onClose }) => (
  <div
    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in-0"
    onClick={onClose}
  />
);

// Container do conteúdo
const ModalContent = ({ children, widthClass }) => (
  <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2">
    {/* 2. ALTERAÇÃO: Troque "max-w-lg" pelo {widthClass} dinâmico */}
    <div className={cn("w-full animate-in zoom-in-95", widthClass)}>
      {children}
    </div>
  </div>
);

// Componente principal do Modal (usa Portal)
export function Modal({ open, onClose, children, className, widthClass = "max-w-lg" }) {
  if (!open) return null;

  return ReactDOM.createPortal(
    <>
      <ModalOverlay onClose={onClose} />
      {/* E passe o widthClass para o ModalContent */}
      <ModalContent widthClass={widthClass}>
        <Card className={cn("border-0 shadow-xl bg-white", className)}>
          {children}
        </Card>
      </ModalContent>
    </>,
    document.getElementById('root') 
  );
}

// Header estilizado
export const ModalHeader = ({ children, onClose }) => (
  <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
    <CardTitle className="text-xl font-bold text-slate-900">
      {children}
    </CardTitle>
    {onClose && (
      <Button variant="ghost" size="icon" onClick={onClose}>
        <X className="w-5 h-5" />
      </Button>
    )}
  </CardHeader>
);

// Corpo estilizado
export const ModalBody = ({ children, className }) => (
  <CardContent className={cn("p-6 space-y-4", className)}>
    {children}
  </CardContent>
);

// Rodapé estilizado
export const ModalFooter = ({ children, className }) => (
  <CardContent className={cn("flex gap-3 pt-4 border-t", className)}>
    {children}
  </CardContent>
);