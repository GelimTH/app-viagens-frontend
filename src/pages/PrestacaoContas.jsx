// src/pages/PrestacaoContas.jsx
import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { FileText, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

import SelecionarViagem from "../components/prestacao/SelecionarViagem";
import UploadNota from "../components/prestacao/UploadNota";
import ListaDespesas from "../components/prestacao/ListaDespesas";

export default function PrestacaoContas() {
  const [viagemSelecionada, setViagemSelecionada] = useState(null);
  const [mostrarUpload, setMostrarUpload] = useState(false);

  // Busca as viagens aprovadas para a lista de seleção
  const { data: todasAsViagens = [] } = useQuery({
    queryKey: ['viagens'],
    queryFn: api.getViagens,
  });
  const viagensAprovadas = todasAsViagens.filter(v => v.status === 'aprovado');

  // CORREÇÃO AQUI: Agora estamos buscando as despesas da viagem selecionada
  const { data: despesas = [] } = useQuery({
    queryKey: ['despesas', viagemSelecionada?.id],
    queryFn: () => api.getDespesas(viagemSelecionada.id), // Usando a nova função
    // `enabled` garante que a busca só aconteça QUANDO uma viagem for selecionada
    enabled: !!viagemSelecionada,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
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
                <h2 className="text-xl font-bold text-slate-900">
                  Viagem: {viagemSelecionada.destino}
                </h2>
                <p className="text-slate-600">
                  {despesas.length} despesa(s) registrada(s)
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setViagemSelecionada(null); setMostrarUpload(false); }}>
                  Trocar Viagem
                </Button>
                <Button onClick={() => setMostrarUpload(true)} >
                  <Camera className="w-4 h-4 mr-2" />
                  Nova Despesa
                </Button>
              </div>
            </div>

            {mostrarUpload && (
              <UploadNota
                viagemId={viagemSelecionada.id}
                onCancelar={() => setMostrarUpload(false)}
                onSucesso={() => setMostrarUpload(false)}
              />
            )}
            
            {/* Agora este componente receberá a lista de despesas correta */}
            <ListaDespesas despesas={despesas} />
          </>
        )}
      </div>
    </div>
  );
}