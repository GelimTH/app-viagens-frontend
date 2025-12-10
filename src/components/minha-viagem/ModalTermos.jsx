// src/components/minha-viagem/ModalTermos.jsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle, Download, LogOut } from 'lucide-react';
import { jsPDF } from "jspdf";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { api } from '@/api/apiClient';

export default function ModalTermos({ open, onAceitar, onLogout, dadosUsuario, dadosViagem }) {
  const [isLoading, setIsLoading] = useState(false);

  // Texto do contrato dinâmico
  const textoContrato = `
    TERMO DE ADESÃO E RESPONSABILIDADE - MISSÃO TÉCNICA
    
    Eu, ${dadosUsuario?.fullName || 'VISITANTE'}, CPF ${dadosUsuario?.documento || '...'}, declaro estar ciente e de acordo com as normas da missão "${dadosViagem?.destino || 'Missão'}", a realizar-se entre ${dadosViagem?.dataIda ? format(new Date(dadosViagem.dataIda), 'dd/MM/yyyy') : '...'} e ${dadosViagem?.dataVolta ? format(new Date(dadosViagem.dataVolta), 'dd/MM/yyyy') : '...'}.

    1. RESPONSABILIDADES
    Comprometo-me a seguir o cronograma oficial e as orientações dos organizadores durante toda a missão técnica.
    
    2. SAÚDE E SEGURANÇA
    Declaro que as informações de saúde fornecidas (alergias, condições médicas, medicamentos) em meu perfil são verdadeiras e atualizadas.
    
    3. DIREITO DE IMAGEM
    Autorizo o uso de minha imagem em fotos e vídeos da missão para fins de divulgação institucional e técnica.

    4. CANCELAMENTO
    Estou ciente das políticas de cancelamento e reembolso conforme contrato de prestação de serviços assinado anteriormente.
    
    Data do Aceite: ${format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
  `;

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(16);
    doc.text("Termo de Adesão - Missão Técnica", 20, 20);
    
    // Corpo do texto
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(textoContrato, 170);
    doc.text(splitText, 20, 40);
    
    // Assinatura Digital Simulada
    doc.text(`Assinado digitalmente por: ${dadosUsuario?.fullName || 'Visitante'}`, 20, 200);
    doc.text(`Hash de validação: ${new Date().getTime()}`, 20, 210);
    
    doc.save("Termo_Adesao_Missao.pdf");
  };

  const handleAceitar = async () => {
    setIsLoading(true);
    try {
      await api.aceitarTermos();
      onAceitar();
    } catch (error) {
      console.error(error);
      alert("Erro ao registrar aceite. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm px-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="p-6 border-b bg-slate-50">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Termos de Adesão Obrigatórios
          </h2>
          <p className="text-slate-500 mt-1">
            Para acessar o painel da viagem, é necessário ler e aceitar os termos abaixo.
          </p>
        </div>
        
        {/* Conteúdo do Contrato (Scrollável via CSS padrão) */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">
          <div className="bg-white p-6 rounded-lg border border-slate-200 text-sm leading-relaxed text-justify whitespace-pre-wrap font-mono text-slate-700 shadow-sm overflow-y-auto">
            {textoContrato}
          </div>
        </div>

        {/* Footer com Ações */}
        <div className="p-6 border-t bg-white flex flex-col sm:flex-row justify-between gap-4 items-center">
          <Button 
            variant="ghost" 
            onClick={onLogout} 
            className="text-red-500 hover:bg-red-50 hover:text-red-600 w-full sm:w-auto"
          >
            <LogOut className="w-4 h-4 mr-2" /> Recusar e Sair
          </Button>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={handleDownloadPDF} 
              className="w-full sm:w-auto"
            >
              <Download className="w-4 h-4 mr-2" /> Baixar Cópia
            </Button>
            <Button 
              onClick={handleAceitar} 
              disabled={isLoading} 
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {isLoading ? "Registrando..." : "Li e Aceito os Termos"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}