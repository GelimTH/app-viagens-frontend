// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plane, AlertCircle } from 'lucide-react'; // Importe o ícone de alerta

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Novo estado para controlar a mensagem de erro
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpa o erro ao tentar fazer login novamente

    try {
      const response = await api.login({ email, password });
      console.log('Login bem-sucedido:', response);

      // Futuramente, aqui é onde você guardaria o token
      // localStorage.setItem('authToken', response.token);

      // Não há mais alerta de sucesso, apenas redireciona
      navigate('/app/dashboard');
    } catch (err) {
      console.error('Erro no login:', err);
      // Define a mensagem de erro no estado
      setError('Email ou senha inválidos.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-2xl text-slate-900">Viagens</h2>
            </div>
          </div>
          <CardTitle className="text-2xl">Acesse sua conta</CardTitle>
          <CardDescription>Entre com suas credenciais para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  // Aplica a borda vermelha se houver erro
                  className={error ? 'border-red-500' : ''}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  // Aplica a borda vermelha se houver erro
                  className={error ? 'border-red-500' : ''}
                />
              </div>

              {/* Mostra a mensagem de erro aqui, se existir */}
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" className="w-full mt-2">
                Entrar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}