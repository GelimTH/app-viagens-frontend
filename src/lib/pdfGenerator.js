import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Função helper para formatar moeda
const formatarMoeda = (valor) => {
  return (valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Função helper para adicionar texto com quebra de linha
const addWrappedText = (doc, text, x, y, maxWidth) => {
  const lines = doc.splitTextToSize(text || '', maxWidth);
  doc.text(lines, x, y);
  return y + (doc.getTextDimensions(lines).h);
};

// Função principal de geração
export const gerarPDFExecutivo = (dadosViagem, sugestoes) => {
  const doc = new jsPDF();
  let cursorY = 20; // Posição vertical inicial

  // --- 1. TÍTULO ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(`Briefing Executivo: Missão ${dadosViagem.destino}`, 14, cursorY);
  cursorY += 10;

  // --- 2. RESUMO DA MISSÃO ---
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Período: ${format(new Date(dadosViagem.data_ida), "dd/MM/yyyy", { locale: ptBR })} a ${format(new Date(dadosViagem.data_volta), "dd/MM/yyyy", { locale: ptBR })}`, 14, cursorY);
  cursorY += 7;
  doc.text(`Origem: ${dadosViagem.origem}`, 14, cursorY);
  cursorY += 7;
  doc.text(`Motivo: ${dadosViagem.motivo}`, 14, cursorY);
  cursorY += 10;

  // --- 3. CUSTO TOTAL ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Custo Total Estimado (Opções Recomendadas):', 14, cursorY);
  doc.setFontSize(16);
  doc.setTextColor(34, 139, 34); // Verde
  doc.text(formatarMoeda(sugestoes.valor_estimado), 14, cursorY + 8);
  doc.setTextColor(0, 0, 0); // Reseta a cor
  cursorY += 20;

  // --- 4. JUSTIFICATIVA DA IA ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Justificativa e Racional da IA:', 14, cursorY);
  cursorY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  cursorY = addWrappedText(doc, sugestoes.justificativa, 14, cursorY, 180); // 180mm de largura
  cursorY += 10;

  // --- 5. TABELA DE VOOS (se houver) ---
  if (sugestoes.voosSugeridos && sugestoes.voosSugeridos.length > 0) {
    doc.setFontSize(12);
    doc.text('Opções de Transporte (Voo)', 14, cursorY);
    cursorY += 7;

    autoTable({
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
    cursorY = doc.previousAutoTable.finalY + 10; // Atualiza o cursor
  }

  // --- 6. TABELA DE HOTÉIS (se houver) ---
  if (sugestoes.hoteisSugeridos && sugestoes.hoteisSugeridos.length > 0) {
    doc.setFontSize(12);
    doc.text('Opções de Hospedagem', 14, cursorY);
    cursorY += 7;

    autoTable({
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

  // --- 7. RODAPÉ ---
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

  // --- 8. SALVAR O ARQUIVO ---
  doc.save(`Briefing_Missao_${dadosViagem.destino.replace(/ /g, '_')}.pdf`);
};