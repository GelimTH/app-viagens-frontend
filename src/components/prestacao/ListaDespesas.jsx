// src/components/prestacao/ListaDespesas.jsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatarMoeda, statusConfig } from "@/lib/utils";

const tipoLabels = {
  transporte: "Transporte",
  hospedagem: "Hospedagem",
  alimentacao: "Alimentação",
  combustivel: "Combustível",
  pedagio: "Pedágio",
  estacionamento: "Estacionamento",
  outros: "Outros"
};

export default function ListaDespesas({ despesas }) {
  const totalDespesas = despesas.reduce((sum, d) => sum + (d.valor || 0), 0);

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-slate-900">
            Despesas Registradas
          </CardTitle>
          <div className="text-right">
            <p className="text-sm text-slate-500">Total</p>
            <p className="text-2xl font-bold text-green-600">
              {formatarMoeda(totalDespesas)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {despesas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Nenhuma despesa registrada ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {despesas.map((despesa) => (
              <div
                key={despesa.id}
                className="p-4 rounded-xl border border-slate-200 hover:shadow-md transition-all bg-slate-50"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-slate-900">{tipoLabels[despesa.tipo]}</p>
                    <p className="text-sm text-slate-600">{despesa.descricao}</p>
                  </div>
                  {/* 3. MUDANÇA AQUI: Usando a prop `variant` */}
                  <Badge variant={statusConfig[despesa.status]?.variant || 'default'} className="border">
                    {statusConfig[despesa.status]?.label}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex gap-4 text-sm text-slate-500">
                    <span>{format(new Date(despesa.data), "dd/MM/yyyy", { locale: ptBR })}</span>
                    <span className="font-bold text-green-600">
                      {formatarMoeda(despesa.valor)}
                    </span>
                  </div>
                  {despesa.notaFiscalUrl && (
                    <a
                      href={despesa.notaFiscalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}