// src/pages/EditarViagem.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Map, Users } from 'lucide-react';

// Importação dos componentes internos
import FormularioViagem from '@/components/viagem/FormularioViagem';
import ListaParticipantes from '@/components/viagem/ListaParticipantes'; // Componente criado no passo anterior

export default function EditarViagem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Busca os dados da viagem
  const { data: viagem, isLoading } = useQuery({
    queryKey: ['viagem', id],
    queryFn: () => api.getViagem(id),
  });

  // Mutation para atualizar a viagem (usada pelo formulário)
  const updateMutation = useMutation({
    mutationFn: (dadosAtualizados) => api.updateViagem(id, dadosAtualizados),
    onSuccess: () => {
      queryClient.invalidateQueries(['viagem', id]);
      queryClient.invalidateQueries(['viagens']);
      alert('Viagem atualizada com sucesso!');
    },
    onError: (error) => {
      console.error("Erro ao atualizar:", error);
      alert('Erro ao atualizar viagem.');
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center h-screen items-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!viagem) {
    return <div className="text-center py-10">Viagem não encontrada.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Cabeçalho */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/app/dashboard')}
            className="hover:bg-white"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Map className="w-6 h-6 text-blue-600" />
              Editar Missão
            </h1>
            <p className="text-slate-500 text-sm">
              Gerencie os detalhes e participantes de "{viagem.destino}"
            </p>
          </div>
        </div>

        {/* Sistema de Abas */}
        <Tabs defaultValue="detalhes" className="w-full">
          <TabsList className="bg-white border border-slate-200 p-1 mb-6">
            <TabsTrigger 
              value="detalhes"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <Map className="w-4 h-4 mr-2" />
              Detalhes da Missão
            </TabsTrigger>
            <TabsTrigger 
              value="participantes"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <Users className="w-4 h-4 mr-2" />
              Gestão de Participantes
            </TabsTrigger>
          </TabsList>

          {/* Conteúdo: Detalhes (Formulário) */}
          <TabsContent value="detalhes">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle>Informações Principais</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <FormularioViagem 
                  initialData={viagem}
                  onSubmit={(dados) => updateMutation.mutate(dados)}
                  isLoading={updateMutation.isPending}
                  botaoTexto="Salvar Alterações"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conteúdo: Participantes (Nova Lista) */}
          <TabsContent value="participantes">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Participantes Confirmados</CardTitle>
                  <p className="text-sm text-slate-500 mt-1">
                    Visualize contratos assinados e dados médicos.
                  </p>
                </div>
                <div className="hidden sm:block">
                  <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                    Total: {viagem._count?.convites || 0} Convites
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-6 bg-slate-50/50 min-h-[400px]">
                {/* Aqui entra o componente que criamos no passo D */}
                <ListaParticipantes viagemId={id} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}