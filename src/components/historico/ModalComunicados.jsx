import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, AlertCircle } from 'lucide-react';
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

function ComunicadoItem({ comunicado }) {
  return (
    <div className="border-b pb-3 last:border-b-0">
      <h4 className="font-bold text-slate-800">{comunicado.titulo}</h4>
      <p className="text-sm text-slate-600 whitespace-pre-wrap mt-1">{comunicado.conteudo}</p>
      <p className="text-xs text-slate-400 mt-2">
        {formatDistanceToNow(new Date(comunicado.createdAt), { locale: ptBR, addSuffix: true })}
      </p>
    </div>
  );
}

export default function ModalComunicados({ viagemId, onClose }) {
  const queryClient = useQueryClient();
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  
  // 1. Busca comunicados existentes
  const { data: comunicados = [], isLoading } = useQuery({
    queryKey: ['comunicados', viagemId],
    queryFn: () => api.getComunicados(viagemId),
  });

  // 2. Mutação para criar um novo
  const createMutation = useMutation({
    mutationFn: api.createComunicado,
    onSuccess: () => {
      // Limpa o formulário e atualiza a lista
      setTitulo('');
      setConteudo('');
      queryClient.invalidateQueries({ queryKey: ['comunicados', viagemId] });
    },
    onError: (err) => {
      alert("Erro ao enviar comunicado: " + (err.response?.data?.error || err.message));
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!titulo || !conteudo) {
      alert("Título e Conteúdo são obrigatórios.");
      return;
    }
    createMutation.mutate({ viagemId, titulo, conteudo });
  };

  return (
    <Modal open={true} onClose={onClose} widthClass="max-w-2xl">
      <ModalHeader onClose={onClose}>
        Mural de Comunicados
      </ModalHeader>
      
      <ModalBody className="max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coluna da Esquerda: Lista de Comunicados */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800">Comunicados Publicados</h3>
            {isLoading ? (
              <div className="flex items-center justify-center p-4 gap-2 text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
              </div>
            ) : comunicados.length === 0 ? (
              <div className="text-center text-sm text-slate-500 p-4 rounded-lg bg-slate-50">
                Nenhum comunicado publicado para esta missão.
              </div>
            ) : (
              <div className="space-y-4">
                {comunicados.map(com => (
                  <ComunicadoItem key={com.id} comunicado={com} />
                ))}
              </div>
            )}
          </div>
          
          {/* Coluna da Direita: Novo Comunicado */}
          <form onSubmit={handleSubmit} className="space-y-4 border-l-0 md:border-l md:pl-6">
            <h3 className="font-semibold text-slate-800">Novo Comunicado</h3>
            <div className="space-y-2">
              <Label htmlFor="titulo-comunicado">Título</Label>
              <Input 
                id="titulo-comunicado" 
                placeholder="Ex: Mudança de Voo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                disabled={createMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="conteudo-comunicado">Conteúdo</Label>
              <Textarea
                id="conteudo-comunicado"
                placeholder="Descreva o comunicado..."
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                disabled={createMutation.isPending}
                rows={5}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Publicar
            </Button>
          </form>
        </div>
      </ModalBody>
    </Modal>
  );
}