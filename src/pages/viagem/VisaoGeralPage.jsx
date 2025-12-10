import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Phone, Calendar, Megaphone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TimelineItem from '../../components/minha-viagem/TimelineItem';

// Card de Resumo (o mesmo da última vez)
function ResumoViagem({ viagem, gestor }) {
  const gestorTelefone = gestor?.profile?.telefone;
  const whatsappLink = gestorTelefone ? `https://wa.me/55${gestorTelefone.replace(/\D/g, '')}` : null;

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-4">
        <CardTitle className="text-xl font-bold text-slate-900">
          Sua Viagem para {viagem.destino}
        </CardTitle>
        <p className="text-sm text-slate-500">
          Organizada por: {gestor?.fullName || 'Gestor'}
        </p>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-700">
          <Calendar className="w-4 h-4" />
          <span className="font-medium">
            {format(new Date(viagem.dataIda), "dd MMM, yyyy", { locale: ptBR })}
          </span>
          <span className="text-slate-400">até</span>
          <span className="font-medium">
            {format(new Date(viagem.dataVolta), "dd MMM, yyyy", { locale: ptBR })}
          </span>
        </div>
        {whatsappLink && (
          <Button asChild variant="outline" className="w-full">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <Phone className="w-4 h-4 mr-2" />
              Falar com o Gestor
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Card de Comunicados (pegando só 3)
function ComunicadosCard({ comunicados }) {
  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-blue-600" />
          Últimos Comunicados
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {!comunicados || comunicados.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            Nenhum comunicado recente.
          </p>
        ) : (
          comunicados.slice(0, 3).map(com => ( // Pega só os 3 primeiros
            <div key={com.id} className="border-b pb-3 last:border-b-0">
              <h4 className="font-semibold text-slate-800">{com.titulo}</h4>
              <p className="text-sm text-slate-600 mt-1">{com.conteudo}</p>
              <p className="text-xs text-slate-400 mt-2">
                {formatDistanceToNow(new Date(com.createdAt), { locale: ptBR, addSuffix: true })}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// Página de Visão Geral (Layout de 2 colunas)
export default function VisaoGeralViagemPage() {
  // Pega os dados do Layout Pai
  const { dadosViagem } = useOutletContext();

  if (!dadosViagem) return <Loader2 className="w-5 h-5 animate-spin" />;

  const { viagem, gestor } = dadosViagem;
  const timeline = viagem.eventos || [];
  const comunicados = viagem.comunicados || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle>Linha do Tempo (Resumo)</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {!timeline || timeline.length === 0 ? (
              <p className="text-slate-500 text-center py-4">
                Nenhum evento de itinerário cadastrado.
              </p>
            ) : (
              timeline.slice(0, 3).map((evento, index) => ( // Pega só os 3 primeiros
                <TimelineItem
                  key={evento.id}
                  evento={evento}
                  isPrimeiro={index === 0}
                  isUltimo={index === timeline.length - 1}
                  onAddDespesa={() => {}} // Não funcional nesta view
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-1 space-y-6">
        <ResumoViagem viagem={viagem} gestor={gestor} />
        <ComunicadosCard comunicados={comunicados} />
      </div>
    </div>
  );
}