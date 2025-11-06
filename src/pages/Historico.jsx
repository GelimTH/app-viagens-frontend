// src/pages/Historico.jsx
import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, DollarSign, Filter, Edit, Trash2, History, Users, Loader2, User, Megaphone } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { statusConfig, formatarMoeda } from "@/lib/utils";
import ModalConvidar from "../components/historico/ModalConvidar";
import ModalComunicados from "../components/historico/ModalComunicados";
import ModalConfirmacao from "../components/shared/ModalConfirmacao";

export default function Historico() {
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const queryClient = useQueryClient();

  // Mantendo seu estado original para o modal de convite
  const [modalState, setModalState] = useState({ open: false, viagemId: null });
  const [comunicadoModal, setComunicadoModal] = useState({ open: false, viagemId: null });
  const [confirmDeleteModal, setConfirmDeleteModal] = useState({ open: false, viagemId: null });

  // Busca o usuário atual para permissões
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: api.getCurrentUser,
  });

  const { data: viagens = [], isLoading } = useQuery({
    queryKey: ['viagens'],
    queryFn: api.getViagens,
  });

  const deleteViagemMutation = useMutation({
    mutationFn: api.deleteViagem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viagens'] });
      setConfirmDeleteModal({ open: false, viagemId: null });
    },
    onError: (error) => {
      console.error("Erro ao deletar viagem:", error);
      alert("Não foi possível deletar a viagem.");
      setConfirmDeleteModal({ open: false, viagemId: null });
    }
  });

  const handleDelete = (viagemId) => {
    setConfirmDeleteModal({ open: true, viagemId: viagemId });
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteModal.viagemId) {
      deleteViagemMutation.mutate(confirmDeleteModal.viagemId);
    }
  };

  const viagensFiltradas = filtroStatus === "todos"
    ? viagens
    : viagens.filter(v => v.status === filtroStatus);

  // Sua lógica de permissão
  const canManage = user && ['GESTOR', 'ASSESSOR_DIRETOR', 'DESENVOLVEDOR'].includes(user.role);

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <History className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Histórico de Missões</h1>
            <p className="text-slate-600">Todas as suas missões e despesas</p>
          </div>
        </div>

        {/* Filtro */}
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

        {/* Lista de Viagens */}
        <div className="grid gap-4">
          {isLoading ? <p>Carregando histórico...</p> :
            viagensFiltradas.length === 0 ? (
              <Card className="border-0 shadow-xl bg-white">
                <CardContent className="p-12 text-center">
                  <p className="text-slate-500">Nenhuma missão encontrada para este filtro</p>
                </CardContent>
              </Card>
            ) : (
              viagensFiltradas.map((viagem) => (
                <Card key={viagem.id} className="border-0 shadow-xl bg-white hover:shadow-2xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <MapPin className="w-5 h-5 text-blue-600" />
                          <h3 className="text-xl font-bold text-slate-900">{viagem.destino}</h3>
                          <Badge variant={statusConfig[viagem.status]?.variant || 'default'}>
                            {statusConfig[viagem.status]?.label}
                          </Badge>
                        </div>
                        <p className="text-slate-600 mb-3">{viagem.motivo}</p>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
                          {/* Solicitante */}
                          {viagem.colaborador && (
                            <div className="flex items-center gap-1.5" title={viagem.colaborador.email}>
                              <User className="w-4 h-4" />
                              <span>{viagem.colaborador.fullName}</span>
                            </div>
                          )}
                          {/* Data */}
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {format(new Date(viagem.dataIda), "dd MMM", { locale: ptBR })} - {format(new Date(viagem.dataVolta), "dd MMM yyyy", { locale: ptBR })}
                            </span>
                          </div>
                          {/* Valor */}
                          {viagem.valorEstimado != null && (
                            <div className="flex items-center gap-1.5">
                              <DollarSign className="w-4 h-4" />
                              <span>{formatarMoeda(viagem.valorEstimado)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Botões de Ação */}
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Link to={`/app/viagens/editar/${viagem.id}`} className="flex-1 sm:flex-auto">
                          <Button variant="outline" size="sm" className="w-full">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>

                        {/* Botão Convidar Visitante */}
                        {canManage && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-green-300 text-green-700 hover:bg-green-50 flex-1 sm:flex-auto"
                            // ==================================================
                            // CORREÇÃO AQUI
                            // ==================================================
                            onClick={() => setModalState({ open: true, viagemId: viagem.id })}
                            title="Convidar Visitante"
                          >
                            <Users className="w-4 h-4" />
                          </Button>
                        )}

                        {/* Botão Comunicados */}
                        {canManage && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-300 text-blue-700 hover:bg-blue-50 flex-1 sm:flex-auto"
                            onClick={() => setComunicadoModal({ open: true, viagemId: viagem.id })}
                            title="Comunicados"
                          >
                            <Megaphone className="w-4 h-4" />
                          </Button>
                        )}

                        {/* Botão Deletar (Sua nova permissão) */}
                        {canManage && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(viagem.id)}
                            disabled={deleteViagemMutation.isPending && confirmDeleteModal.viagemId === viagem.id}
                            className="flex-1 sm:flex-auto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) // 
            )}
        </div>
      </div>

      {/* Renderização dos Modais */}
      {modalState.open && ( // 
        <ModalConvidar
          viagemId={modalState.viagemId}
          onClose={() => setModalState({ open: false, viagemId: null })}
        />
      )}
      {comunicadoModal.open && (
        <ModalComunicados
          viagemId={comunicadoModal.viagemId}
          onClose={() => setComunicadoModal({ open: false, viagemId: null })}
        />
      )}
      {confirmDeleteModal.open && (
        <ModalConfirmacao
          open={true}
          onClose={() => setConfirmDeleteModal({ open: false, viagemId: null })}
          onConfirm={handleConfirmDelete}
          isLoading={deleteViagemMutation.isPending}
          title="Confirmar Exclusão"
          message="Tem certeza que deseja deletar esta missão? Esta ação não pode ser desfeita."
          confirmText="Sim, Excluir"
          cancelText="Cancelar"
        />
      )}
    </div>
  );
}