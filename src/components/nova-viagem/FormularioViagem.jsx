import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
// ==================================================
// 1. IMPORTAR O ÍCONE DE VOLTAR
// ==================================================
import { MapPin, Calendar, FileText, ArrowRight, ArrowLeft } from "lucide-react";

export default function FormularioViagem({
  onSubmit,
  carregando,
  dadosIniciais = null,
  isEditMode = false,
  onVoltar, // <-- 2. ADICIONAR onVoltar NAS PROPS
}) {

  const [dados, setDados] = useState(
    dadosIniciais || {
      origem: "",
      destino: "",
      data_ida: "",
      data_volta: "",
      motivo: ""
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(dados);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-xl font-bold text-slate-900">
            {/* 3. ATUALIZAR TÍTULO */}
            {isEditMode ? 'Editando Dados da Missão' : 'Dados Básicos da Missão (Etapa 2 de 4)'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* ... (inputs de origem e destino ficam iguais) ... */}
            <div className="space-y-2">
              <Label htmlFor="origem" className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-600" /> Cidade de Origem</Label>
              <Input id="origem" required value={dados.origem} onChange={(e) => setDados({ ...dados, origem: e.target.value })} placeholder="Ex: São Paulo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destino" className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-600" /> Cidade de Destino</Label>
              <Input id="destino" required value={dados.destino} onChange={(e) => setDados({ ...dados, destino: e.target.value })} placeholder="Ex: Rio de Janeiro" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
             {/* ... (inputs de data ficam iguais) ... */}
            <div className="space-y-2">
              <Label htmlFor="data_ida" className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-600" /> Data de Ida</Label>
              <Input id="data_ida" type="date" required value={dados.data_ida} onChange={(e) => setDados({ ...dados, data_ida: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_volta" className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-600" /> Data de Volta</Label>
              <Input id="data_volta" type="date" required value={dados.data_volta} onChange={(e) => setDados({ ...dados, data_volta: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            {/* ... (input de motivo fica igual) ... */}
            <Label htmlFor="motivo" className="flex items-center gap-2"><FileText className="w-4 h-4 text-blue-600" /> Motivo da Missão</Label>
            <Textarea id="motivo" required value={dados.motivo} onChange={(e) => setDados({ ...dados, motivo: e.target.value })} placeholder="Descreva o motivo da missão..." className="min-h-[100px]" />
          </div>

          {/* ================================================== */}
          {/* 4. ATUALIZAR BOTÕES */}
          {/* ================================================== */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
            {/* Botão Voltar (só aparece se onVoltar for fornecido) */}
            {onVoltar && (
              <Button
                type="button" // Importante para não submeter o formulário
                variant="outline"
                onClick={onVoltar}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar (Tipo de Missão)
              </Button>
            )}

            {/* Botão Continuar */}
            <Button
              type="submit"
              disabled={carregando}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 text-white"
            >
              {carregando ? (
                <>
                  <span className="animate-spin mr-2">⚙️</span>
                  IA processando suas informações...
                </>
              ) : (
                <>
                  Continuar com IA
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}