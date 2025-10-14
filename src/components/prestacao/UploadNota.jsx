import React, { useState, useRef } from "react";
import { api } from "@/api/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Upload, X, Loader2, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function UploadNota({ viagemId, onCancelar, onSucesso }) {
  const [arquivo, setArquivo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [dadosExtraidos, setDadosExtraidos] = useState(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const criarDespesaMutation = useMutation({
    mutationFn: (despesaData) => api.entities.Despesa.create(despesaData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas'] });
      onSucesso();
    },
  });

  const handleArquivoSelecionado = async (file) => {
    setArquivo(file);
    setPreview(URL.createObjectURL(file));
    setProcessando(true);

    try {
      const { file_url } = await api.integrations.Core.UploadFile({ file });

      const resultado = await api.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            valor: { type: "number" },
            data: { type: "string" },
            descricao: { type: "string" },
            tipo: { type: "string" }
          }
        }
      });

      if (resultado.status === "success" && resultado.output) {
        setDadosExtraidos({
          ...resultado.output,
          nota_fiscal_url: file_url
        });
      }
    } catch (error) {
      console.error("Erro ao processar nota:", error);
    }

    setProcessando(false);
  };

  const handleSalvar = async () => {
    await criarDespesaMutation.mutateAsync({
      viagem_id: viagemId,
      ...dadosExtraidos,
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
      <CardContent className="p-6 space-y-6">
        {!arquivo && (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleArquivoSelecionado(e.target.files[0])}
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-8 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Camera className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 mb-1">
                    Tire uma foto ou faça upload
                  </p>
                  <p className="text-sm text-slate-500">
                    A IA reconhecerá os dados automaticamente
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}

        {arquivo && (
          <>
            {preview && (
              <div className="relative">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-full max-h-64 object-contain rounded-lg border border-slate-200"
                />
              </div>
            )}

            {processando && (
              <Alert className="bg-blue-50 border-blue-200">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                <AlertDescription>
                  IA processando a nota fiscal...
                </AlertDescription>
              </Alert>
            )}

            {dadosExtraidos && !processando && (
              <>
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertDescription>
                    Dados extraídos com sucesso! Confira e edite se necessário.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Despesa</Label>
                    <Select
                      value={dadosExtraidos.tipo}
                      onValueChange={(value) => setDadosExtraidos({ ...dadosExtraidos, tipo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transporte">Transporte</SelectItem>
                        <SelectItem value="hospedagem">Hospedagem</SelectItem>
                        <SelectItem value="alimentacao">Alimentação</SelectItem>
                        <SelectItem value="combustivel">Combustível</SelectItem>
                        <SelectItem value="pedagio">Pedágio</SelectItem>
                        <SelectItem value="estacionamento">Estacionamento</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="valor">Valor</Label>
                      <Input
                        id="valor"
                        type="number"
                        step="0.01"
                        value={dadosExtraidos.valor}
                        onChange={(e) => setDadosExtraidos({ ...dadosExtraidos, valor: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="data">Data</Label>
                      <Input
                        id="data"
                        type="date"
                        value={dadosExtraidos.data}
                        onChange={(e) => setDadosExtraidos({ ...dadosExtraidos, data: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Input
                      id="descricao"
                      value={dadosExtraidos.descricao}
                      onChange={(e) => setDadosExtraidos({ ...dadosExtraidos, descricao: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={onCancelar}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSalvar}
                    disabled={criarDespesaMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700"
                  >
                    {criarDespesaMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Salvar Despesa
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}