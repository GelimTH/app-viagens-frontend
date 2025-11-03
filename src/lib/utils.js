import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const statusConfig = {
  em_analise: { label: "Em Análise", variant: "warning" },
  aprovado: { label: "Aprovado", variant: "success" },
  reprovado: { label: "Reprovado", variant: "destructive" },
  pendente: { label: "Pendente", variant: "warning" }
};

export const formatarMoeda = (valor) => {
  if (typeof valor !== 'number') {
    return 'R$ 0,00';
  }
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Formata a data para o padrão UTC do iCalendar (ex: 20251110T143000Z)
const formatICSDate = (dateStr) => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

export const downloadICS = (evento) => {
  const icsData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Sebrae//Embarque Coracao Azul//PT',
    'BEGIN:VEVENT',
    `UID:${evento.id}@embarquecoracao.sebrae.com.br`,
    `DTSTAMP:${formatICSDate(new Date().toISOString())}`,
    `DTSTART:${formatICSDate(evento.dataHoraInicio)}`,
    // Se não tiver data fim, assume 1 hora de duração
    `DTEND:${formatICSDate(evento.dataHoraFim || new Date(new Date(evento.dataHoraInicio).getTime() + 60 * 60 * 1000))}`,
    `SUMMARY:${evento.titulo || 'Evento de Viagem'}`,
    `DESCRIPTION:${evento.descricao || ''}`,
    `LOCATION:${evento.local || ''}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${evento.titulo.replace(/ /g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};