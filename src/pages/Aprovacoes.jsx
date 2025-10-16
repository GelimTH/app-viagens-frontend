// src/pages/Aprovacoes.jsx
import React from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardCheck, User, Calendar, MapPin, Check, X, Loader2, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { statusConfig, formatarMoeda } from "@/lib/utils";


// Componente para um Card de Aprovação de Viagem
function ViagemCard({ viagem, onAction, isLoading }) {
  return (
    <Card className="border-0 shadow-xl bg-white hover:shadow-2xl transition-shadow">
      <CardHeader className="border-b border-slate-100 flex flex-row justify-between items-center">
         <CardTitle className="text-lg font-bold text-slate-800">Viagem para {viagem.destino}</CardTitle>
         <Badge variant={statusConfig[viagem.status]?.variant || 'default'} className="border">{statusConfig[viagem.status]?.label}</Badge>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4 mb-6">
          <InfoItem icon={MapPin} label="Trajeto" value={`${viagem.origem} → ${viagem.destino}`} />
          <InfoItem icon={Calendar} label="Período" value={`${format(new Date(viagem.dataIda), "dd MMM yyyy", { locale: ptBR })} a ${format(new Date(viagem.dataVolta), "dd MMM yyyy", { locale: ptBR })}`} />
          <InfoItem icon={User} label="Colaborador" value="João Colaborador" />
        </div>
        <ActionButtons onReprove={() => onAction(viagem.id, 'reprovado')} onApprove={() => onAction(viagem.id, 'aprovado')} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
}

// Componente para um Card de Aprovação de Despesa
function DespesaCard({ despesa, onAction, isLoading }) {
  return (
    <Card className="border-0 shadow-xl bg-white hover:shadow-2xl transition-shadow">
      <CardHeader className="border-b border-slate-100 flex flex-row justify-between items-center">
         <CardTitle className="text-lg font-bold text-slate-800 capitalize">{despesa.tipo} - {formatarMoeda(despesa.valor)}</CardTitle>
         <Badge variant={statusConfig[despesa.status]?.variant || 'default'} className="border">{statusConfig[despesa.status]?.label}</Badge>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4 mb-6">
            <InfoItem icon={MapPin} label="Referente à Viagem" value={despesa.viagem.destino} />
            <InfoItem icon={Calendar} label="Data da Despesa" value={format(new Date(despesa.data), "dd/MM/yyyy", { locale: ptBR })} />
            {despesa.descricao && <InfoItem icon={FileText} label="Descrição" value={despesa.descricao} />}
        </div>
        <ActionButtons onReprove={() => onAction(despesa.id, 'reprovado')} onApprove={() => onAction(despesa.id, 'aprovado')} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
}

// Componentes auxiliares
const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 text-slate-400 mt-1 flex-shrink-0" />
        <div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="font-semibold text-slate-700">{value}</p>
        </div>
    </div>
);

const ActionButtons = ({ onReprove, onApprove, isLoading }) => (
    <div className="flex gap-3">
        <Button onClick={onReprove} variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="w-4 h-4 mr-2" />}
            Reprovar
        </Button>
        <Button onClick={onApprove} className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
            Aprovar
        </Button>
    </div>
);


export default function Aprovacoes() {
  const queryClient = useQueryClient();

  const { data: viagens = [] } = useQuery({ queryKey: ['viagens'], queryFn: api.getViagens });
  const viagensPendentes = viagens.filter(v => v.status === 'em_analise');

  const { data: despesasPendentes = [] } = useQuery({ queryKey: ['pendingDespesas'], queryFn: api.getPendingDespesas });

  const updateViagemStatus = useMutation({
    mutationFn: api.updateViagem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['viagens'] }),
  });

  const updateDespesaStatus = useMutation({
    mutationFn: api.updateDespesa,
    onSuccess: () => {
      // Invalida tanto a busca de despesas pendentes quanto a de viagens (para o dashboard)
      queryClient.invalidateQueries({ queryKey: ['pendingDespesas'] });
      queryClient.invalidateQueries({ queryKey: ['viagens'] });
    }
  });

  // --- CORREÇÃO AQUI ---
  // Criamos funções "empacotadoras" que montam o objeto antes de chamar a mutação
  const handleViagemAction = (id, status) => {
    updateViagemStatus.mutate({ id, status });
  };

  const handleDespesaAction = (id, status) => {
    updateDespesaStatus.mutate({ id, status });
  };

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
            <ClipboardCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Central de Aprovações</h1>
            <p className="text-slate-600">Analise e gerencie as solicitações pendentes</p>
          </div>
        </div>
        
        <Tabs defaultValue="viagens" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="viagens">
              Viagens Pendentes <Badge className="ml-2">{viagensPendentes.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="despesas">
              Despesas Pendentes <Badge className="ml-2">{despesasPendentes.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="viagens" className="mt-6">
            <div className="grid gap-4">
              {viagensPendentes.length > 0 ? (
                viagensPendentes.map((viagem) => (
                  // Passando a função correta
                  <ViagemCard key={viagem.id} viagem={viagem} onAction={handleViagemAction} isLoading={updateViagemStatus.isPending} />
                ))
              ) : (
                <p className="text-center text-slate-500 py-10">Nenhuma viagem pendente.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="despesas" className="mt-6">
            <div className="grid gap-4">
              {despesasPendentes.length > 0 ? (
                despesasPendentes.map((despesa) => (
                  // Passando a função correta
                  <DespesaCard key={despesa.id} despesa={despesa} onAction={handleDespesaAction} isLoading={updateDespesaStatus.isPending} />
                ))
              ) : (
                <p className="text-center text-slate-500 py-10">Nenhuma despesa pendente.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}