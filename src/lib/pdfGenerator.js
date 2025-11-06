import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // <-- CORREÇÃO #1 (import nomeado)
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formatarMoeda = (valor) => (valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const addWrappedText = (doc, text, x, y, maxWidth) => {
  const lines = doc.splitTextToSize(text || '', maxWidth);
  doc.text(lines, x, y);
  return y + (doc.getTextDimensions(lines).h);
};

export const gerarPDFExecutivo = (dadosViagem, sugestoes) => {
  if (!dadosViagem || !sugestoes) {
    console.error("Dados da viagem ou sugestões ausentes para o PDF.");
    return;
  }
  
  const doc = new jsPDF();
  let cursorY = 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(`Briefing Executivo: Missão ${dadosViagem.destino}`, 14, cursorY);
  cursorY += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Período: ${format(new Date(dadosViagem.data_ida), "dd/MM/yyyy", { locale: ptBR })} a ${format(new Date(dadosViagem.data_volta), "dd/MM/yyyy", { locale: ptBR })}`, 14, cursorY);
  cursorY += 7;
  doc.text(`Origem: ${dadosViagem.origem}`, 14, cursorY);
  cursorY += 7;
  doc.text(`Motivo: ${dadosViagem.motivo}`, 14, cursorY);
  cursorY += 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Custo Total Estimado (Opções Recomendadas):', 14, cursorY);
  doc.setFontSize(16);
  doc.setTextColor(34, 139, 34);
  doc.text(formatarMoeda(sugestoes.valor_estimado), 14, cursorY + 8);
  doc.setTextColor(0, 0, 0);
  cursorY += 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Justificativa e Racional da IA:', 14, cursorY);
  cursorY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  cursorY = addWrappedText(doc, sugestoes.justificativa, 14, cursorY, 180);
  cursorY += 10;

  if (sugestoes.voosSugeridos && sugestoes.voosSugeridos.length > 0) {
    doc.setFontSize(12);
    doc.text('Opções de Transporte (Voo)', 14, cursorY);
    cursorY += 7;
    autoTable(doc, { // <-- CORREÇÃO #2 (chamada da função)
      startY: cursorY,
      head: [['Companhia', 'Horário', 'Status', 'Valor']],
      body: sugestoes.voosSugeridos.map(voo => [
        voo.compania,
        voo.horario,
        voo.maisBarato ? 'Recomendado' : '-',
        formatarMoeda(voo.valor)
      ]),
      theme: 'grid',
      headStyles: { fillColor: [22, 160, 133] }
    });
    cursorY = doc.previousAutoTable.finalY + 10;
  }
  
  if (sugestoes.hoteisSugeridos && sugestoes.hoteisSugeridos.length > 0) {
    doc.setFontSize(12);
    doc.text('Opções de Hospedagem', 14, cursorY);
    cursorY += 7;
    autoTable(doc, { // <-- CORREÇÃO #3 (chamada da função)
      startY: cursorY,
      head: [['Hotel', 'Estrelas', 'Status', 'Valor']],
      body: sugestoes.hoteisSugeridos.map(hotel => [
        hotel.nome,
        `${hotel.estrelas} estrelas`,
        hotel.maisBarato ? 'Recomendado' : '-',
        formatarMoeda(hotel.valor)
      ]),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });
    cursorY = doc.previousAutoTable.finalY + 10;
  }

  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(8);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Relatório gerado pelo Embarque Coração Azul em ${format(new Date(), "dd/MM/yyyy HH:mm")}`,
      14,
      doc.internal.pageSize.height - 10
    );
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.width - 35,
      doc.internal.pageSize.height - 10
    );
  }

  doc.save(`Briefing_Missao_${dadosViagem.destino.replace(/ /g, '_')}.pdf`);
};