// src/pages/NovaViagem.jsx
import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import FormularioViagem from "../components/nova-viagem/FormularioViagem";
import { api } from "@/api/apiClient"; // A nossa API que acabámos de atualizar

export default function NovaViagem() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // O useMutation é a ferramenta do React Query para enviar dados (criar, atualizar, deletar)
  const criarViagemMutation = useMutation({
    mutationFn: api.createViagem, // A função que ele vai chamar é a nossa api.createViagem
    onSuccess: () => {
      // Quando a viagem for criada com sucesso:
      // 1. Invalida os dados antigos de viagens. Isso força o Dashboard a buscar os dados novamente.
      queryClient.invalidateQueries({ queryKey: ['viagens'] });
      // 2. Navega o usuário de volta para o dashboard.
      navigate('/app/Dashboard');
    },
    onError: (error) => {
      // Se der erro, mostra um alerta.
      console.error("Erro ao criar viagem:", error);
      alert("Não foi possível criar a viagem. Verifique o console para mais detalhes.");
    }
  });

  // Esta função será chamada quando o formulário for submetido
  const handleCriarViagem = async (dadosDoFormulario) => {
    // O .mutate() executa a função definida em `mutationFn`
    criarViagemMutation.mutate(dadosDoFormulario);
  };

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Nova Solicitação de Viagem</h1>
            <p className="text-slate-600">Preencha os dados básicos para criar sua solicitação.</p>
          </div>
        </div>

        {/* Formulário */}
        <FormularioViagem 
          onSubmit={handleCriarViagem}
          carregando={criarViagemMutation.isPending}
          // O `perfilColaborador` pode ser adicionado depois, buscando os dados da API
        />
      </div>
    </div>
  );
}