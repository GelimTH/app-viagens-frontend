import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  CheckCircle, 
  Plane, 
  Hotel, 
  DollarSign,
  Edit,
  ArrowLeft
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SugestoesIA({ dadosViagem, sugestoes, onConfirmar, onVoltar, carregando }) {
  const [editando, setEditando] = useState(false);
  const [dadosEditados, setDadosEditados] = useState({
    tipo_transporte: sugestoes.tipo_transporte,
    necessita_hospedagem: sugestoes.necessita_hospedagem,
    hospedagem_sugerida: sugestoes.hospedagem_sugerida,
    valor_estimado: sugestoes.valor_estimado,
    centro_custo: sugestoes.centro_custo,
    observacoes: ""
  });

  const handleConfirmar = () => {
    onConfirmar(dadosEditados);
  };

  return (
    <div className="space-y-6">
      {/* IA Suggestions */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader className="border-b border-purple-100 pb-4">
          <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Sugestões da IA
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <Alert className="bg-white border-purple-200">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription>
              {sugestoes.justificativa}
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Plane className="w-5 h-5 text-blue-600" />
                <p className="font-semibold text-slate-900">Transporte</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                {sugestoes.tipo_transporte === 'aereo' ? 'Aéreo' : 
                 sugestoes.tipo_transporte === 'rodoviario' ? 'Rodoviário' : 'Veículo Próprio'}
              </Badge>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Hotel className="w-5 h-5 text-purple-600" />
                <p className="font-semibold text-slate-900">Hospedagem</p>
              </div>
              <Badge className={sugestoes.necessita_hospedagem ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                {sugestoes.necessita_hospedagem ? 'Necessária' : 'Não necessária'}
              </Badge>
            </div>
          </div>

          {sugestoes.hospedagem_sugerida && (
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <p className="text-sm text-slate-600 mb-1">Hotel Sugerido</p>
              <p className="font-semibold text-slate-900">{sugestoes.hospedagem_sugerida}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <p className="font-semibold text-slate-900">Valor Estimado</p>
              </div>
              <p className="text-2xl font-bold text-green-600">
                R$ {sugestoes.valor_estimado?.toFixed(2)}
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <p className="text-sm text-slate-600 mb-1">Centro de Custo</p>
              <p className="font-semibold text-slate-900">{sugestoes.centro_custo}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      {editando && (
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600" />
              Editar Detalhes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações Adicionais</Label>
              <Textarea
                id="observacoes"
                value={dadosEditados.observacoes}
                onChange={(e) => setDadosEditados({ ...dadosEditados, observacoes: e.target.value })}
                placeholder="Adicione qualquer observação ou justificativa adicional..."
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onVoltar}
          className="flex-1"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        {!editando && (
          <Button
            variant="outline"
            onClick={() => setEditando(true)}
            className="flex-1"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        )}
        <Button
          onClick={handleConfirmar}
          disabled={carregando}
          className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-200 text-white"
        >
          {carregando ? (
            <>
              <span className="animate-spin mr-2">⚙️</span>
              Enviando...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Confirmar Viagem
            </>
          )}
        </Button>
      </div>
    </div>
  );
}