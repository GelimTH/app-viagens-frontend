import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Briefcase, Building, Hash, Phone, Save } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Perfil() {
  const [editando, setEditando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => api.auth.me(),
  });

  const { data: perfil } = useQuery({
    queryKey: ['perfilColaborador', user?.id],
    queryFn: async () => {
      const perfis = await api.entities.PerfilColaborador.filter({ created_by: user.email });
      return perfis[0] || null;
    },
    enabled: !!user?.id,
  });

  const [dadosPerfil, setDadosPerfil] = useState({
    cargo: perfil?.cargo || "",
    departamento: perfil?.departamento || "",
    centro_custo_padrao: perfil?.centro_custo_padrao || "",
    matricula: perfil?.matricula || "",
    telefone: perfil?.telefone || ""
  });

  React.useEffect(() => {
    if (perfil) {
      setDadosPerfil({
        cargo: perfil.cargo || "",
        departamento: perfil.departamento || "",
        centro_custo_padrao: perfil.centro_custo_padrao || "",
        matricula: perfil.matricula || "",
        telefone: perfil.telefone || ""
      });
    }
  }, [perfil]);

  const salvarPerfilMutation = useMutation({
    mutationFn: async (dados) => {
      if (perfil?.id) {
        return api.entities.PerfilColaborador.update(perfil.id, dados);
      } else {
        return api.entities.PerfilColaborador.create(dados);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfilColaborador'] });
      setEditando(false);
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
    },
  });

  const handleSalvar = () => {
    salvarPerfilMutation.mutate(dadosPerfil);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-slate-400 to-slate-600 rounded-2xl flex items-center justify-center shadow-lg">
            <User className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Meu Perfil</h1>
            <p className="text-slate-600">Gerencie suas informações</p>
          </div>
        </div>

        {sucesso && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              Perfil atualizado com sucesso!
            </AlertDescription>
          </Alert>
        )}

        {/* User Info */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-xl font-bold text-slate-900">
              Informações do Usuário
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="text-slate-500">Nome Completo</Label>
              <p className="text-lg font-semibold text-slate-900">{user?.full_name}</p>
            </div>
            <div>
              <Label className="text-slate-500">Email</Label>
              <p className="text-lg font-semibold text-slate-900">{user?.email}</p>
            </div>
            <div>
              <Label className="text-slate-500">Função</Label>
              <p className="text-lg font-semibold text-slate-900 capitalize">{user?.role}</p>
            </div>
          </CardContent>
        </Card>

        {/* Perfil Profissional */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="border-b border-slate-100 flex flex-row justify-between items-center">
            <CardTitle className="text-xl font-bold text-slate-900">
              Perfil Profissional
            </CardTitle>
            {!editando && (
              <Button
                variant="outline"
                onClick={() => setEditando(true)}
              >
                Editar
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cargo" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Cargo
              </Label>
              <Input
                id="cargo"
                value={dadosPerfil.cargo}
                onChange={(e) => setDadosPerfil({ ...dadosPerfil, cargo: e.target.value })}
                disabled={!editando}
                placeholder="Ex: Analista"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="departamento" className="flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" />
                Departamento
              </Label>
              <Input
                id="departamento"
                value={dadosPerfil.departamento}
                onChange={(e) => setDadosPerfil({ ...dadosPerfil, departamento: e.target.value })}
                disabled={!editando}
                placeholder="Ex: TI"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="centro_custo" className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-blue-600" />
                Centro de Custo Padrão
              </Label>
              <Input
                id="centro_custo"
                value={dadosPerfil.centro_custo_padrao}
                onChange={(e) => setDadosPerfil({ ...dadosPerfil, centro_custo_padrao: e.target.value })}
                disabled={!editando}
                placeholder="Ex: CC-001"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="matricula" className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-blue-600" />
                  Matrícula
                </Label>
                <Input
                  id="matricula"
                  value={dadosPerfil.matricula}
                  onChange={(e) => setDadosPerfil({ ...dadosPerfil, matricula: e.target.value })}
                  disabled={!editando}
                  placeholder="Ex: 12345"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  Telefone
                </Label>
                <Input
                  id="telefone"
                  value={dadosPerfil.telefone}
                  onChange={(e) => setDadosPerfil({ ...dadosPerfil, telefone: e.target.value })}
                  disabled={!editando}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            {editando && (
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditando(false);
                    setDadosPerfil({
                      cargo: perfil?.cargo || "",
                      departamento: perfil?.departamento || "",
                      centro_custo_padrao: perfil?.centro_custo_padrao || "",
                      matricula: perfil?.matricula || "",
                      telefone: perfil?.telefone || ""
                    });
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSalvar}
                  disabled={salvarPerfilMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700"
                >
                  {salvarPerfilMutation.isPending ? (
                    <>Salvando...</>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}