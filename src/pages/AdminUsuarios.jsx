import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminUsuarios() {
  const queryClient = useQueryClient();

  // 1. Busca todos os usuários da nova rota de admin
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: api.adminGetUsers,
    // Se der erro (ex: 403 Proibido), armazena o erro
    retry: false, 
  });

  // 2. Mutação para atualizar a função (role)
  const updateRoleMutation = useMutation({
    mutationFn: api.adminUpdateUserRole,
    onSuccess: () => {
      // Atualiza a lista de usuários automaticamente após a mudança
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
    onError: (err) => {
      alert("Erro ao atualizar a função: " + (err.response?.data?.error || err.message));
    }
  });

  const handleRoleChange = (userId, newRole) => {
    updateRoleMutation.mutate({ id: userId, role: newRole });
  };

  // Define as funções (roles) disponíveis
  const rolesDisponiveis = [
    'COLABORADOR',
    'GESTOR',
    'ASSESSOR_DIRETOR',
    'DESENVOLVEDOR',
    'VISITANTE'
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Users className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin de Usuários</h1>
            <p className="text-slate-600">Gerencie as funções de todos os usuários do sistema.</p>
          </div>
        </div>

        {/* Exibe erros (ex: se um não-dev tentar acessar a página) */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error.response?.data?.error || "Você não tem permissão para ver esta página."}</AlertDescription>
          </Alert>
        )}

        {/* Exibe o loading */}
        {isLoading && (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
            <p className="ml-3 text-slate-600">Carregando usuários...</p>
          </div>
        )}

        {/* Tabela de Usuários */}
        {users && (
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader>
              <CardTitle>Usuários Cadastrados ({users.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold text-slate-600">Nome Completo</th>
                    <th className="text-left p-3 font-semibold text-slate-600">Email</th>
                    <th className="text-left p-3 font-semibold text-slate-600">Função (Role)</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-slate-50">
                      <td className="p-3">{user.fullName}</td>
                      <td className="p-3 text-slate-700">{user.email}</td>
                      <td className="p-3">
                        {/* O Select para mudar a função em tempo real.
                          Ele é desabilitado enquanto a mutação está ocorrendo.
                        */}
                        <Select
                          value={user.role}
                          onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                          disabled={updateRoleMutation.isPending}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {rolesDisponiveis.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}