// src/pages/Historico.jsx
import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, DollarSign, Filter, Edit } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom"; // Importe o Link
import { Button } from "@/components/ui/button"; // Importe o Button

const statusConfig = {
  em_analise: { label: "Em Análise", color: "bg-orange-100 text-orange-800 border-orange-200" },
  aprovado: { label: "Aprovado", color: "bg-green-100 text-green-800 border-green-200" },
  pendente: { label: "Pendente", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  reprovado: { label: "Reprovado", color: "bg-red-100 text-red-800 border-red-200" }
};

export default function Historico() {
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const { data: viagens = [] } = useQuery({
    queryKey: ['viagens'],
    queryFn: api.getViagens,
    initialData: [],
  });

  const viagensFiltradas = filtroStatus === "todos"
    ? viagens
    : viagens.filter(v => v.status === filtroStatus);

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Calendar className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Histórico de Viagens</h1>
            <p className="text-slate-600">Todas as suas viagens e despesas</p>
          </div>
        </div>

        {/* Filters */}
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

        {/* Viagens List */}
        <div className="grid gap-4">
          {viagensFiltradas.length === 0 ? (
            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="p-12 text-center">
                <p className="text-slate-500">Nenhuma viagem encontrada</p>
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
                        <h3 className="text-xl font-bold text-slate-900">
                          {viagem.destino}
                        </h3>
                        <Badge className={`${statusConfig[viagem.status]?.color} border`}>
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
                        {viagem.valorEstimado && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>R$ {viagem.valorEstimado.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* ESTA É A NOVA PARTE - O BOTÃO DE EDITAR */}
                    <Link to={`/app/viagens/editar/${viagem.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    </Link>
                  </div>
                  {viagem.tipoTransporte && (
                    <div className="flex gap-2 pt-4 border-t border-slate-100">
                      {/* ... restante do código ... */}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}