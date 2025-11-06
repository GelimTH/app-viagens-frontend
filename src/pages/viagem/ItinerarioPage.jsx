import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TimelineItem from '../../components/minha-viagem/TimelineItem';
import { Loader2 } from 'lucide-react';

export default function ItinerarioViagemPage() {
  const { dadosViagem } = useOutletContext();

  if (!dadosViagem) return <Loader2 className="w-5 h-5 animate-spin" />;

  const timeline = dadosViagem.viagem.eventos || [];

  return (
    <Card className="border-0 shadow-xl bg-white max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Itinerário Completo da Viagem</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {!timeline || timeline.length === 0 ? (
          <p className="text-slate-500 text-center py-4">
            Nenhum evento de itinerário cadastrado.
          </p>
        ) : (
          timeline.map((evento, index) => (
            <TimelineItem
              key={evento.id}
              evento={evento}
              isPrimeiro={index === 0}
              isUltimo={index === timeline.length - 1}
              onAddDespesa={() => {}} // TODO: Ligar o modal de despesa
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}