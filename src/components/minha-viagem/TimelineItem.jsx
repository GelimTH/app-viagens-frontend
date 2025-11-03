// src/components/minha-viagem/TimelineItem.jsx
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plane, Hotel, Briefcase, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mapeamento de ícones (pode ser melhorado)
const tipoIcones = {
  'voo': <Plane className="w-5 h-5 text-white" />,
  'hotel': <Hotel className="w-5 h-5 text-white" />,
  'reuniao': <Briefcase className="w-5 h-5 text-white" />,
  'transfer': <MapPin className="w-5 h-5 text-white" />,
  'default': <Clock className="w-5 h-5 text-white" />,
};

// Mapeamento de cores (pode ser melhorado)
const tipoCores = {
  'voo': 'bg-blue-600',
  'hotel': 'bg-purple-600',
  'reuniao': 'bg-green-600',
  'transfer': 'bg-orange-600',
  'default': 'bg-slate-600',
};

export default function TimelineItem({ evento, isPrimeiro, isUltimo, onAddDespesa }) {
  const Icone = tipoIcones[evento.tipo] || tipoIcones['default'];
  const Cor = tipoCores[evento.tipo] || tipoCores['default'];

  const horaInicio = format(new Date(evento.dataHoraInicio), 'HH:mm', { locale: ptBR });

  return (
    <div className="relative flex items-start gap-4">
      {/* A Linha do Tempo (Vertical) */}
      <div className="absolute left-5 top-5 -bottom-5 w-0.5 bg-slate-200">
        {/* Oculta a linha antes do primeiro e depois do último item */}
        {isPrimeiro && <div className="absolute -top-5 left-0 h-5 w-0.5 bg-slate-50" />}
        {isUltimo && <div className="absolute -bottom-5 left-0 h-5 w-0.5 bg-slate-50" />}
      </div>

      {/* O Ícone */}
      <div className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${Cor}`}>
        {Icone}
      </div>

      {/* O Conteúdo */}
      <div className="flex-1 pt-1.5">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-slate-900">
            {evento.titulo}
          </p>
          <span className="text-sm font-medium text-slate-600">
            {horaInicio}
          </span>
        </div>
        {evento.local && (
          <p className="mt-0.5 text-sm text-slate-500 flex items-center gap-1.5">
            <MapPin className="w-3 h-3" /> {evento.local}
          </p>
        )}
        {evento.descricao && (
          <p className="mt-2 text-sm text-slate-600">
            {evento.descricao}
          </p>
        )}

        {/* Botão "Anexar Nota" adicionado */}
        <div className="mt-3 pt-3 border-t border-slate-200">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full sm:w-auto"
            onClick={() => onAddDespesa(evento.id)}
          >
            <Paperclip className="w-4 h-4 mr-2" />
            Anexar Nota/Despesa
          </Button>
        </div>

      </div>
    </div>
  );
}