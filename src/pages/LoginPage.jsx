import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { AlertCircle, Eye, EyeOff, Plane, Loader2 } from 'lucide-react';
import { User, Building, Mail, Lock, Key } from 'lucide-react';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('colaborador');
  const [showPassword, setShowPassword] = useState(false);
  const [showToken, setShowToken] = useState(false);

  // --- Estados ---
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [collaboratorPassword, setCollaboratorPassword] = useState('');
  const [collaboratorError, setCollaboratorError] = useState('');
  const [collaboratorLoading, setCollaboratorLoading] = useState(false);

  const [externalEmail, setExternalEmail] = useState('');
  const [externalToken, setExternalToken] = useState(''); // Este é o campo "senha" do visitante
  const [externalError, setExternalError] = useState('');
  const [externalLoading, setExternalLoading] = useState(false);

  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const toggleTokenVisibility = () => {
    setShowToken(!showToken);
  };

  // --- Lógica de Login (Colaborador) ---
  const handleCollaboratorSubmit = async (e) => {
    e.preventDefault();
    setCollaboratorError('');
    setCollaboratorLoading(true);

    try {
      // ==================================================
      // CORREÇÃO #1 AQUI
      // ==================================================
      const response = await api.login({
        email: collaboratorEmail,
        password: collaboratorPassword,
        loginAs: 'colaborador' // <-- Adiciona o tipo
      });
      // ==================================================

      localStorage.setItem('authToken', response.token); 

      if (response.user.role === 'VISITANTE') {
        navigate('/app/minha-viagem');
      } else {
        navigate('/app/dashboard');
      }
    } catch (err) {
      console.error('Erro no login do Colaborador:', err);
      setCollaboratorError(err.response?.data?.error || 'Email ou senha inválidos.');
      setCollaboratorLoading(false);
    }
  };

  // --- Lógica de Login (Visitante) ---
  const handleExternalSubmit = async (e) => {
    e.preventDefault();
    setExternalError('');
    setExternalLoading(true);

    try {
      // ==================================================
      // CORREÇÃO #2 AQUI
      // ==================================================
      // O backend espera 'password', então passamos o 'externalToken' como 'password'
      const response = await api.login({
        email: externalEmail,
        password: externalToken,
        loginAs: 'visitante' // <-- Adiciona o tipo
      });
      // ==================================================

      localStorage.setItem('authToken', response.token); 

      if (response.user.role === 'VISITANTE') {
        navigate('/app/minha-viagem');
      } else {
        navigate('/app/dashboard');
      }
    } catch (err) {
      console.error('Erro no login do Visitante:', err);
      setExternalError(err.response?.data?.error || 'Email ou Token de Acesso inválido.');
      setExternalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">

          {/* (Header - sem mudança) */}
          <div className="flex justify-center items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-slate-900">Embarque Coração</h2>
              <p className="text-xs text-slate-500 font-medium">SGV - Sistema Gestor de Viagem</p>
            </div>
          </div>

          {/* (Abas - sem mudança) */}
          <div className="flex mb-8 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('colaborador')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === 'colaborador'
                ? 'bg-white text-blue-600 shadow'
                : 'text-slate-600 hover:text-slate-800'
                }`}
            >
              Colaborador
            </button>
            <button
              onClick={() => setActiveTab('visitante')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === 'visitante'
                ? 'bg-white text-green-600 shadow'
                : 'text-slate-600 hover:text-slate-800'
                }`}
            >
              Visitante
            </button>
          </div>

          {/* Content Area */}
          <div className="transition-all duration-300 ease-in-out">
            {activeTab === 'colaborador' && (
              <div className="animate-fadeIn">
                {/* (Header Colaborador - sem mudança) */}
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                  Acesso Colaborador
                </h2>
                <p className="text-gray-600 text-center mb-8">
                  Sou da equipe interna
                </p>

                {/* (Form Colaborador - sem mudança de layout) */}
                <form onSubmit={handleCollaboratorSubmit} className="space-y-6">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="E-mail Corporativo / Matrícula"
                      value={collaboratorEmail}
                      onChange={(e) => setCollaboratorEmail(e.target.value)}
                      required
                      disabled={collaboratorLoading}
                      className={`w-full pl-12 pr-4 py-4 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${collaboratorError
                        ? 'border-red-500 ring-red-500'
                        : 'border-gray-200 focus:ring-blue-500'
                        }`}
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Senha"
                      value={collaboratorPassword}
                      onChange={(e) => setCollaboratorPassword(e.target.value)}
                      required
                      disabled={collaboratorLoading}
                      className={`w-full pl-12 pr-12 py-4 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${collaboratorError
                        ? 'border-red-500 ring-red-500'
                        : 'border-gray-200 focus:ring-blue-500'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {collaboratorError && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>{collaboratorError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={collaboratorLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center disabled:opacity-70"
                  >
                    {collaboratorLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                    {collaboratorLoading ? "Entrando..." : "Entrar"}
                  </button>

                  <div className="text-center">
                    <Link to="/register" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Não tem uma conta? Cadastre-se
                    </Link>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'visitante' && (
              <div className="animate-fadeIn">
                {/* (Header Visitante - sem mudança) */}
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Building className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                  Acesso de Visitante
                </h2>
                <p className="text-gray-600 text-center mb-8">
                  Sou externo / cliente
                </p>

                {/* (Form Visitante - sem mudança de layout) */}
                <form onSubmit={handleExternalSubmit} className="space-y-6">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="E-mail"
                      value={externalEmail}
                      onChange={(e) => setExternalEmail(e.target.value)}
                      required
                      disabled={externalLoading}
                      className={`w-full pl-12 pr-4 py-4 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${externalError
                        ? 'border-red-500 ring-red-500'
                        : 'border-gray-200 focus:ring-green-500'
                        }`}
                    />
                  </div>

                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showToken ? 'text' : 'password'}
                      placeholder="Senha (é o seu token de convite)" // Texto de placeholder atualizado
                      value={externalToken}
                      onChange={(e) => setExternalToken(e.target.value)}
                      required
                      disabled={externalLoading}
                      className={`w-full pl-12 pr-12 py-4 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${externalError
                        ? 'border-red-500 ring-red-500'
                        : 'border-gray-200 focus:ring-green-500'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={toggleTokenVisibility}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showToken ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {externalError && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>{externalError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={externalLoading}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-200 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center disabled:opacity-70"
                  >
                    {externalLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                    {externalLoading ? "Acessando..." : "Acessar"}
                  </button>

                  <div className="text-center">
                    <Link to="/register-visitante" className="text-green-600 hover:text-green-800 text-sm font-medium">
                      Solicitar Acesso / Registrar com Convite
                    </Link>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}