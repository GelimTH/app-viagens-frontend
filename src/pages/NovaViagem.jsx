// src/pages/NovaViagem.jsx
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Sparkles, Plane, Loader2 } from "lucide-react"; // Importe o Loader2
import { api } from "@/api/apiClient";

// Nossas Etapas
import FormularioViagem from "../components/nova-viagem/FormularioViagem";
import EtapaAgenda from "../components/nova-viagem/EtapaAgenda";
import SugestoesIA from "../components/nova-viagem/SugestoesIA";

// A IA simulada (do seu arquivo original)
function gerarSugestoes(dados) {
  // Verifique se 'dados' não é nulo
  const destino = dados?.destino || 'Destino Padrão';
  const valorEstimado = Math.random() * 2000 + 500; // Valor aleatório
  return {
    justificativa: `Baseado no destino ${destino}, recomendamos foco em transporte eficiente.`,
    tipo_transporte: "Aéreo",
    necessita_hospedagem: true,
    voosSugeridos: [{ id: 1, compania: "Azul", horario: "08:00 - 10:30", valor: valorEstimado * 0.6, maisBarato: true }, { id: 2, compania: "Gol", horario: "09:30 - 12:00", valor: valorEstimado * 0.7 }],
    hoteisSugeridos: [{ id: 1, nome: `Hotel Plaza ${destino}`, estrelas: 4, valor: valorEstimado * 0.4, maisBarato: true }],
    valor_estimado: valorEstimado,
    centro_custo: "Viagens Corporativas",
  };
}

export default function NovaViagem() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [dadosViagem, setDadosViagem] = useState(null); // <-- O state correto
  const [eventos, setEventos] = useState([]);
  const [sugestoesIA, setSugestoesIA] = useState(null);
  
  const [carregandoIA, setCarregandoIA] = useState(false);

  const criarViagemMutation = useMutation({
    mutationFn: api.createViagem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viagens'] });
      navigate('/app/dashboard');
    },
    onError: (error) => {
      console.error("Erro ao criar viagem:", error);
      alert("Não foi possível criar a viagem.");
    }
  });

  // Etapa 1 -> 2: Salva dados básicos e avança para Agenda
  const handleAvancarParaAgenda = (dadosDoFormulario) => {
    setDadosViagem(dadosDoFormulario); // <-- CORREÇÃO #1 (era setDadosIniciais)
    setStep(2);
  };

  // Etapa 2 -> 3: Gera sugestões da IA e avança para Custos
  const handleAvancarParaIA = async () => {
    setCarregandoIA(true);

    const sugestoesPromise = new Promise((resolve) => {
      setTimeout(() => {
        const sugestoes = gerarSugestoes(dadosViagem); // <-- CORREÇÃO #2 (era dadosIniciais)
        resolve(sugestoes);
      }, 1000);
    });

    const faixaPrecoPromise = api.getFaixaPreco(dadosViagem.destino); // <-- CORREÇÃO #3 (era dadosIniciais)

    try {
      const [sugestoes, faixaPreco] = await Promise.all([
        sugestoesPromise,
        faixaPrecoPromise
      ]);

      setSugestoesIA({
        ...sugestoes,
        faixaPreco: faixaPreco,
      });
      
      setStep(3);

    } catch (error) {
      console.error("Erro ao buscar sugestões ou faixa de preço:", error);
      const sugestoes = gerarSugestoes(dadosViagem); // <-- CORREÇÃO #4 (era dadosIniciais)
      setSugestoesIA({ ...sugestoes, faixaPreco: null });
      setStep(3);
    } finally {
      setCarregandoIA(false);
    }
  };

  // Etapa 3 -> Final: Junta tudo e envia para a API
  const handleConfirmarViagem = (sugestoesFinais) => {
    const dadosCompletosParaSalvar = {
      ...dadosViagem,
      valorEstimado: sugestoesFinais.valor_estimado,
      eventos: eventos, 
    };
    
    criarViagemMutation.mutate(dadosCompletosParaSalvar);
  };

  const irParaEtapa = (etapa) => {
    if (etapa < 3) setSugestoesIA(null);
    setStep(etapa);
  };

  const renderHeader = () => (
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
        <Plane className="w-7 h-7 text-white" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Nova Solicitação de Viagem</h1>
        <p className="text-slate-600">
          {step === 1 && 'Preencha os dados e deixe a IA cuidar do resto'}
          {step === 2 && 'Monte o itinerário básico da missão.'}
          {step === 3 && 'Revise as sugestões e confirme sua viagem'}
        </p>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <FormularioViagem 
            onSubmit={handleAvancarParaAgenda}
            carregando={false}
            dadosIniciais={dadosViagem}
          />
        );
      case 2:
        return (
          <EtapaAgenda
            eventos={eventos}
            setEventos={setEventos}
            onVoltar={() => irParaEtapa(1)}
            onAvancar={handleAvancarParaIA}
          />
        );
      case 3:
        if (carregandoIA) {
          return <div className="text-center p-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;
        }
        return (
          <SugestoesIA 
            dadosViagem={dadosViagem} // <-- Prop que faltava
            sugestoes={sugestoesIA}
            onConfirmar={handleConfirmarViagem}
            onVoltar={() => irParaEtapa(2)}
            carregando={criarViagemMutation.isPending}
          />
        );
      default:
        return <p>Etapa desconhecida.</p>;
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {renderHeader()}
        {renderStep()}
      </div>
    </div>
  );
}