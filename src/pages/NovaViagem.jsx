import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
// ==================================================
// 1. IMPORTAR ÍCONES PARA OS BOTÕES
// ==================================================
import { Sparkles, Plane, Loader2, Map, Globe } from "lucide-react"; 
import { api } from "@/api/apiClient";
import FormularioViagem from "../components/nova-viagem/FormularioViagem";
import EtapaAgenda from "../components/nova-viagem/EtapaAgenda";
import SugestoesIA from "../components/nova-viagem/SugestoesIA";
import { Card, CardContent } from "@/components/ui/card"; // Importar Card
import { Button } from "@/components/ui/button"; // Importar Button

// ... (função gerarSugestoes(dados) permanece igual)
function gerarSugestoes(dados) {
  const destino = dados?.destino || 'Destino Padrão';
  const valorEstimado = Math.random() * 2000 + 500;
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

// ==================================================
// 2. NOVO COMPONENTE PARA A ETAPA 0 (SELEÇÃO DE TIPO)
// ==================================================
function EtapaTipoMissao({ onSelecionar }) {
  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardContent className="p-6 grid md:grid-cols-2 gap-6">
        {/* Card Missão Nacional */}
        <button
          type="button"
          onClick={() => onSelecionar("nacional")}
          className="flex flex-col items-center justify-center p-8 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
        >
          <Map className="w-16 h-16 text-blue-600 mb-4" />
          <h3 className="text-xl font-bold text-slate-900">Missão Nacional</h3>
          <p className="text-slate-600">Missões dentro do Brasil.</p>
        </button>

        {/* Card Missão Internacional */}
        <button
          type="button"
          onClick={() => onSelecionar("internacional")}
          className="flex flex-col items-center justify-center p-8 border-2 border-slate-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-center"
        >
          <Globe className="w-16 h-16 text-purple-600 mb-4" />
          <h3 className="text-xl font-bold text-slate-900">Missão Internacional</h3>
          <p className="text-slate-600">Missões para o exterior.</p>
        </button>
      </CardContent>
    </Card>
  );
}


export default function NovaViagem() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ==================================================
  // 3. ATUALIZAR ESTADOS
  // ==================================================
  const [step, setStep] = useState(0); // <-- Começa na etapa 0
  const [tipoMissao, setTipoMissao] = useState(null); // <-- Novo estado
  const [dadosViagem, setDadosViagem] = useState(null); 
  const [eventos, setEventos] = useState([]);
  const [sugestoesIA, setSugestoesIA] = useState(null);
  const [carregandoIA, setCarregandoIA] = useState(false);

  const criarViagemMutation = useMutation({
    // ... (função de mutação permanece igual)
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

  // ==================================================
  // 4. NOVA FUNÇÃO PARA ETAPA 0
  // ==================================================
  const handleSelecionarTipo = (tipo) => {
    setTipoMissao(tipo);
    // Avança para a próxima etapa (Dados Básicos)
    setStep(1); 
  };

  const handleAvancarParaAgenda = (dadosDoFormulario) => {
    setDadosViagem(dadosDoFormulario);
    setStep(2); // Avança para EtapaAgenda
  };

  const handleAvancarParaIA = async () => {
    // ... (função handleAvancarParaIA permanece igual)
    setCarregandoIA(true);

    const sugestoesPromise = new Promise((resolve) => {
      setTimeout(() => {
        const sugestoes = gerarSugestoes(dadosViagem); 
        resolve(sugestoes);
      }, 1000);
    });

    const destino = dadosViagem?.destino; 
    if (!destino) {
        console.error("Destino não definido para buscar faixa de preço.");
        setCarregandoIA(false);
        const sugestoes = gerarSugestoes(dadosViagem);
        setSugestoesIA({ ...sugestoes, faixaPreco: null });
        setStep(3); // Avança para SugestoesIA
        return;
    }

    const faixaPrecoPromise = api.getFaixaPreco(destino); 

    try {
      const [sugestoes, faixaPreco] = await Promise.all([
        sugestoesPromise,
        faixaPrecoPromise
      ]);
      setSugestoesIA({ ...sugestoes, faixaPreco: faixaPreco });
      setStep(3); // Avança para SugestoesIA
    } catch (error) {
      console.error("Erro ao buscar sugestões ou faixa de preço:", error);
      const sugestoes = gerarSugestoes(dadosViagem); 
      setSugestoesIA({ ...sugestoes, faixaPreco: null });
      setStep(3); // Avança para SugestoesIA
    } finally {
      setCarregandoIA(false);
    }
  };

  const handleConfirmarViagem = (sugestoesFinais) => {
    const dadosCompletosParaSalvar = {
      ...dadosViagem,
      tipoMissao: tipoMissao, // <-- Adicionamos o tipo de missão
      valorEstimado: sugestoesFinais.valor_estimado,
      eventos: eventos, 
    };
    criarViagemMutation.mutate(dadosCompletosParaSalvar);
  };

  const irParaEtapa = (etapa) => {
    if (etapa < 3) setSugestoesIA(null);
    setStep(etapa);
  };

  // ==================================================
  // 5. ATUALIZAR O HEADER
  // ==================================================
  const renderHeader = () => (
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
        <Plane className="w-7 h-7 text-white" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Nova Solicitação de Missão</h1>
        <p className="text-slate-600">
          {step === 0 && 'Selecione o tipo de missão para começar (Etapa 1 de 4)'}
          {step === 1 && `Missão ${tipoMissao === 'nacional' ? 'Nacional' : 'Internacional'} (Etapa 2 de 4)`}
          {step === 2 && 'Monte o itinerário da missão (Etapa 3 de 4)'}
          {step === 3 && 'Revise as sugestões e confirme sua missão (Etapa 4 de 4)'}
        </p>
      </div>
    </div>
  );

  // ==================================================
  // 6. ATUALIZAR O RENDERSTEP
  // ==================================================
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <EtapaTipoMissao onSelecionar={handleSelecionarTipo} />
        );
      case 1:
        return (
          <FormularioViagem 
            onSubmit={handleAvancarParaAgenda}
            carregando={false}
            dadosIniciais={dadosViagem}
            onVoltar={() => irParaEtapa(0)} // <-- Passa a função de voltar
          />
        );
      case 2:
        return (
          <EtapaAgenda
            eventos={eventos}
            setEventos={setEventos}
            onVoltar={() => irParaEtapa(1)} // <-- Volta para a etapa 1
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
            onVoltar={() => irParaEtapa(2)} // <-- Volta para a etapa 2
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