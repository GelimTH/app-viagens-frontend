// src/pages/Historico.jsx
import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, DollarSign, Filter, Edit, Trash2, History, Users, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
// 1. Importe `formatarMoeda` junto com `statusConfig`
import { statusConfig, formatarMoeda } from "@/lib/utils";
import ModalConvidar from "../components/historico/ModalConvidar";

export default function Historico() {
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const queryClient = useQueryClient();

  const [modalState, setModalState] = useState({ open: false, viagemId: null });

  const { data: viagens = [], isLoading } = useQuery({
    queryKey: ['viagens'],
    queryFn: api.getViagens,
  });

  const deleteViagemMutation = useMutation({
    mutationFn: api.deleteViagem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viagens'] });
    },
    onError: (error) => {
      console.error("Erro ao deletar viagem:", error);
      alert("Não foi possível deletar a viagem.");
    }
  });

  const handleDelete = (viagemId) => {
    if (window.confirm('Tem certeza que deseja deletar esta viagem? Esta ação não pode ser desfeita.')) {
      deleteViagemMutation.mutate(viagemId);
    }
  };

  const viagensFiltradas = filtroStatus === "todos"
    ? viagens
    : viagens.filter(v => v.status === filtroStatus);

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <History className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Histórico de Viagens</h1>
            <p className="text-slate-600">Todas as suas viagens e despesas</p>
          </div>
        </div>

        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-slate-500" />
              <span className="font-semibold text-slate-900">Filtrar por Status</span>
            </div>
            <Tabs value={filtroStatus} onValueChange={setFiltroStatus}>
              <TabsList className="bg-slate-100">
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="em_analise">Em Análise</TabsTrigger>
                <TabsTrigger value="aprovado">Aprovados</TabsTrigger>
                <TabsTrigger value="reprovado">Reprovados</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {isLoading ? <p>Carregando histórico...</p> :
            viagensFiltradas.length === 0 ? (
              <Card className="border-0 shadow-xl bg-white">
                <CardContent className="p-12 text-center">
                  <p className="text-slate-500">Nenhuma viagem encontrada para este filtro</p>
                </CardContent>
              </Card>
            ) : (
              viagensFiltradas.map((viagem) => (
                <Card key={viagem.id} className="border-0 shadow-xl bg-white hover:shadow-2xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <MapPin className="w-5 h-5 text-blue-600" />
                          <h3 className="text-xl font-bold text-slate-900">{viagem.destino}</h3>
                          <Badge variant={statusConfig[viagem.status]?.variant || 'default'}>
                            {statusConfig[viagem.status]?.label}
                          </Badge>
                        </div>
                        <p className="text-slate-600 mb-3">{viagem.motivo}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {format(new Date(viagem.dataIda), "dd MMM", { locale: ptBR })} - {format(new Date(viagem.dataVolta), "dd MMM yyyy", { locale: ptBR })}
                            </span>
                          </div>
                          {/* 2. MUDANÇA AQUI: Usando a função `formatarMoeda` */}
                          {viagem.valorEstimado != null && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span>{formatarMoeda(viagem.valorEstimado)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/app/viagens/editar/${viagem.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>

                        {/* 6. ATUALIZE O BOTÃO DE CONVIDAR */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-300 text-green-700 hover:bg-green-50"
                          // ATUALIZE O ONCLICK AQUI:
                          onClick={() => setModalState({ open: true, viagemId: viagem.id })}
                          title="Convidar Visitante"
                        >
                          {/* Removemos o 'disabled' e o 'Loader2' daqui */}
                          <Users className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(viagem.id)}
                          disabled={deleteViagemMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
        </div>
      </div>
      {modalState.open && (
        <ModalConvidar
          viagemId={modalState.viagemId}
          onClose={() => setModalState({ open: false, viagemId: null })}
        />
      )}
    </div>
  );
}