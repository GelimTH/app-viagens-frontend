import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function ModalReprovarDespesa({
  open,
  onClose,
  onConfirm,
  isLoading = false
}) {
  const [justificativa, setJustificativa] = useState('');

  const handleConfirm = () => {
    if (!justificativa.trim()) {
      alert("A justificativa é obrigatória para reprovar.");
      return;
    }
    onConfirm(justificativa);
  };

  return (
    <Modal open={open} onClose={onClose} widthClass="max-w-lg">
      <ModalHeader onClose={onClose}>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          Reprovar Despesa
        </div>
      </ModalHeader>
      <ModalBody>
        <div className="space-y-2">
          <Label htmlFor="justificativa-reprovacao">
            Justificativa (Obrigatório)
          </Label>
          <Textarea
            id="justificativa-reprovacao"
            placeholder="Descreva o motivo da reprovação (Ex: Nota fiscal ilegível, valor acima do permitido...)"
            value={justificativa}
            onChange={(e) => setJustificativa(e.target.value)}
            rows={4}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={onClose} 
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleConfirm}
          disabled={isLoading || !justificativa.trim()}
        >
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Confirmar Reprovação
        </Button>
      </ModalFooter>
    </Modal>
  );
}