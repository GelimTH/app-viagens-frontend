import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area'; // Se não tiver, use div com overflow
import { FileText, CheckCircle, Download, LogOut } from 'lucide-react';
import { jsPDF } from "jspdf";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { api } from '@/api/apiClient';

export default function ModalTermos({ open, onAceitar, onLogout, dadosUsuario, dadosViagem }) {
  const [isLoading, setIsLoading] = useState(false);

  const textoContrato = `
    TERMO DE ADESÃO E RESPONSABILIDADE - MISSÃO TÉCNICA
    
    Eu, ${dadosUsuario?.fullName || 'VISITANTE'}, CPF ${dadosUsuario?.profile?.documento || '...'}, declaro estar ciente e de acordo com as normas da missão "${dadosViagem?.destino || 'Missão'}", a realizar-se entre ${dadosViagem?.dataIda ? format(new Date(dadosViagem.dataIda), 'dd/MM/yyyy') : '...'} e ${dadosViagem?.dataVolta ? format(new Date(dadosViagem.dataVolta), 'dd/MM/yyyy') : '...'}.

    1. RESPONSABILIDADES
    Comprometo-me a seguir o cronograma oficial e as orientações dos organizadores.
    
    2. SAÚDE E SEGURANÇA
    Declaro que as informações de saúde fornecidas (alergias, condições médicas) são verdadeiras.
    
    3. DIREITO DE IMAGEM
    Autorizo o uso de minha imagem em fotos e vídeos da missão para fins de divulgação.
    
    Data: ${format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
  `;

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Termo de Adesão - Missão Técnica", 20, 20);
    doc.setFontSize(12);
    
    const splitText = doc.splitTextToSize(textoContrato, 170);
    doc.text(splitText, 20, 40);
    
    doc.save("Termo_Adesao_Missao.pdf");
  };

  const handleAceitar = async () => {
    setIsLoading(true);
    try {
      await api.aceitarTermos();
      onAceitar(); // Atualiza o estado no componente pai para fechar o modal
    } catch (error) {
      alert("Erro ao registrar aceite. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // backdrop="static" impede fechar clicando fora (conceitual, já que o modal customizado não fecha sozinho se não passarmos onClose)
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm ${!open ? 'hidden' : ''}`}>
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b bg-slate-50">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Termos de Adesão Obrigatórios
          </h2>
          <p className="text-slate-500 mt-1">Leia atentamente antes de prosseguir para o painel.</p>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          <div className="bg-white p-6 rounded-lg border border-slate-200 text-sm leading-relaxed text-justify whitespace-pre-wrap font-mono text-slate-700 shadow-inner h-64 overflow-y-auto">
            {textoContrato}
          </div>
        </div>

        <div className="p-6 border-t bg-white flex flex-col sm:flex-row justify-between gap-4 items-center">
          <Button variant="ghost" onClick={onLogout} className="text-red-500 hover:bg-red-50 hover:text-red-600">
            <LogOut className="w-4 h-4 mr-2" /> Recusar e Sair
          </Button>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={handleDownloadPDF} className="flex-1 sm:flex-none">
              <Download className="w-4 h-4 mr-2" /> Baixar Cópia
            </Button>
            <Button onClick={handleAceitar} disabled={isLoading} className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              {isLoading ? "Processando..." : "Li e Aceito"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}