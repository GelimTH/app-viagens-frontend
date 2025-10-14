import React from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Plane,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Calendar,
  MapPin
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import StatsCard from "../components/dashboard/StatsCard";
import ProximasViagens from "../components/dashboard/ProximasViagens";
import PendenciasCard from "../components/dashboard/PendenciasCard";


export default function Dashboard() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    // Mude para a função que busca o usuário
    queryFn: api.getCurrentUser
  });

  const { data: viagens = [] } = useQuery({
    queryKey: ['viagens'],
    queryFn: api.getViagens, 
    initialData: [],
  });

  // ADICIONE ESTA LINHA AQUI!
  console.log('Dados de viagens recebidos:', viagens);

const { data: despesas = [] } = useQuery({
    queryKey: ['despesas'],
    // Esta rota ainda não existe, então vamos mockar por enquanto
    queryFn: () => Promise.resolve([]), 
    initialData: [],
  });

  const viagensEmAnalise = viagens.filter(v => v.status === 'em_analise').length;
  const viagensAprovadas = viagens.filter(v => v.status === 'aprovado').length;
  const despesasPendentes = despesas.filter(d => d.status === 'pendente').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Olá, {user?.full_name?.split(' ')[0] || 'Colaborador'} 👋
            </h1>
            <p className="text-slate-600">Aqui está um resumo das suas viagens</p>
          </div>
          <Link to={createPageUrl("NovaViagem")}>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 text-white">
              <Plus className="w-5 h-5 mr-2" />
              Nova Viagem
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total de Viagens"
            value={viagens.length}
            icon={Plane}
            color="blue"
            trend="+12% este mês"
          />
          <StatsCard
            title="Em Análise"
            value={viagensEmAnalise}
            icon={Clock}
            color="orange"
          />
          <StatsCard
            title="Aprovadas"
            value={viagensAprovadas}
            icon={CheckCircle}
            color="green"
            trend="92% aprovação"
          />
          <StatsCard
            title="Despesas Pendentes"
            value={despesasPendentes}
            icon={AlertCircle}
            color="red"
          />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ProximasViagens viagens={viagens} />
          </div>
          <div>
            <PendenciasCard
              despesasPendentes={despesasPendentes}
              viagensEmAnalise={viagensEmAnalise}
            />
          </div>
        </div>
      </div>
    </div>
  );
}