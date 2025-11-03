import React, { useState } from 'react'; // <-- IMPORTE O "useState"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // <-- IMPORTE useMutation e useQueryClient
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { Plane, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TimelineItem from '../components/minha-viagem/TimelineItem'; // Importa o novo componente
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Modal, ModalHeader, ModalBody } from "@/components/ui/modal";
import UploadNota from '../components/prestacao/UploadNota';

// Componente para o Card de Resumo
function ResumoViagem({ viagem, gestor }) {
  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-4">
        <CardTitle className="text-xl font-bold text-slate-900">
          Sua Viagem para {viagem.destino}
        </CardTitle>
        <p className="text-sm text-slate-500">
          Organizada por: {gestor?.fullName || 'Gestor'}
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 text-slate-700">
          <Calendar className="w-4 h-4" />
          <span className="font-medium">
            {format(new Date(viagem.dataIda), "dd MMM, yyyy", { locale: ptBR })}
          </span>
          <span className="text-slate-400">até</span>
          <span className="font-medium">
            {format(new Date(viagem.dataVolta), "dd MMM, yyyy", { locale: ptBR })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// Página Principal
export default function MinhaViagem() {
  // 1. Busca os dados da viagem (como antes)
  const { data: dadosViagem, isLoading: isLoadingViagem, error: errorViagem } = useQuery({
    queryKey: ['minhaViagem'],
    queryFn: api.getMinhaViagem,
  });

  const queryClient = useQueryClient();
  const [modalDespesaAberto, setModalDespesaAberto] = useState(false);
  const [eventoSelecionadoId, setEventoSelecionadoId] = useState(null);

  const viagemId = dadosViagem?.viagem?.id;

  // Mutation para criar a despesa (copiada de PrestacaoContas.jsx)
  const createDespesaMutation = useMutation({
    mutationFn: api.createDespesa,
    onSuccess: () => {
      // Invalida a query de despesas para atualizar a página de Prestação de Contas
      queryClient.invalidateQueries({ queryKey: ['despesas', viagemId] });
      handleFecharModalDespesa(); // Fecha o modal
    },
    onError: (err) => {
      console.error("Erro ao criar despesa:", err);
      alert("Erro ao salvar despesa. Verifique os dados.");
    }
  });

  const handleAbrirModalDespesa = (eventoId) => {
    setEventoSelecionadoId(eventoId);
    setModalDespesaAberto(true);
  };

  const handleFecharModalDespesa = () => {
    setEventoSelecionadoId(null);
    setModalDespesaAberto(false);
  };

  // 2. Busca a timeline, mas só se o ID da viagem já foi carregado
  const { data: timeline, isLoading: isLoadingTimeline } = useQuery({
    queryKey: ['timelineDaViagem', viagemId],
    queryFn: () => api.getTimelineDaViagem(viagemId),
    enabled: !!viagemId, // SÓ EXECUTA QUANDO viagemId existir
  });

  // --- Tratamento de Loading e Erros ---
  if (isLoadingViagem) {
    return (
      <div className="p-8 flex items-center justify-center gap-2 text-slate-600">
        <Loader2 className="w-5 h-5 animate-spin" />
        Carregando dados da sua viagem...
      </div>
    );
  }

  if (errorViagem) {
    return (
      <div className="p-8 text-red-600 flex items-center justify-center gap-2">
        <AlertCircle className="w-5 h-5" />
        {errorViagem.response?.data?.error || "Erro ao buscar sua viagem."}
      </div>
    );
  }

  if (!dadosViagem || !dadosViagem.viagem) {
    return <div className="p-8 text-center text-slate-500">Nenhuma viagem encontrada para você.</div>;
  }

  const { viagem, gestor } = dadosViagem;

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Plane className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Meu Itinerário</h1>
            <p className="text-slate-600">Aqui está o cronograma da sua viagem.</p>
          </div>
        </div>

        {/* Card de Resumo */}
        <ResumoViagem viagem={viagem} gestor={gestor} />

        {/* Card da Timeline */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle>Linha do Tempo</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {isLoadingTimeline ? (
              <div className="flex items-center gap-2 text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Buscando eventos...
              </div>
            ) : !timeline || timeline.length === 0 ? (
              <p className="text-slate-500 text-center py-4">
                Nenhum evento de itinerário cadastrado para esta viagem.
              </p>
            ) : (
              timeline.map((evento, index) => (
                <TimelineItem
                  key={evento.id}
                  evento={evento}
                  isPrimeiro={index === 0}
                  isUltimo={index === timeline.length - 1}
                  onAddDespesa={handleAbrirModalDespesa}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* TODO: Adicionar Documentos Offline e Ações Rápidas (P5) */}
      </div>
      <Modal open={modalDespesaAberto} onClose={handleFecharModalDespesa} widthClass="max-w-2xl">
        <ModalHeader onClose={handleFecharModalDespesa}>
          Registrar Nova Despesa
        </ModalHeader>
        <ModalBody>
          <UploadNota
            viagemId={viagemId}
            eventoTimelineId={eventoSelecionadoId} // <-- PASSA O ID DO EVENTO
            onSalvar={createDespesaMutation.mutateAsync}
            carregando={createDespesaMutation.isPending}
            onCancelar={handleFecharModalDespesa}
            onSucesso={() => { /* A mutation já cuida de fechar */ }}
            isEditMode={false}
          />
        </ModalBody>
      </Modal>
    </div>
  );
}