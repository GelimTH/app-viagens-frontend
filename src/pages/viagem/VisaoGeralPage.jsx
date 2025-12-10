// src/pages/minha-viagem/VisaoGeralPage.jsx
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Megaphone } from 'lucide-react';
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

// Importa os componentes filhos
// (Certifique-se que o caminho está correto conforme seu projeto)
import TimelineItem from '@/components/minha-viagem/TimelineItem'; 
import ResumoViagem from '@/components/minha-viagem/ResumoViagem'; // <--- O componente novo com botão corrigido

export default function VisaoGeralPage() {
  // Pega os dados vindos do Layout Pai (MinhaViagemLayout)
  const { dadosViagem } = useOutletContext();

  if (!dadosViagem) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const { viagem, gestor } = dadosViagem;
  const timeline = viagem.eventos || [];
  const comunicados = viagem.comunicados || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      
      {/* Coluna da Esquerda: Timeline */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-0 shadow-md bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">
              Linha do Tempo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {!timeline || timeline.length === 0 ? (
              <p className="text-slate-500 text-center py-8 bg-slate-50 rounded-lg border border-dashed">
                Nenhum evento de itinerário cadastrado ainda.
              </p>
            ) : (
              // Mostra apenas os próximos 3 eventos ou todos, conforme sua preferência
              timeline.map((evento, index) => (
                <TimelineItem
                  key={evento.id}
                  evento={evento}
                  isPrimeiro={index === 0}
                  isUltimo={index === timeline.length - 1}
                  // onAddDespesa={() => {}} // Descomente se precisar da ação
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Coluna da Direita: Resumo e Comunicados */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Componente que tem o Botão do WhatsApp Corrigido */}
        <ResumoViagem viagem={viagem} gestor={gestor} />

        {/* Card de Comunicados (Recriado aqui caso você não tenha o arquivo separado) */}
        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-500" />
              Últimos Avisos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {comunicados.length === 0 ? (
              <p className="text-sm text-slate-400 italic">Nenhum comunicado recente.</p>
            ) : (
              comunicados.slice(0, 3).map((com) => (
                <div key={com.id} className="bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                  <h4 className="text-sm font-semibold text-slate-800">{com.titulo}</h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-3">{com.conteudo}</p>
                  <p className="text-[10px] text-slate-400 mt-2 text-right">
                    {formatDistanceToNow(new Date(com.createdAt), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}