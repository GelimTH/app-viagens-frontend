// src/components/dashboard/ProximasViagens.jsx

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { statusConfig } from "@/lib/utils";

export default function ProximasViagens({ viagens }) {
  // DEBUG 1: Ver o que o componente recebeu
  console.log('[ProximasViagens] Propriedade recebida:', viagens);

  const proximasViagens = viagens
    .filter(v => new Date(v.dataIda) >= new Date() || v.status === 'em_analise') // CORRIGIDO AQUI
    .slice(0, 5);

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-4">
        <CardTitle className="text-xl font-bold text-slate-900">
          Próximas Viagens
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {proximasViagens.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Nenhuma viagem agendada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {proximasViagens.map((viagem) => {
              // DEBUG 2: Ver o valor e o tipo exato da data antes de formatar
              console.log('[ProximasViagens] Tentando formatar dataIda:', viagem.dataIda, 'Tipo:', typeof viagem.dataIda);

              return (
                <div
                  key={viagem.id}
                  className="p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 bg-slate-50"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="font-bold text-slate-900">{viagem.destino}</span>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">{viagem.origem || "Origem"}</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{viagem.motivo}</p>
                    </div>
                    <Badge variant={statusConfig[viagem.status].variant} className="border">
                      {statusConfig[viagem.status].label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {format(new Date(viagem.dataIda), "dd MMM", { locale: ptBR })} - {format(new Date(viagem.dataVolta), "dd MMM yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}