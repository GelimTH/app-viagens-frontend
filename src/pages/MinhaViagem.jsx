// src/pages/MinhaViagem.jsx
import React, { useState, useEffect } from 'react'; // <-- Importe useState e useEffect
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // <-- Importe useMutation e useQueryClient
import { api } from '@/api/apiClient';
import { Plane, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TimelineItem from '../components/minha-viagem/TimelineItem'; // Importa o novo componente
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// --- IMPORTE OS COMPONENTES DO MODAL E O FORMULÁRIO ---
import { Modal, ModalHeader, ModalBody } from "@/components/ui/modal";
import UploadNota from '../components/prestacao/UploadNota';

// --- CACHE ---
// Chaves para o localStorage
const CACHE_VIAGEM_KEY = 'minhaViagemCache';
const CACHE_TIMELINE_KEY = 'minhaTimelineCache';

// Componente para o Card de Resumo (sem mudanças)
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
  // --- CACHE ---
  // Estados locais para guardar os dados (sejam eles do cache ou da API)
  const [dadosViagem, setDadosViagem] = useState(null);
  const [timeline, setTimeline] = useState(null);
  // -----------

  const queryClient = useQueryClient();
  const [modalDespesaAberto, setModalDespesaAberto] = useState(false);
  const [eventoSelecionadoId, setEventoSelecionadoId] = useState(null);

  // --- CACHE (ETAPA 1): Ler dados do cache ao carregar a página ---
  useEffect(() => {
    try {
      const viagemCache = localStorage.getItem(CACHE_VIAGEM_KEY);
      const timelineCache = localStorage.getItem(CACHE_TIMELINE_KEY);
      if (viagemCache) {
        setDadosViagem(JSON.parse(viagemCache));
      }
      if (timelineCache) {
        setTimeline(JSON.parse(timelineCache));
      }
    } catch (error) {
      console.warn("Falha ao ler cache:", error);
    }
  }, []); // Executa apenas uma vez, quando o componente monta

  // --- CACHE (ETAPA 2): Busca dados da API (viagem) ---
  const { isLoading: isLoadingViagem, error: errorViagem } = useQuery({
    queryKey: ['minhaViagem'],
    queryFn: api.getMinhaViagem,
    onSuccess: (data) => {
      // API funcionou? Salva os dados no estado E no cache.
      setDadosViagem(data);
      localStorage.setItem(CACHE_VIAGEM_KEY, JSON.stringify(data));
    },
    // Se falhar (offline), o `dadosViagem` do cache (lido no useEffect) será usado.
  });
  
  const viagemId = dadosViagem?.viagem?.id;

  // --- CACHE (ETAPA 3): Busca dados da API (timeline) ---
  const { isLoading: isLoadingTimeline } = useQuery({
    queryKey: ['timelineDaViagem', viagemId],
    queryFn: () => api.getTimelineDaViagem(viagemId),
    enabled: !!viagemId,
    onSuccess: (data) => {
      // API funcionou? Salva os dados no estado E no cache.
      setTimeline(data);
      localStorage.setItem(CACHE_TIMELINE_KEY, JSON.stringify(data));
    },
    // Se falhar (offline), o `timeline` do cache (lido no useEffect) será usado.
  });

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

  // --- Tratamento de Loading e Erros ---
  
  // Mostra "Loading" SÓ SE não tiver NADA (nem cache)
  if (isLoadingViagem && !dadosViagem) {
    return (
      <div className="p-8 flex items-center justify-center gap-2 text-slate-600">
        <Loader2 className="w-5 h-5 animate-spin" />
        Carregando dados da sua viagem...
      </div>
    );
  }

  // Mostra "Erro" SÓ SE não tiver NADA (nem cache)
  if (errorViagem && !dadosViagem) {
    return (
      <div className="p-8 text-red-600 flex items-center justify-center gap-2">
        <AlertCircle className="w-5 h-5" />
        {errorViagem.response?.data?.error || "Erro ao buscar sua viagem. Verifique sua conexão."}
      </div>
    );
  }

  // Se não tem cache E não tem dados da API
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
            {/* Mostra "Loading" SÓ SE não tiver cache da timeline */}
            {isLoadingTimeline && !timeline ? (
              <div className="flex items-center gap-2 text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Buscando eventos...
              </div>
            ) : !timeline || timeline.length === 0 ? (
              <p className="text-slate-500 text-center py-4">
                Nenhum evento de itinerário cadastrado para esta viagem.
              </p>
            ) : (
              // Renderiza os dados (do cache ou da API)
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

      {/* --- MODAL DE DESPESA (ADICIONAR NO FINAL) --- */}
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