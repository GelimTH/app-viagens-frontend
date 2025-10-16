// src/components/prestacao/UploadNota.jsx
import React, { useState, useRef } from "react";
import { api } from "@/api/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NumericFormat } from 'react-number-format';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2, CheckCircle, Sparkles, Paperclip, FileText, DollarSign, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function UploadNota({ viagemId, onCancelar, onSucesso }) {
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();
  const [processandoIA, setProcessandoIA] = useState(false);
  const [arquivo, setArquivo] = useState(null);

  // Estado para controlar todos os campos do formulário
  const [dadosDespesa, setDadosDespesa] = useState({
    tipo: "",
    valor: "",
    data: "",
    descricao: "",
    nota_fiscal_url: ""
  });

  const handleFieldChange = (field, value) => {
    setDadosDespesa(prev => ({ ...prev, [field]: value }));
  };

  const criarDespesaMutation = useMutation({
    mutationFn: (despesaData) => api.createDespesa(despesaData), // Supondo que você tenha essa função na API
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas', viagemId] });
      onSucesso();
    },
    onError: () => {
      alert("Erro ao salvar despesa. Verifique os dados e tente novamente.");
    }
  });

  const handleArquivoSelecionado = async (file) => {
    if (!file) return;
    setArquivo(file);
    setProcessandoIA(true);

    try {
      // Simulação de upload e extração com IA
      // Em um app real, aqui você faria as chamadas de API para upload e OCR
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      
      const resultadoIA = {
        valor: 150.75,
        data: "2025-10-16",
        descricao: "Jantar com cliente",
        tipo: "alimentacao"
      };

      // Preenche o formulário com os dados da IA
      setDadosDespesa(prev => ({
        ...prev,
        ...resultadoIA,
        valor: resultadoIA.valor.toString(),
      }));

    } catch (error) {
      console.error("Erro ao processar nota:", error);
    } finally {
      setProcessandoIA(false);
    }
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    criarDespesaMutation.mutate({
      viagem_id: viagemId,
      ...dadosDespesa,
      valor: parseFloat(dadosDespesa.valor),
      status: "pendente"
    });
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-4 flex flex-row justify-between items-center">
        <CardTitle className="text-xl font-bold text-slate-900">
          Adicionar Despesa
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancelar}>
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSalvar} className="space-y-6">
          {/* Botão da IA */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => handleArquivoSelecionado(e.target.files[0])}
            className="hidden"
          />
          <Button type="button" variant="outline" className="w-full h-12 text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => fileInputRef.current?.click()}>
            {processandoIA ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {processandoIA ? "Analisando imagem..." : "Ou, extraia os dados de uma foto com IA"}
          </Button>

          {processandoIA && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-sm text-blue-700">
                Aguarde, nossa IA está lendo as informações da sua nota fiscal...
              </AlertDescription>
            </Alert>
          )}

          {/* Formulário Convencional */}
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
              <Label htmlFor="valor" className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-slate-500" />Valor</Label>
              <NumericFormat
                  id="valor"
                  customInput={Input}
                  placeholder="R$ 0,00"
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  decimalScale={2}
                  fixedDecimalScale
                  value={dadosDespesa.valor || ""}
                  onValueChange={(values) => {
                    handleFieldChange('valor', values.floatValue); 
                  }}
                  required
                />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data" className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-500" />Data</Label>
              <Input id="data" type="date" required value={dadosDespesa.data} onChange={(e) => handleFieldChange('data', e.target.value)} />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="descricao" className="flex items-center gap-2"><FileText className="w-4 h-4 text-slate-500" />Descrição (Opcional)</Label>
            <Textarea id="descricao" placeholder="Ex: Jantar com o cliente XYZ" value={dadosDespesa.descricao} onChange={(e) => handleFieldChange('descricao', e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="anexo" className="flex items-center gap-2"><Paperclip className="w-4 h-4 text-slate-500" />Anexar Nota Fiscal (Opcional)</Label>
            <Input id="anexo" type="file" />
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancelar} className="w-full">
              Cancelar
            </Button>
            <Button type="submit" className="w-full" disabled={criarDespesaMutation.isPending}>
              {criarDespesaMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Salvar Despesa
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}