// src/components/nova-viagem/SugestoesIA.jsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  CheckCircle,
  Plane,
  Hotel,
  DollarSign,
  Edit,
  ArrowLeft,
  Briefcase,
  Star,
  Clock,
  AlertTriangle,
  TrendingUp
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatarMoeda } from "@/lib/utils";

// O componente para as "cartas" individuais continua o mesmo, ele já está ótimo.
function OpcaoCard({ icone: Icone, corIcone, titulo, subtitulo, valor, maisBarato, faixaPreco }) {

  let outlier = null;
  if (faixaPreco && faixaPreco.count > 0) { // Só exibe se tivermos dados históricos
    if (valor > faixaPreco.max) outlier = 'caro';
    if (valor < faixaPreco.min) outlier = 'barato';
  }

  const badgeMaisBarato = maisBarato && !outlier;
  const badgeOutlierCaro = outlier === 'caro';
  const badgeOutlierBarato = outlier === 'barato' && !maisBarato;

  return (
    <div className={`
      relative bg-white rounded-xl p-4 flex flex-col transition-all duration-300
      hover:shadow-lg hover:-translate-y-1 border
      ${badgeMaisBarato ? 'border-2 border-green-500 pt-8' : 'border-slate-200'}
      ${badgeOutlierCaro ? 'border-2 border-red-500 pt-8' : ''}
      ${badgeOutlierBarato ? 'border-2 border-blue-500 pt-8' : ''}
    `}>
      {badgeMaisBarato && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-green-500 text-white text-xs font-bold uppercase rounded-full shadow-md whitespace-nowrap">
          Mais Barato
        </div>
      )}
      {badgeOutlierCaro && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase rounded-full shadow-md whitespace-nowrap flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Acima da Faixa
        </div>
      )}
      {badgeOutlierBarato && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-bold uppercase rounded-full shadow-md whitespace-nowrap flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> Abaixo da Faixa
        </div>
      )}

      <div className="flex items-center gap-2 mb-2">
        {Icone && <Icone className={`w-4 h-4 flex-shrink-0 ${corIcone || 'text-slate-500'}`} />}
        <p className="font-bold text-sm text-slate-900 truncate">{titulo}</p>
      </div>
      <div className="text-sm text-slate-600 mb-2">{subtitulo}</div>

      <div className="mt-auto text-center space-y-1 pt-2">
        <p className="font-bold text-lg text-slate-800">{formatarMoeda(valor)}</p>
        {faixaPreco && faixaPreco.count > 0 && (
          <p className="text-xs text-slate-500" title={`Baseado em ${faixaPreco.count} viagens`}>
            Faixa: {formatarMoeda(faixaPreco.min)} - {formatarMoeda(faixaPreco.max)}
          </p>
        )}
      </div>
    </div>
  );
}

export default function SugestoesIA({ sugestoes, onConfirmar, onVoltar, carregando }) {

  const faixaPrecoVoos = null; // Ainda não temos faixa para voos
  const faixaPrecoHoteis = sugestoes.faixaPreco; // <-- Pega a faixa de preço

  return (
    <div className="space-y-6">
      {/* 1. MUDANÇA: O Card principal agora engloba TUDO para criar o "quadro" */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-blue-50 overflow-hidden">
        <CardHeader className="border-b border-purple-100 pb-4">
          <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Sugestoes da IA
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Justificativa da IA no topo, ocupando a largura toda */}
          <Alert className="bg-white/80 border-purple-200 backdrop-blur-sm">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-slate-700">
              {sugestoes.justificativa}
            </AlertDescription>
          </Alert>

          {/* 2. MUDANÇA: Grid principal de 2 colunas para Transporte e Hospedagem */}
          <div className="grid lg:grid-cols-2 gap-6">

            {/* Coluna da Esquerda: Opções de Transporte */}
            <div className="space-y-5">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Plane className="w-5 h-5 text-blue-600" />
                Transporte ({sugestoes.tipo_transporte})
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {sugestoes.voosSugeridos.map(voo => (
                  <OpcaoCard
                    key={voo.id} icone={Briefcase} titulo={voo.compania}
                    subtitulo={<span className="flex items-center gap-1.5 text-xs"><Clock className="w-3 h-3" /> {voo.horario}</span>}
                    valor={voo.valor} maisBarato={voo.maisBarato}
                    faixaPreco={faixaPrecoVoos}
                  />
                ))}
              </div>
            </div>

            {/* Coluna da Direita: Opções de Hospedagem */}
            {sugestoes.necessita_hospedagem && (
              <div className="space-y-5">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Hotel className="w-5 h-5 text-purple-600" />
                  Hospedagem
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {sugestoes.hoteisSugeridos.map(hotel => (
                    <OpcaoCard
                      key={hotel.id} icone={Hotel} corIcone="text-purple-600" titulo={hotel.nome}
                      subtitulo={
                        <div className="flex gap-0.5">
                          {Array(hotel.estrelas).fill(0).map((_, i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                        </div>
                      }
                      valor={hotel.valor} maisBarato={hotel.maisBarato}
                      faixaPreco={faixaPrecoHoteis}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. MUDANÇA: Resumo financeiro na base do quadro */}
          <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-purple-100">
            <div className="bg-white/70 p-6 rounded-xl border border-slate-200 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <p className="font-semibold text-slate-900">Valor Estimado</p>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {formatarMoeda(sugestoes.valor_estimado)}
              </p>
            </div>
            <div className="bg-white/70 p-6 rounded-xl border border-slate-200 backdrop-blur-sm flex flex-col justify-center">
              <p className="text-sm text-slate-600 mb-1">Centro de Custo</p>
              <p className="font-semibold text-slate-900 text-lg">{sugestoes.centro_custo}</p>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* 4. Ações (agora fora do card principal) */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" onClick={onVoltar} className="w-full sm:w-auto">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div className="flex-grow"></div>
        <Button variant="outline" onClick={onVoltar} className="w-full sm:w-auto">
          <Edit className="w-4 h-4 mr-2" />
          Editar
        </Button>
        <Button onClick={() => onConfirmar(sugestoes)} disabled={carregando} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
          {carregando ? 'Confirmando...' : 'Confirmar Viagem'}
        </Button>
      </div>
    </div>
  );
}