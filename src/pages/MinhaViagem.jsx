import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { Plane, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TimelineItem from '../components/minha-viagem/TimelineItem';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Modal, ModalHeader, ModalBody } from "@/components/ui/modal";
import UploadNota from '../components/prestacao/UploadNota';

const CACHE_VIAGEM_KEY = 'minhaViagemCache';

// Componente de Resumo (sem mudanças)
function ResumoViagem({ viagem, gestor }) {
  // ... (O código deste componente não precisa mudar) ...
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


// Página Principal (COM LOGS)
export default function MinhaViagem() {
  console.log("LOG 1: Componente MinhaViagem.jsx RENDERIZOU.");

  const [dadosViagem, setDadosViagem] = useState(null);
  const queryClient = useQueryClient();
  const [modalDespesaAberto, setModalDespesaAberto] = useState(false);
  const [eventoSelecionadoId, setEventoSelecionadoId] = useState(null);

  useEffect(() => {
    try {
      const viagemCache = localStorage.getItem(CACHE_VIAGEM_KEY);
      if (viagemCache) {
        console.log("LOG 2: Encontrado dados no cache. Carregando...");
        setDadosViagem(JSON.parse(viagemCache));
      } else {
        console.log("LOG 2: Nenhum dado encontrado no cache.");
      }
    } catch (error) {
      console.warn("LOG 2: Falha ao ler cache:", error);
    }
  }, []); // Executa apenas uma vez

  const { 
    data: queryData, // Renomeado para 'queryData' para evitar conflito com o 'dadosViagem' do state
    isLoading: isLoadingViagem, 
    error: errorViagem 
  } = useQuery({
    queryKey: ['minhaViagem'],
    queryFn: () => {
      console.log("LOG 3: BUSCANDO DADOS da api.getMinhaViagem...");
      return api.getMinhaViagem();
    },
    enabled: true, // Garante que a query rode
    onSuccess: (data) => {
      console.log("LOG 4: SUCESSO. Dados recebidos da API:", data);
      setDadosViagem(data); // Define o estado com os dados
      localStorage.setItem(CACHE_VIAGEM_KEY, JSON.stringify(data));
    },
    onError: (error) => {
        console.error("LOG 5: ERRO na query 'minhaViagem':", error);
    }
  });

  const viagemId = dadosViagem?.viagem?.id;
  const timeline = dadosViagem?.viagem?.eventos || [];

  // (Handlers de mutação e modal - sem mudanças)
  const createDespesaMutation = useMutation({
    mutationFn: api.createDespesa,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minhaViagem'] });
      handleFecharModalDespesa();
    },
    onError: (err) => { console.error("Erro ao criar despesa:", err); alert("Erro ao salvar despesa."); }
  });
  const handleAbrirModalDespesa = (eventoId) => { setEventoSelecionadoId(eventoId); setModalDespesaAberto(true); };
  const handleFecharModalDespesa = () => { setEventoSelecionadoId(null); setModalDespesaAberto(false); };


  // --- TRATAMENTO DE ERRO / RASTREAMENTO ---
  console.log("LOG 6: ESTADO ATUAL (antes de renderizar):", {
    isLoadingViagem,
    errorViagem: errorViagem ? errorViagem.message : null,
    dadosViagem: dadosViagem, // Este é o state
    queryData: queryData      // Este é o retorno direto da useQuery
  });

  if (isLoadingViagem && !dadosViagem) {
    console.log("LOG 7: Renderizando: LOADING (aguardando dados da rede, sem cache)");
    return (
      <div className="p-8 flex items-center justify-center gap-2 text-slate-600">
        <Loader2 className="w-5 h-5 animate-spin" />
        Carregando dados da sua viagem...
      </div>
    );
  }

  if (errorViagem && !dadosViagem) {
    console.log("LOG 7: Renderizando: ERRO DA QUERY (e sem cache)");
    return (
      <div className="p-8 text-red-600 flex items-center justify-center gap-2">
        <AlertCircle className="w-5 h-5" />
        {errorViagem.response?.data?.error || "Erro ao buscar sua viagem."}
      </div>
    );
  }

  if (!dadosViagem || !dadosViagem.viagem) {
    console.log("LOG 7: Renderizando: 'Nenhuma viagem encontrada' (query terminou, mas dados são nulos ou inválidos)");
    return <div className="p-8 text-center text-slate-500">Nenhuma viagem encontrada para você.</div>;
  }
  
  // Se chegou aqui, os dados existem
  console.log("LOG 8: Renderizando: SUCESSO (Timeline e Dados da Viagem)");
  const { viagem, gestor } = dadosViagem;

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Plane className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Meu Itinerário</h1>
            <p className="text-slate-600">Aqui está o cronograma da sua viagem.</p>
          </div>
        </div>

        <ResumoViagem viagem={viagem} gestor={gestor} />

        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle>Linha do Tempo</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {!timeline || timeline.length === 0 ? (
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
      </div>

      <Modal open={modalDespesaAberto} onClose={handleFecharModalDespesa} widthClass="max-w-2xl">
        <ModalHeader onClose={handleFecharModalDespesa}>
          Registrar Nova Despesa
        </ModalHeader>
        <ModalBody>
          <UploadNota
            viagemId={viagemId}
            eventoTimelineId={eventoSelecionadoId}
            onSalvar={createDespesaMutation.mutateAsync}
            carregando={createDespesaMutation.isPending}
            onCancelar={handleFecharModalDespesa}
            onSucesso={() => {}}
            isEditMode={false}
          />
        </ModalBody>
      </Modal>
    </div>
  );
}