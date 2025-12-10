// src/components/minha-viagem/ResumoViagem.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, User, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ResumoViagem({ viagem, gestor }) {
  
  // Lógica do Telefone (Real ou Fake para Sprint)
  // Garante que se não tiver telefone, usa o fake para o botão aparecer
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