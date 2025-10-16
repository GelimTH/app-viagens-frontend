// src/components/prestacao/SelecionarViagem.jsx

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
// 1. Importe a configuração de status
import { statusConfig } from "@/lib/utils";

export default function SelecionarViagem({ viagens, onSelecionar }) {
  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-4">
        <CardTitle className="text-xl font-bold text-slate-900">
          Selecione uma Viagem
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {viagens.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Nenhuma viagem aprovada disponível</p>
          </div>
        ) : (
          <div className="space-y-3">
            {viagens.map((viagem) => (
              <button
                key={viagem.id}
                onClick={() => onSelecionar(viagem)}
                className="w-full p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 bg-slate-50 text-left"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-slate-900">{viagem.destino}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{viagem.origem}</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{viagem.motivo}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {format(new Date(viagem.dataIda), "dd MMM", { locale: ptBR })} - {format(new Date(viagem.dataVolta), "dd MMM yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                  {/* 2. MUDANÇA AQUI: Usando a prop `variant` para a badge */}
                  <Badge variant={statusConfig[viagem.status]?.variant || 'default'} className="border">
                    {statusConfig[viagem.status]?.label}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}