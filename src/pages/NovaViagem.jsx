// src/pages/NovaViagem.jsx
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { differenceInCalendarDays } from "date-fns";
import { Sparkles, Plane } from "lucide-react";
import FormularioViagem from "../components/nova-viagem/FormularioViagem";
import SugestoesIA from "../components/nova-viagem/SugestoesIA";
import { api } from "@/api/apiClient";

// Nossa "IA" para gerar sugestões genéricas
function gerarSugestoes(dados) {
  const dataIda = new Date(dados.data_ida);
  const dataVolta = new Date(dados.data_volta);
  const duracao = differenceInCalendarDays(dataVolta, dataIda) || 1;

  const necessitaHospedagem = duracao > 0;
  const tipoTransporte = duracao > 1 ? "Aéreo" : "Rodoviário";
  
  // Lógica para gerar valores base
  const valorVooBase = (duracao * 150) + 800;
  const valorHotelBase = duracao * 250;

  // Monta as listas de sugestões
  const voosSugeridos = [
    { id: 1, compania: "Azul", horario: "08:00 - 10:30", valor: valorVooBase - 150, maisBarato: true },
    { id: 2, compania: "Gol", horario: "09:30 - 12:00", valor: valorVooBase + 50 },
    { id: 3, compania: "LATAM", horario: "10:00 - 12:30", valor: valorVooBase + 120 },
  ];
  
  const hoteisSugeridos = necessitaHospedagem ? [
    { id: 1, nome: `Hotel Plaza ${dados.destino}`, estrelas: 4, valor: valorHotelBase, maisBarato: true },
    { id: 2, nome: `Ibis ${dados.destino} Centro`, estrelas: 3, valor: valorHotelBase + 80 },
    { id: 3, nome: `Blue Tree Towers ${dados.destino}`, estrelas: 5, valor: valorHotelBase + 250 },
  ] : [];

  const valorEstimado = valorVooBase - 150 + (necessitaHospedagem ? valorHotelBase : 0);

  const justificativa = `Devido à duração de ${duracao} dia(s) para ${dados.destino}, o transporte ${tipoTransporte.toLowerCase()} é o mais aconselhável. ${necessitaHospedagem ? `A hospedagem é necessária. O valor estimado inclui as opções mais econômicas.` : 'Não parece ser necessário pernoite.'}`;

  return {
    justificativa,
    tipo_transporte: tipoTransporte,
    necessita_hospedagem: necessitaHospedagem,
    voosSugeridos, // Retorna a lista de voos
    hoteisSugeridos, // Retorna a lista de hotéis
    valor_estimado: valorEstimado,
    centro_custo: "Viagens Corporativas",
  };
}


export default function NovaViagem() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [dadosIniciais, setDadosIniciais] = useState(null);
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

  const handleGerarSugestoes = async (dadosDoFormulario) => {
    setCarregandoIA(true);
    setDadosIniciais(dadosDoFormulario);

    setTimeout(() => {
      const sugestoes = gerarSugestoes(dadosDoFormulario);
      setSugestoesIA(sugestoes);
      setCarregandoIA(false);
      setStep(2);
    }, 1500);
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

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Plane className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Nova Solicitação de Viagem</h1>
            <p className="text-slate-600">
              {step === 1 ? 'Preencha os dados e deixe a IA cuidar do resto' : 'Revise as sugestões e confirme sua viagem'}
            </p>
          </div>
        </div>

        {/* MUDANÇA AQUI: Passando os `dadosIniciais` de volta para o formulário */}
        {step === 1 ? (
          <FormularioViagem 
            onSubmit={handleGerarSugestoes}
            carregando={carregandoIA}
            dadosIniciais={dadosIniciais} // Garante que o form seja preenchido ao editar
            textoBotao="Continuar com IA"
          />
        ) : (
          <SugestoesIA 
            sugestoes={sugestoesIA}
            onConfirmar={handleConfirmarViagem}
            onVoltar={() => setStep(1)}
            carregando={criarViagemMutation.isPending}
          />
        )}
      </div>
    </div>
  );
}