import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// 1. Imports de ícones atualizados
import { Loader2, Send, Mail, UserCheck, Copy, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// --- NOVO Componente de Item da Lista ---
function ConvidadoItem({ convite }) {
  const [copiado, setCopiado] = useState(false);

  const copiarToken = () => {
    navigator.clipboard.writeText(convite.token);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000); // Reseta o ícone após 2s
  };

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${convite.foiUsado ? 'bg-green-50' : 'bg-slate-50'}`}>
      <div className="flex items-center gap-3 overflow-hidden">
        {convite.foiUsado ? (
          <UserCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
        ) : (
          <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
        )}
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium text-slate-700 truncate">{convite.email}</p>
          {/* 2. Mostra o token como você pediu */}
          <p className="text-xs text-slate-500 font-mono truncate" title={convite.token}>
            Token: {convite.token}
          </p>
        </div>
      </div>
      <Button size="icon" variant="ghost" onClick={copiarToken} title="Copiar token">
        {copiado ? (
          <Check className="w-4 h-4 text-green-600" />
        ) : (
          <Copy className="w-4 h-4 text-slate-500" />
        )}
      </Button>
    </div>
  );
}

// --- Componente de Lista Atualizado ---
function ListaConvidados({ viagemId }) {
  // Busca a lista de convites (da API que criamos)
  const { data: convites, isLoading, error } = useQuery({
    queryKey: ['convites', viagemId],
    queryFn: () => api.getConvites(viagemId), //
  });

  if (isLoading) {
    return <div className="text-sm text-slate-500 text-center py-4">Carregando convidados...</div>;
  }
  if (error) {
    return <div className="text-sm text-red-500 text-center py-4">Erro ao buscar convidados.</div>;
  }
  if (!convites || convites.length === 0) {
    return <p className="text-sm text-slate-500 text-center py-4">Nenhum visitante convidado ainda.</p>;
  }

  return (
    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
      {convites.map((convite) => (
        <ConvidadoItem key={convite.id} convite={convite} />
      ))}
    </div>
  );
}

// --- Componente Principal do Modal (Atualizado) ---
export default function ModalConvidar({ viagemId, onClose }) {
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  // 3. REMOVEMOS o estado 'tokenGerado'

  const convidarVisitanteMutation = useMutation({
    mutationFn: api.convidarVisitante, //
    onSuccess: () => {
      // 4. FLUXO ATUALIZADO:
      // Removemos o alert()
      // Limpa o formulário
      setEmail('');
      setCpf('');
      setError('');
      // Atualiza a lista de convidados automaticamente
      queryClient.invalidateQueries({ queryKey: ['convites', viagemId] });
    },
    onError: (err) => {
      setError(err.response?.data?.error || "Não foi possível criar o convite.");
    }
  });

  const handleSubmit = () => {
    setError('');
    if (!email || !cpf) {
      setError("Email e CPF são obrigatórios.");
      return;
    }
    convidarVisitanteMutation.mutate({ viagemId, email, cpf });
  };

  return (
    // 5. Modal mais largo e de coluna única
    <Modal open={true} onClose={onClose} widthClass="max-w-2xl">
      <ModalHeader onClose={onClose}>
        Convidar Visitante
      </ModalHeader>
      
      {/* 6. Layout de coluna única */}
      <ModalBody className="space-y-6"> 
        
        {/* Seção 1: Formulário */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-800">Novo Convite</h3>
          
          {/* ========================================================== */}
          {/* CORREÇÃO DO ALINHAMENTO AQUI (usando wrapper de h-10)    */}
          {/* ========================================================== */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Coluna 1: Email */}
            <div className="space-y-2">
              {/* Wrapper de altura fixa para forçar o alinhamento */}
              <div className="h-10">
                <Label htmlFor="email-convite">Email do Visitante</Label>
              </div>
              <Input
                id="email-convite"
                type="email"
                placeholder="email.visitante@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            {/* Coluna 2: CPF */}
            <div className="space-y-2">
              {/* Wrapper de altura fixa para forçar o alinhamento */}
              <div className="h-10">
                <Label htmlFor="cpf-convite">CPF do Visitante (para validação)</Label>
              </div>
              <Input
                id="cpf-convite"
                placeholder="123.456.789-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
              />
            </div>
          </div>
          {/* ========================================================== */}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        
        {/* Seção 2: Lista (agora abaixo do formulário) */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-semibold text-slate-800">Visitantes já Convidados</h3>
          <ListaConvidados viagemId={viagemId} />
        </div>
      </ModalBody>
      
      <ModalFooter>
        <Button variant="outline" className="w-full" onClick={onClose} disabled={convidarVisitanteMutation.isPending}>
          Cancelar
        </Button>
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700" 
          onClick={handleSubmit}
          disabled={convidarVisitanteMutation.isPending}
        >
          {convidarVisitanteMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          Enviar Convite
        </Button>
      </ModalFooter>
    </Modal>
  );
}