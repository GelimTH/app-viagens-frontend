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