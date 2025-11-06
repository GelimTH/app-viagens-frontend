import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Megaphone } from 'lucide-react';
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ComunicadosViagemPage() {
  const { dadosViagem } = useOutletContext();

  if (!dadosViagem) return <Loader2 className="w-5 h-5 animate-spin" />;

  const comunicados = dadosViagem.viagem.comunicados || [];

  return (
    <Card className="border-0 shadow-xl bg-white max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-blue-600" />
          Mural de Comunicados
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {!comunicados || comunicados.length === 0 ? (
          <p className="text-slate-500 text-center py-4">
            Nenhum comunicado publicado para esta viagem.
          </p>
        ) : (
          comunicados.map(com => (
            <div key={com.id} className="border-b pb-4 last:border-b-0">
              <h4 className="font-semibold text-lg text-slate-900">{com.titulo}</h4>
              <p className="text-sm text-slate-500 mb-2">
                Postado {formatDistanceToNow(new Date(com.createdAt), { locale: ptBR, addSuffix: true })}
              </p>
              <p className="text-slate-700 whitespace-pre-wrap">{com.conteudo}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}