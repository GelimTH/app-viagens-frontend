import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AlertCircle, FileText, Clock, ArrowRight } from "lucide-react";

export default function PendenciasCard({ despesasPendentes, viagensEmAnalise }) {
  const hasPendencias = despesasPendentes > 0 || viagensEmAnalise > 0;

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-red-50">
      <CardHeader className="border-b border-orange-100 pb-4">
        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          Pendências
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {!hasPendencias ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <FileText className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-slate-600 font-medium">Tudo em dia! 🎉</p>
            <p className="text-sm text-slate-500 mt-1">Sem pendências no momento</p>
          </div>
        ) : (
          <div className="space-y-4">
            {viagensEmAnalise > 0 && (
              <div className="bg-white rounded-xl p-4 border border-orange-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Viagens em Análise</p>
                    <p className="text-2xl font-bold text-orange-600">{viagensEmAnalise}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-3">Aguardando aprovação</p>
                <Link to="/app/aprovacoes">
                  <Button variant="outline" className="w-full border-orange-200 hover:bg-orange-50" size="sm">
                    Ver Detalhes
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}

            {despesasPendentes > 0 && (
              <div className="bg-white rounded-xl p-4 border border-red-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Despesas Pendentes</p>
                    <p className="text-2xl font-bold text-red-600">{despesasPendentes}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-3">Prestação de contas incompleta</p>
                <Link to={createPageUrl("PrestacaoContas")}>
                  <Button variant="outline" className="w-full border-red-200 hover:bg-red-50" size="sm">
                    Completar Agora
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}