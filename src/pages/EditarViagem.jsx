// src/pages/EditarViagem.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import FormularioViagem from '../components/nova-viagem/FormularioViagem';
import { Edit } from 'lucide-react';

// Função para formatar a data para o input type="date" (AAAA-MM-DD)
const formatarDataParaInput = (data) => {
  if (!data) return '';
  const dataObj = new Date(data);
  // Usamos getUTC... para evitar problemas com fuso horário
  const ano = dataObj.getUTCFullYear();
  const mes = String(dataObj.getUTCMonth() + 1).padStart(2, '0');
  const dia = String(dataObj.getUTCDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
};

export default function EditarViagem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. Busca os dados da viagem específica para preencher o formulário
  const { data: viagem, isLoading, error } = useQuery({
    queryKey: ['viagem', id],
    queryFn: () => api.getViagemById(id),
  });

  // 2. A mutação para ATUALIZAR a viagem
  const atualizarViagemMutation = useMutation({
    mutationFn: api.updateViagem, // Usa a nossa nova função da API
    onSuccess: () => {
      // Invalida as queries para forçar a atualização dos dados em todo o app
      queryClient.invalidateQueries({ queryKey: ['viagens'] });
      queryClient.invalidateQueries({ queryKey: ['viagem', id] });
      // Navega de volta para o histórico
      navigate('/app/historico');
    },
    onError: (err) => {
        console.error("Erro ao atualizar viagem:", err);
        alert("Não foi possível atualizar a viagem.");
    }
  });

  // 3. Função chamada pelo formulário ao ser submetido
  const handleUpdateViagem = (dadosDoFormulario) => {
    // Renomeia os campos para corresponder ao backend (camelCase)
    const dadosParaAtualizar = {
      id: Number(id), // O id é necessário para a função updateViagem
      origem: dadosDoFormulario.origem,
      destino: dadosDoFormulario.destino,
      dataIda: dadosDoFormulario.data_ida, // O formulário usa data_ida
      dataVolta: dadosDoFormulario.data_volta, // O formulário usa data_volta
      motivo: dadosDoFormulario.motivo,
    };
    atualizarViagemMutation.mutate(dadosParaAtualizar);
  };
  
  // 4. Prepara os dados iniciais do formulário (só quando a viagem for carregada)
  const [dadosIniciais, setDadosIniciais] = useState(null);

  useEffect(() => {
    if (viagem) {
      setDadosIniciais({
        origem: viagem.origem,
        destino: viagem.destino,
        // O formulário espera data_ida, mas a API envia dataIda
        data_ida: formatarDataParaInput(viagem.dataIda),
        data_volta: formatarDataParaInput(viagem.dataVolta),
        motivo: viagem.motivo,
      });
    }
  }, [viagem]);


  if (isLoading) {
    return <div>A carregar dados da viagem...</div>;
  }

  if (error) {
    return <div>Ocorreu um erro ao buscar os dados da viagem.</div>;
  }

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Edit className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Editar Missão</h1>
            <p className="text-slate-600">Altere os detalhes da sua missão para {viagem.destino}.</p>
          </div>
        </div>

        {/* O formulário só é renderizado quando os dados iniciais estiverem prontos.
          Isso garante que o formulário apareça já preenchido.
        */}
        {dadosIniciais && (
          <FormularioViagem
            onSubmit={handleUpdateViagem}
            carregando={atualizarViagemMutation.isPending}
            dadosIniciais={dadosIniciais}
          />
        )}
      </div>
    </div>
  );
}