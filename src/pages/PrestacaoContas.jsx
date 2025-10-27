// src/pages/PrestacaoContas.jsx
import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

import SelecionarViagem from "../components/prestacao/SelecionarViagem";
import UploadNota from "../components/prestacao/UploadNota";
import ListaDespesas from "../components/prestacao/ListaDespesas";

export default function PrestacaoContas() {
  const [viagemSelecionada, setViagemSelecionada] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const queryClient = useQueryClient();

  const { data: todasAsViagens = [] } = useQuery({
    queryKey: ['viagens'],
    queryFn: api.getViagens,
  });
  const viagensAprovadas = todasAsViagens.filter(v => v.status === 'aprovado');

  const { data: despesas = [], isLoading: isLoadingDespesas } = useQuery({
    queryKey: ['despesas', viagemSelecionada?.id],
    queryFn: () => api.getDespesas(viagemSelecionada.id),
    enabled: !!viagemSelecionada,
  });

  const createDespesaMutation = useMutation({
    mutationFn: api.createDespesa,
    onSuccess: () => {
      // ESTA É A LINHA MÁGICA:
      // Avisa ao React Query para recarregar a lista de despesas
      queryClient.invalidateQueries({ queryKey: ['despesas', viagemSelecionada.id] });
      setMostrarFormulario(false); // Fecha o formulário
    },
    onError: (err) => {
      console.error("Erro ao criar despesa:", err);
      alert("Erro ao salvar despesa. Verifique os dados.");
    }
  });

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Prestação de Contas</h1>
            <p className="text-slate-600">Registre suas despesas de viagem</p>
          </div>
        </div>

        {!viagemSelecionada && (
          <SelecionarViagem
            viagens={viagensAprovadas}
            onSelecionar={setViagemSelecionada}
          />
        )}

        {viagemSelecionada && (
          <>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Viagem: {viagemSelecionada.destino}</h2>
                <p className="text-slate-600">{despesas.length} despesa(s) registrada(s)</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setViagemSelecionada(null); setMostrarFormulario(false); }}>
                  Trocar Viagem
                </Button>
                <Button onClick={() => setMostrarFormulario(true)} className="bg-gradient-to-r from-green-600 to-green-700">
                  <Camera className="w-4 h-4 mr-2" />
                  Nova Despesa
                </Button>
              </div>
            </div>

            {mostrarFormulario && (
              // 4. ATUALIZE AS PROPS ENVIADAS PARA O UPLOADNOTA
              <UploadNota
                viagemId={viagemSelecionada.id}
                onSalvar={createDespesaMutation.mutateAsync} // Passa a função de mutação
                carregando={createDespesaMutation.isPending} // Passa o estado de loading
                onCancelar={() => setMostrarFormulario(false)}
                onSucesso={() => { /* A mutação agora controla o sucesso */ }}
                isEditMode={false}
              />
            )}

            {isLoadingDespesas ? <p>Carregando despesas...</p> : <ListaDespesas despesas={despesas} />}
          </>
        )}
      </div>
    </div>
  );
}