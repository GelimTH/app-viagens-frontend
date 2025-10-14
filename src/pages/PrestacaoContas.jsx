import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Camera } from "lucide-react";

import SelecionarViagem from "../components/prestacao/SelecionarViagem";
import UploadNota from "../components/prestacao/UploadNota";
import ListaDespesas from "../components/prestacao/ListaDespesas";

export default function PrestacaoContas() {
  const [viagemSelecionada, setViagemSelecionada] = useState(null);
  const [mostrarUpload, setMostrarUpload] = useState(false);

  const { data: viagens = [] } = useQuery({
    queryKey: ['viagens'],
    queryFn: () => api.entities.Viagem.filter({ status: 'aprovado' }, '-data_ida'),
    initialData: [],
  });

  const { data: despesas = [] } = useQuery({
    queryKey: ['despesas', viagemSelecionada?.id],
    queryFn: () => api.entities.Despesa.filter({ viagem_id: viagemSelecionada.id }),
    enabled: !!viagemSelecionada,
    initialData: [],
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

        {/* Selecionar Viagem */}
        {!viagemSelecionada && (
          <SelecionarViagem 
            viagens={viagens}
            onSelecionar={setViagemSelecionada}
          />
        )}

        {/* Upload e Lista */}
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
                <Button
                  variant="outline"
                  onClick={() => setViagemSelecionada(null)}
                >
                  Trocar Viagem
                </Button>
                <Button
                  onClick={() => setMostrarUpload(true)}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-200 text-white"
                >
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

            <ListaDespesas despesas={despesas} />
          </>
        )}
      </div>
    </div>
  );
}