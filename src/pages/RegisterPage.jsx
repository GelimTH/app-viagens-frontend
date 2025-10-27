import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { Plane, User, Mail, Lock, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.register({ fullName, email, password });
      
      // Sucesso! Envia o usuário para a página de login
      navigate('/');
      
    } catch (err) {
      setIsLoading(false);
      if (err.response && err.response.status === 409) {
        setError('Este email já está em uso.'); //
      } else {
        setError('Não foi possível criar a conta. Tente novamente.');
      }
      console.error('Erro no registro:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          <div className="flex justify-center items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-slate-900">Embarque Coração</h2>
              <p className="text-xs text-slate-500 font-medium">SGV - Sistema Gestor de Viagem</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Criar sua Conta
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Crie uma conta de colaborador para começar.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Nome Completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="E-mail Corporativo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full pl-12 pr-4 py-4 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                  error ? 'border-red-500 ring-red-500' : 'border-gray-200 focus:ring-blue-500'
                }`}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full pl-12 pr-12 py-4 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                  error ? 'border-red-500 ring-red-500' : 'border-gray-200 focus:ring-blue-500'
                }`}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Criar Conta
            </button>

            <div className="text-center">
              <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar para o Login
              </Link>
            </div>
          </form>
          
        </div>
      </div>
    </div>
  );
}