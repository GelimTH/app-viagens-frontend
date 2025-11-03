import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Sparkles, Plane } from "lucide-react";
import { api } from "@/api/apiClient";

// Nossas Etapas
import FormularioViagem from "../components/nova-viagem/FormularioViagem";
import EtapaAgenda from "../components/nova-viagem/EtapaAgenda";
import SugestoesIA from "../components/nova-viagem/SugestoesIA";

// A IA simulada (do seu arquivo original)
function gerarSugestoes(dados) {
  const valorEstimado = Math.random() * 2000 + 500; // Valor aleatório
  return {
    justificativa: `Baseado no destino ${dados.destino}, recomendamos foco em transporte eficiente.`,
    tipo_transporte: "Aéreo",
    necessita_hospedagem: true,
    voosSugeridos: [{ id: 1, compania: "Azul", horario: "08:00 - 10:30", valor: valorEstimado * 0.6, maisBarato: true }, { id: 2, compania: "Gol", horario: "09:30 - 12:00", valor: valorEstimado * 0.7 }],
    hoteisSugeridos: [{ id: 1, nome: `Hotel Plaza ${dados.destino}`, estrelas: 4, valor: valorEstimado * 0.4, maisBarato: true }],
    valor_estimado: valorEstimado,
    centro_custo: "Viagens Corporativas",
  };
}

export default function NovaViagem() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // --- NOVOS ESTADOS PARA O WIZARD ---
  const [step, setStep] = useState(1); // 1: Dados, 2: Agenda, 3: IA/Custos
  const [dadosViagem, setDadosViagem] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [sugestoesIA, setSugestoesIA] = useState(null);

  const [carregandoIA, setCarregandoIA] = useState(false);

  // Mutação para CRIAR a viagem (agora no final)
  const criarViagemMutation = useMutation({
    mutationFn: api.createViagem, // apiClient será atualizado na Etapa 4
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
    setDadosViagem(dadosDoFormulario);
    setStep(2);
  };

  // Etapa 2 -> 3: Gera sugestões da IA e avança para Custos
  const handleAvancarParaIA = async () => { // <-- Transforme em async
    setCarregandoIA(true);

    // Dispara as duas "IAs" em paralelo
    const sugestoesPromise = new Promise((resolve) => {
      setTimeout(() => {
        const sugestoes = gerarSugestoes(dadosViagem);
        resolve(sugestoes);
      }, 1000); // 1s de atraso
    });

    // Busca a faixa de preço real
    const faixaPrecoPromise = api.getFaixaPreco(dadosViagem.destino);

    try {
      // Espera as duas terminarem
      const [sugestoes, faixaPreco] = await Promise.all([
        sugestoesPromise,
        faixaPrecoPromise
      ]);

      // Junta os resultados
      setSugestoesIA({
        ...sugestoes,
        faixaPreco: faixaPreco, // <-- Anexa a faixa de preço
      });

      setStep(3);

    } catch (error) {
      console.error("Erro ao buscar sugestões ou faixa de preço:", error);
      // Se falhar, continua mesmo assim, mas sem a faixa de preço
      const sugestoes = gerarSugestoes(dadosViagem); // Gera sugestões (fallback)
      setSugestoesIA({ ...sugestoes, faixaPreco: null });
      setStep(3);
    } finally {
      setCarregandoIA(false);
    }
  };

  const handleConfirmarViagem = (sugestoesFinais) => {
    // Junta os dados do formulário original com as sugestões da IA
    const dadosCompletosParaSalvar = {
      // Dados do primeiro formulário (origem, destino, datas, etc.)
      ...dadosIniciais,

      // Dados gerados pela IA que também queremos salvar
      valorEstimado: sugestoesFinais.valor_estimado,
      tipoTransporte: sugestoesFinais.tipo_transporte,
      necessitaHospedagem: sugestoesFinais.necessita_hospedagem,
    };

    // Chama a API para criar a viagem
    criarViagemMutation.mutate(dadosCompletosParaSalvar);
  };
  // --- Funções de Navegação do Wizard ---
  const irParaEtapa = (etapa) => {
    // Zera sugestões se voltar
    if (etapa < 3) setSugestoesIA(null);
    setStep(etapa);
  };

  // Header (sem mudança)
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

  // Renderização condicional da etapa
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <FormularioViagem
            onSubmit={handleAvancarParaAgenda}
            carregando={false} // Não há IA nesta etapa ainda
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
            dadosViagem={dadosViagem}
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