import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, MapPin, User, MessageCircle, Megaphone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TimelineItem from '@/components/minha-viagem/TimelineItem'; // Certifique-se que este existe

// --- COMPONENTE INTERNO: RESUMO VIAGEM (Com botão WhatsApp corrigido) ---
function ResumoViagem({ viagem, gestor }) {
  // Lógica do Telefone (Real ou Fake para Sprint)
  const telefoneReal = gestor?.profile?.telefone;
  const telefoneParaLink = telefoneReal || "11999999999"; 
  const whatsappLink = `https://wa.me/55${telefoneParaLink.replace(/\D/g, '')}`;

  return (
    <Card className="border-0 shadow-md bg-white h-full">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-slate-800">
          Detalhes da Missão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Datas */}
        <div className="flex items-start gap-3">
          <div className="bg-blue-50 p-2 rounded-lg text-blue-600 mt-1">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Período</p>
            <p className="text-slate-800 font-semibold">
              {viagem?.dataIda && format(new Date(viagem.dataIda), "dd 'de' MMM", { locale: ptBR })} 
              {' até '}
              {viagem?.dataVolta && format(new Date(viagem.dataVolta), "dd 'de' MMM", { locale: ptBR })}
            </p>
          </div>
        </div>

        {/* Destino */}
        <div className="flex items-start gap-3">
          <div className="bg-purple-50 p-2 rounded-lg text-purple-600 mt-1">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Destino</p>
            <p className="text-slate-800 font-semibold">{viagem?.destino}</p>
          </div>
        </div>

        <div className="border-t border-slate-100 my-4"></div>

        {/* Organizador e Botão WhatsApp */}
        <div className="flex items-start gap-3">
          <div className="bg-slate-100 p-2 rounded-full text-slate-600 mt-1">
            <User className="w-5 h-5" />
          </div>
          <div className="w-full">
            <p className="text-sm font-medium text-slate-500">Organizada por:</p>
            <p className="text-slate-800 font-bold text-sm md:text-base">
              {gestor?.fullName || 'Equipe Administrativa'}
            </p>
            
            {/* Botão de WhatsApp Integrado */}
            <a 
              href={whatsappLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-3 block w-full"
            >
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 flex items-center justify-center gap-2 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                Conversar com Gestor
              </Button>
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- PÁGINA PRINCIPAL: VISÃO GERAL ---
export default function VisaoGeralPage() {
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
              timeline.map((evento, index) => (
                <TimelineItem
                  key={evento.id}
                  evento={evento}
                  isPrimeiro={index === 0}
                  isUltimo={index === timeline.length - 1}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Coluna da Direita: Resumo e Comunicados */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Usando o componente interno definido acima */}
        <ResumoViagem viagem={viagem} gestor={gestor} />

        {/* Card de Comunicados */}
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