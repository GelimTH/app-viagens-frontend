// src/pages/EditarDespesa.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import UploadNota from '../components/prestacao/UploadNota'; // Vamos reutilizar este formulário
import { Edit, Loader2 } from 'lucide-react';

// Função para formatar a data para o input type="date" (AAAA-MM-DD)
const formatarDataParaInput = (data) => {
  if (!data) return '';
  const dataObj = new Date(data);
  const ano = dataObj.getUTCFullYear();
  const mes = String(dataObj.getUTCMonth() + 1).padStart(2, '0');
  const dia = String(dataObj.getUTCDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
};

export default function EditarDespesa() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. Busca os dados da despesa específica para preencher o formulário
  const { data: despesa, isLoading, error } = useQuery({
    queryKey: ['despesa', id],
    queryFn: () => api.getDespesaById(id),
  });

  // 2. A mutação para ATUALIZAR a despesa
  const atualizarDespesaMutation = useMutation({
    mutationFn: api.updateDespesa,
    onSuccess: () => {
      // Invalida as queries para forçar a atualização dos dados em todo o app
      queryClient.invalidateQueries({ queryKey: ['despesas'] });
      queryClient.invalidateQueries({ queryKey: ['despesa', id] });
      // Navega de volta para a prestação de contas
      navigate(-1); // Volta para a página anterior (Prestação de Contas)
    },
    onError: (err) => {
        console.error("Erro ao atualizar despesa:", err);
        alert("Não foi possível atualizar a despesa.");
    }
  });

  // 3. Função chamada pelo formulário ao ser submetido
  const handleUpdateDespesa = (dadosDoFormulario) => {
    const dadosParaAtualizar = {
      id: Number(id),
      ...dadosDoFormulario,
      valor: parseFloat(dadosDoFormulario.valor)
    };
    atualizarDespesaMutation.mutate(dadosParaAtualizar);
  };
  
  // 4. Prepara os dados iniciais do formulário (só quando a despesa for carregada)
  const [dadosIniciais, setDadosIniciais] = useState(null);

  useEffect(() => {
    if (despesa) {
      setDadosIniciais({
        tipo: despesa.tipo,
        valor: despesa.valor,
        data: formatarDataParaInput(despesa.data),
        descricao: despesa.descricao || "",
        notaFiscalUrl: despesa.notaFiscalUrl || "",
        comprovanteImagemUrl: despesa.comprovanteImagemUrl || ""
      });
    }
  }, [despesa]);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        Carregando dados da despesa...
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-600">Ocorreu um erro ao buscar os dados da despesa.</div>;
  }

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Edit className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Editar Despesa</h1>
            <p className="text-slate-600">Altere os detalhes do seu registro.</p>
          </div>
        </div>

        {/* O formulário só é renderizado quando os dados iniciais estiverem prontos.
          Isso garante que ele apareça já preenchido.
        */}
        {dadosIniciais && (
          <UploadNota
            onSalvar={handleUpdateDespesa}
            onCancelar={() => navigate(-1)} // Volta para a página anterior
            carregando={atualizarDespesaMutation.isPending}
            dadosIniciais={dadosIniciais}
            isEditMode={true} // Informa ao formulário que estamos no modo de edição
          />
        )}
      </div>
    </div>
  );
}