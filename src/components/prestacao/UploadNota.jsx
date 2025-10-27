// [adv-front.md] meu-app-de-viagens\src\components\prestacao\UploadNota.jsx
// VERSÃO ATUALIZADA (para dois arquivos)

import React, { useState, useEffect, useRef } from "react";
import { api } from "@/api/apiClient";
import { NumericFormat } from 'react-number-format';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2, Sparkles, Paperclip, FileText, Image as ImageIcon, XCircle, Eye } from "lucide-react";

const formatarDataParaInput = (data) => {
  if (!data) return '';
  const dataObj = new Date(data);
  const ano = dataObj.getUTCFullYear();
  const mes = String(dataObj.getUTCMonth() + 1).padStart(2, '0');
  const dia = String(dataObj.getUTCDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
};

// Componente de Preview (reutilizável)
const FilePreview = ({ label, fileUrl, file, onRemove, onHoverEnter, onHoverLeave }) => {
  const isImage = (url, f) => (f && f.type.startsWith('image/')) || (url && /\.(jpg|jpeg|png|gif|webp)$/i.test(url));
  const fileName = (f, url) => (f && typeof f !== 'string' ? f.name : (url?.split('/').pop().split('?')[0] || "Arquivo"));

  return (
    <div className="mt-2 p-3 border border-slate-200 rounded-lg flex items-center justify-between bg-slate-50">
      <div className="flex items-center gap-3 overflow-hidden">
        {isImage(fileUrl, file) ? (
          <img src={fileUrl} alt="Preview" className="w-10 h-10 rounded object-cover" />
        ) : (
          <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
        )}
        <span className="text-sm text-slate-700 truncate" title={fileName(file, fileUrl)}>
          {label}: {fileName(file, fileUrl)}
        </span>
        <a 
          href={fileUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-500 hover:text-blue-700 transition-colors"
          onMouseEnter={(e) => onHoverEnter(e, fileUrl, file)}
          onMouseLeave={onHoverLeave}
        >
          <Eye className="w-5 h-5" />
        </a>
      </div>
      <Button type="button" variant="ghost" size="icon" onClick={onRemove} className="text-red-500 hover:text-red-700 flex-shrink-0">
        <XCircle className="w-5 h-5" />
      </Button>
    </div>
  );
};


export default function UploadNota({ 
  viagemId, 
  onCancelar, 
  onSucesso, 
  onSalvar,
  carregando = false,
  dadosIniciais = null,
  isEditMode = false
}) {
  const pdfInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const [processandoIA, setProcessandoIA] = useState(false);

  const [dadosDespesa, setDadosDespesa] = useState({
    tipo: "",
    valor: "",
    data: formatarDataParaInput(new Date()),
    descricao: "",
  });

  // Estados separados para PDF e Imagem
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  // Estados para a miniatura flutuante
  const [hoveredFile, setHoveredFile] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ top: 0, left: 0 });
  const [hoverTimeoutId, setHoverTimeoutId] = useState(null);

  // Efeito para preencher o formulário se estiver em modo de edição
  useEffect(() => {
    if (isEditMode && dadosIniciais) {
      setDadosDespesa({
        tipo: dadosIniciais.tipo || "",
        valor: dadosIniciais.valor || "",
        data: formatarDataParaInput(dadosIniciais.data) || formatarDataParaInput(new Date()),
        descricao: dadosIniciais.descricao || "",
      });
      if (dadosIniciais.notaFiscalUrl) {
        setPdfPreviewUrl(dadosIniciais.notaFiscalUrl);
      }
      if (dadosIniciais.comprovanteImagemUrl) {
        setImagePreviewUrl(dadosIniciais.comprovanteImagemUrl);
      }
    }
  }, [isEditMode, dadosIniciais]);

  // Efeito para criar/limpar a URL de pré-visualização do PDF
  useEffect(() => {
    if (!selectedPdf) {
      if (isEditMode && dadosIniciais?.notaFiscalUrl) {
        setPdfPreviewUrl(dadosIniciais.notaFiscalUrl);
      } else {
        setPdfPreviewUrl(null);
      }
      return;
    }
    const objectUrl = URL.createObjectURL(selectedPdf);
    setPdfPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedPdf, isEditMode, dadosIniciais]);

  // Efeito para criar/limpar a URL de pré-visualização da Imagem
  useEffect(() => {
    if (!selectedImage) {
      if (isEditMode && dadosIniciais?.comprovanteImagemUrl) {
        setImagePreviewUrl(dadosIniciais.comprovanteImagemUrl);
      } else {
        setImagePreviewUrl(null);
      }
      return;
    }
    const objectUrl = URL.createObjectURL(selectedImage);
    setImagePreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage, isEditMode, dadosIniciais]);

  
  const handleFieldChange = (field, value) => {
    setDadosDespesa(prev => ({ ...prev, [field]: value }));
  };

  const handleSimularIA = async () => { /* ... (mesma função) ... */ };

  const handleSalvar = async (e) => {
    e.preventDefault();

    let finalNotaFiscalUrl = pdfPreviewUrl; // Inicia com o valor do preview (existente ou nulo)
    let finalComprovanteImagemUrl = imagePreviewUrl; // Inicia com o valor do preview

    try {
      // 1. Faz upload do PDF se um NOVO PDF foi selecionado
      if (selectedPdf && typeof selectedPdf !== 'string') {
        // Passa o *objeto do arquivo* diretamente para api.uploadFile
        const uploadResponse = await api.uploadFile(selectedPdf); // <--- CORRIGIDO
        finalNotaFiscalUrl = uploadResponse.fileUrl;
      } else if (pdfPreviewUrl === null) { 
        // Se o preview foi removido (X), garante que a URL seja nula
        finalNotaFiscalUrl = null; 
      }
      
      // 2. Faz upload da Imagem se uma NOVA Imagem foi selecionada
      if (selectedImage && typeof selectedImage !== 'string') {
        // Passa o *objeto do arquivo* diretamente para api.uploadFile
        const uploadResponse = await api.uploadFile(selectedImage); // <--- CORRIGIDO
        finalComprovanteImagemUrl = uploadResponse.fileUrl;
      } else if (imagePreviewUrl === null) {
        // Se o preview foi removido (X), garante que a URL seja nula
        finalComprovanteImagemUrl = null; 
      }

      // 3. Prepara os dados finais
      const dadosFinais = {
        ...dadosDespesa,
        viagem_id: viagemId, 
        valor: parseFloat(dadosDespesa.valor) || 0, // Garante que seja um número
        status: "pendente",
        notaFiscalUrl: finalNotaFiscalUrl,
        comprovanteImagemUrl: finalComprovanteImagemUrl 
      };

      // 4. Chama a função de salvar (update ou create)
      await onSalvar(dadosFinais);
      onSucesso(); // Chama o callback de sucesso (para fechar o modal, etc.)
    } catch (error) {
      console.error("Erro ao salvar despesa:", error);
      alert("Erro ao salvar despesa. Verifique os dados e tente novamente.");
    }
  };

  // Funções de verificação (agora recebem `file` para checar o tipo)
  const isImage = (url, file) => {
    if (file && typeof file !== 'string') return file.type.startsWith('image/');
    if (url) return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    return false;
  };
  const isPdf = (url, file) => {
    if (file && typeof file !== 'string') return file.type === 'application/pdf';
    if (url) return /\.pdf$/i.test(url);
    return false;
  };

  // Funções de miniatura flutuante
  const handleMouseEnter = (event, url, file) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const id = setTimeout(() => {
      const previewWidth = 340;
      const previewHeight = 210;
      let left = rect.right + 10;
      if (left + previewWidth > window.innerWidth) left = rect.left - previewWidth - 10;
      let top = rect.top;
      if (top + previewHeight > window.innerHeight) top = rect.bottom - previewHeight;
      if (top < 0) top = 10;
      
      setHoverPosition({ top, left });
      setHoveredFile({ url, file }); // Passa o objeto todo
    }, 500);
    setHoverTimeoutId(id);
  };
  const handleMouseLeave = () => {
    clearTimeout(hoverTimeoutId);
    setHoveredFile(null);
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader>
        {/* ... (mesmo header) ... */}
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSalvar} className="space-y-6">
          
          {/* Inputs de arquivo ocultos */}
          <input id="pdf-upload" type="file" ref={pdfInputRef} onChange={(e) => setSelectedPdf(e.target.files[0])} className="hidden" accept=".pdf" />
          <input id="image-upload" type="file" ref={imageInputRef} onChange={(e) => setSelectedImage(e.target.files[0])} className="hidden" accept="image/*" />

          {/* ... (Botão IA, Tipo, Valor, Data, Descrição) ... */}
          <Button type="button" variant="outline" className="w-full h-12 text-blue-600 border-blue-200 hover:bg-blue-50" onClick={handleSimularIA}>
            {processandoIA ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {processandoIA ? "Analisando..." : "Extrair dados com IA"}
          </Button>
           <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Despesa</Label>
            <Select required value={dadosDespesa.tipo} onValueChange={(value) => handleFieldChange('tipo', value)}>
              <SelectTrigger id="tipo"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="transporte">Transporte</SelectItem>
                <SelectItem value="hospedagem">Hospedagem</SelectItem>
                <SelectItem value="alimentacao">Alimentação</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor</Label>
              <NumericFormat
                id="valor" customInput={Input} placeholder="R$ 0,00"
                thousandSeparator="." decimalSeparator="," prefix="R$ "
                decimalScale={2} fixedDecimalScale value={dadosDespesa.valor || ""}
                onValueChange={(values) => handleFieldChange('valor', values.floatValue)} required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input id="data" type="date" required value={dadosDespesa.data} onChange={(e) => handleFieldChange('data', e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição (Opcional)</Label>
            <Textarea id="descricao" placeholder="Ex: Jantar com o cliente XYZ" value={dadosDespesa.descricao} onChange={(e) => handleFieldChange('descricao', e.target.value)} />
          </div>

          {/* ÁREA DE UPLOAD (MODIFICADA) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-slate-500" />
              Anexar Comprovantes (Opcional)
            </Label>
            
            {/* Botões */}
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => pdfInputRef.current.click()}>
                <FileText className="w-4 h-4 mr-2" />
                {pdfPreviewUrl ? "Trocar PDF" : "Anexar PDF"}
              </Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => imageInputRef.current.click()}>
                <ImageIcon className="w-4 h-4 mr-2" />
                {imagePreviewUrl ? "Trocar Imagem" : "Anexar Imagem"}
              </Button>
            </div>
            
            {/* Pré-visualizações */}
            {pdfPreviewUrl && (
              <FilePreview
                label="PDF"
                fileUrl={pdfPreviewUrl}
                file={selectedPdf}
                onRemove={() => { setSelectedPdf(null); setFilePreviewUrl(null); }}
                onHoverEnter={(e, url) => handleMouseEnter(e, url, selectedPdf)}
                onHoverLeave={handleMouseLeave}
              />
            )}
            {imagePreviewUrl && (
              <FilePreview
                label="Imagem"
                fileUrl={imagePreviewUrl}
                file={selectedImage}
                onRemove={() => { setSelectedImage(null); setImagePreviewUrl(null); }}
                onHoverEnter={(e, url) => handleMouseEnter(e, url, selectedImage)}
                onHoverLeave={handleMouseLeave}
              />
            )}
          </div>
          
          {/* Botões de Ação */}
          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancelar} className="w-full" disabled={carregando}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-200 text-white"
              disabled={carregando}
            >
              {carregando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {isEditMode ? "Atualizar Despesa" : "Salvar Despesa"}
            </Button>
          </div>
        </form>
      </CardContent>

      {/* Miniatura Flutuante */}
      {hoveredFile && (
        <div
          className="fixed z-[100] p-1 bg-white rounded-lg shadow-2xl border border-slate-300 animate-in fade-in-0 zoom-in-95 pointer-events-none"
          style={{ top: hoverPosition.top, left: hoverPosition.left }}
        >
          {isImage(hoveredFile.url, hoveredFile.file) ?
            <img src={hoveredFile.url} className="max-w-xs max-h-48 rounded" alt="Preview" /> :
            <div className="p-4 flex items-center gap-2 max-w-xs">
              <FileText className="w-8 h-8 text-red-500 flex-shrink-0" />
              <span className="text-sm font-medium text-slate-700 truncate">
                {hoveredFile.file ? hoveredFile.file.name : hoveredFile.url.split('/').pop()}
              </span>
            </div>
          }
        </div>
      )}
    </Card>
  );
}