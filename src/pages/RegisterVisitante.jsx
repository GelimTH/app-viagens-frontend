import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { Plane, AlertCircle, ArrowLeft, Loader2, User, Mail, Lock, FileText, Calendar, Phone, ShieldAlert, HeartPulse } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert"; // Importe o Alert

export default function RegisterVisitante() {
  // Estados para todos os campos
  const [formData, setFormData] = useState({
    token: '',
    email: '',
    cpf: '',
    fullName: '',
    password: '',
    documento: '',
    dataNascimento: '',
    telefone: '',
    contatoEmergencia: '',
    alergias: '',
    condicoesMedicas: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Lê o token da URL (ex: /register-visitante?token=xyz)
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setFormData(prev => ({ ...prev, token: tokenFromUrl }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.registerVisitante(formData);
      
      // Sucesso! Envia o usuário para a página de login
      alert('Conta criada com sucesso! Você já pode fazer login.');
      navigate('/');
      
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.error || 'Não foi possível criar a conta. Verifique seus dados.');
      console.error('Erro no registro de visitante:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex justify-center items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-800 rounded-2xl flex items-center justify-center shadow-lg">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-slate-900">Embarque Coração</h2>
                <p className="text-xs text-slate-500 font-medium">Registro de Visitante</p>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 text-center">
              Registro de Visitante
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* --- 1. Validação do Convite --- */}
              <fieldset className="border-t pt-4">
                <legend className="text-sm font-medium text-gray-600 px-2">Validação do Convite</legend>
                <div className="grid md:grid-cols-3 gap-4 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="token" className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-green-600"/> Token de Convite</Label>
                    <Input id="token" value={formData.token} onChange={handleChange} required placeholder="Insira o token" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2"><Mail className="w-4 h-4 text-green-600"/> Email (do convite)</Label>
                    <Input id="email" type="email" value={formData.email} onChange={handleChange} required placeholder="seu.email@externo.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf" className="flex items-center gap-2"><FileText className="w-4 h-4 text-green-600"/> CPF (do convite)</Label>
                    <Input id="cpf" value={formData.cpf} onChange={handleChange} required placeholder="123.456.789-00" />
                  </div>
                </div>
              </fieldset>
              
              {/* --- 2. Dados da Conta --- */}
              <fieldset className="border-t pt-4">
                <legend className="text-sm font-medium text-gray-600 px-2">Dados da Conta</legend>
                <div className="grid md:grid-cols-2 gap-4 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center gap-2"><User className="w-4 h-4 text-blue-600"/> Nome Completo</Label>
                    <Input id="fullName" value={formData.fullName} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2"><Lock className="w-4 h-4 text-blue-600"/> Senha</Label>
                    <Input id="password" type="password" value={formData.password} onChange={handleChange} required />
                  </div>
                </div>
              </fieldset>

              {/* --- 3. Formulário de Saúde e Documentos --- */}
              <fieldset className="border-t pt-4">
                <legend className="text-sm font-medium text-gray-600 px-2">Dados Pessoais (Saúde e Documentação)</legend>
                <div className="grid md:grid-cols-2 gap-4 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="documento" className="flex items-center gap-2"><FileText className="w-4 h-4 text-blue-600"/> Documento (RG / Passaporte)</Label>
                    <Input id="documento" value={formData.documento} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataNascimento" className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-600"/> Data de Nascimento</Label>
                    <Input id="dataNascimento" type="date" value={formData.dataNascimento} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone" className="flex items-center gap-2"><Phone className="w-4 h-4 text-blue-600"/> Telefone</Label>
                    <Input id="telefone" value={formData.telefone} onChange={handleChange} placeholder="(65) 9 ..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contatoEmergencia" className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-blue-600"/> Contato de Emergência</Label>
                    <Input id="contatoEmergencia" value={formData.contatoEmergencia} onChange={handleChange} placeholder="Nome e Telefone" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="alergias" className="flex items-center gap-2"><HeartPulse className="w-4 h-4 text-red-600"/> Alergias</Label>
                    <Textarea id="alergias" value={formData.alergias} onChange={handleChange} placeholder="Liste aqui alergias a comidas, medicamentos, etc." />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="condicoesMedicas" className="flex items-center gap-2"><HeartPulse className="w-4 h-4 text-red-600"/> Condições Médicas Relevantes</Label>
                    <Textarea id="condicoesMedicas" value={formData.condicoesMedicas} onChange={handleChange} placeholder="Liste aqui condições médicas que a equipe deve saber (ex: diabetes, hipertensão)" />
                  </div>
                </div>
              </fieldset>

              {/* --- Erro e Botões --- */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
                <Link to="/" className="w-full">
                  <Button type="button" variant="outline" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para o Login
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-200 text-white"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Criar Conta
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}