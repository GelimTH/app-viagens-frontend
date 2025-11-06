import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function ModalConfirmacao({
  open,
  onClose,
  onConfirm,
  title = "Confirmar Ação",
  message = "Você tem certeza?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isLoading = false
}) {
  return (
    <Modal open={open} onClose={onClose} widthClass="max-w-md">
      <ModalHeader onClose={onClose}>
        <div className="flex items-center gap-2">
          {/* Usamos o ícone de alerta para dar ênfase */}
          <AlertTriangle className="w-6 h-6 text-red-600" />
          {title}
        </div>
      </ModalHeader>
      <ModalBody>
        <p className="text-slate-700">{message}</p>
      </ModalBody>
      <ModalFooter>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={onClose} 
          disabled={isLoading}
        >
          {cancelText}
        </Button>
        <Button
          variant="destructive" // O botão de exclusão é vermelho
          className="w-full"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}