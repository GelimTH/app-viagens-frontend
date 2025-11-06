import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Users, Loader2, AlertCircle, Search } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Lista de funções para o FILTRO (inclui "TODOS")
const rolesParaFiltro = [
  'TODOS',
  'COLABORADOR',
  'GESTOR',
  'ASSESSOR_DIRETOR',
  'DESENVOLVEDOR',
  'VISITANTE'
];

// Lista de funções para EDITAR (não inclui "TODOS")
const rolesParaEdicao = [
  'COLABORADOR',
  'GESTOR',
  'ASSESSOR_DIRETOR',
  'DESENVOLVEDOR',
  'VISITANTE'
];

// --- Componente de Tabela de Usuários ---
function UserTable({ title, users, roles, onRoleChange, isLoading }) {
  if (users.length === 0) {
    return (
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <CardTitle>{title} (0)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-center py-4">Nenhum usuário encontrado para este filtro.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader>
        <CardTitle>{title} ({users.length})</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
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
                  <Select
                    value={user.role}
                    onValueChange={(newRole) => onRoleChange(user.id, newRole)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
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
  );
}

// --- Componente do Modal de Aviso ---
function ModalAviso({ isOpen, onClose }) {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalHeader onClose={onClose}>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-red-600" />
          Aviso de Acesso Restrito
        </div>
      </ModalHeader>
      <ModalBody>
        <p className="text-slate-700">
          Essa página é apenas visível aos usuários de função **DESENVOLVEDOR**. 
        </p>
        <p className="mt-2 text-slate-700">
          Usuários comuns (Gestores, assessores, diretores e colaboradores) não conseguem ver esta tela.
        </p>
      </ModalBody>
      <ModalFooter>
        <Button onClick={onClose} className="w-full">Entendido</Button>
      </ModalFooter>
    </Modal>
  );
}

// --- Componente de Filtros ---
function AdminFiltros({ searchTerm, onSearch, roleFilter, onRoleFilter, roles }) {
  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader>
        <CardTitle className="text-lg">Filtros</CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="search-user">Pesquisar por Nome ou Email</Label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              id="search-user"
              placeholder="Digite o nome ou email..."
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-role">Filtrar por Função</Label>
          <Select value={roleFilter} onValueChange={onRoleFilter}>
            <SelectTrigger id="filter-role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Componente Principal da Página ---
export default function AdminUsuarios() {
  const queryClient = useQueryClient();
  
  // --- Estados da Página ---
  const [isModalAvisoOpen, setIsModalAvisoOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("TODOS");

  // --- Efeito para mostrar o modal ao carregar ---
  useEffect(() => {
    setIsModalAvisoOpen(true);
  }, []);

  // --- Busca de Dados ---
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: api.adminGetUsers,
    retry: false, 
  });

  // --- Mutação para Atualizar ---
  const updateRoleMutation = useMutation({
    mutationFn: api.adminUpdateUserRole,
    onSuccess: (updatedUser) => {
      // Atualiza os dados na cache do React Query sem precisar de um novo fetch
      queryClient.setQueryData(['adminUsers'], (oldData) =>
        oldData.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      );
    },
    onError: (err) => {
      alert("Erro ao atualizar a função: " + (err.response?.data?.error || err.message));
    }
  });

  const handleRoleChange = (userId, newRole) => {
    updateRoleMutation.mutate({ id: userId, role: newRole });
  };

  // --- Lógica de Filtro e Separação ---
  const { colaboradoresInternos, visitantesExternos } = useMemo(() => {
    if (!users) return { colaboradoresInternos: [], visitantesExternos: [] };

    const searchLower = searchTerm.toLowerCase();

    const filtered = users.filter(user => {
      // 1. Filtra pela Função (Role)
      const matchesRole = roleFilter === 'TODOS' || user.role === roleFilter;
      
      // 2. Filtra pelo Termo de Pesquisa (Nome ou Email)
      const matchesSearch = !searchTerm ||
        user.fullName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower);
        
      return matchesRole && matchesSearch;
    });

    // 3. Separa as listas
    const internos = filtered.filter(user => user.role !== 'VISITANTE');
    const externos = filtered.filter(user => user.role === 'VISITANTE');

    return { colaboradoresInternos: internos, visitantesExternos: externos };
  }, [users, searchTerm, roleFilter]); // Recalcula apenas se os dados ou filtros mudarem


  // --- Renderização ---
  return (
    <div className="p-6 md:p-8">
      {/* Modal de Aviso */}
      <ModalAviso isOpen={isModalAvisoOpen} onClose={() => setIsModalAvisoOpen(false)} />

      <div className="max-w-6xl mx-auto space-y-6">
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

        {/* Card de Filtros */}
        <AdminFiltros
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          roleFilter={roleFilter}
          onRoleFilter={setRoleFilter}
          roles={rolesParaFiltro}
        />

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

        {/* Tabelas de Usuários */}
        {users && (
          <div className="space-y-6">
            <UserTable
              title="Colaboradores Internos"
              users={colaboradoresInternos}
              roles={rolesParaEdicao}
              onRoleChange={handleRoleChange}
              isLoading={updateRoleMutation.isPending}
            />
            <UserTable
              title="Visitantes/Externos"
              users={visitantesExternos}
              roles={rolesParaEdicao}
              onRoleChange={handleRoleChange}
              isLoading={updateRoleMutation.isPending}
            />
          </div>
        )}
      </div>
    </div>
  );
}