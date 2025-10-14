import React, { useState, useRef, useEffect } from "react";
import { api } from "@/api/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Bot, User } from "lucide-react";

export default function ChatIA() {
  const [mensagens, setMensagens] = useState([
    {
      tipo: "bot",
      texto: "Olá! 👋 Sou seu assistente de viagens. Estou aqui para ajudar com dúvidas sobre solicitações, prestação de contas, políticas e muito mais. Como posso ajudar?"
    }
  ]);
  const [inputMensagem, setInputMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);
  const mensagensEndRef = useRef(null);

  const scrollToBottom = () => {
    mensagensEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  const handleEnviar = async () => {
    if (!inputMensagem.trim() || carregando) return;

    const novaMensagem = inputMensagem;
    setInputMensagem("");
    setMensagens(prev => [...prev, { tipo: "usuario", texto: novaMensagem }]);
    setCarregando(true);

    try {
      const resposta = await api.integrations.Core.InvokeLLM({
        prompt: `
          Você é um assistente virtual especializado em gestão de viagens corporativas.
          Ajude o usuário com suas dúvidas sobre:
          - Solicitação de viagens
          - Prestação de contas
          - Políticas de viagem
          - Prazos e procedimentos
          - Como usar o sistema
          
          Seja prestativo, claro e direto. Use emojis quando apropriado.
          
          Pergunta do usuário: ${novaMensagem}
        `
      });

      setMensagens(prev => [...prev, { tipo: "bot", texto: resposta }]);
    } catch (error) {
      setMensagens(prev => [...prev, { 
        tipo: "bot", 
        texto: "Desculpe, ocorreu um erro. Por favor, tente novamente." 
      }]);
    }

    setCarregando(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="border-0 shadow-2xl bg-white h-[calc(100vh-8rem)]">
          <CardHeader className="border-b border-slate-100 pb-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="w-6 h-6" />
              Chat com IA - Suporte 24/7
            </CardTitle>
            <p className="text-sm text-purple-100 mt-1">
              Tire suas dúvidas em tempo real
            </p>
          </CardHeader>
          
          <CardContent className="p-6 flex flex-col h-[calc(100%-5rem)]">
            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {mensagens.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.tipo === "usuario" ? "justify-end" : "justify-start"}`}
                >
                  {msg.tipo === "bot" && (
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      msg.tipo === "usuario"
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                        : "bg-slate-100 text-slate-900"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.texto}</p>
                  </div>
                  {msg.tipo === "usuario" && (
                    <div className="w-8 h-8 bg-gradient-to-br from-slate-300 to-slate-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {carregando && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-slate-100 p-4 rounded-2xl">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={mensagensEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                value={inputMensagem}
                onChange={(e) => setInputMensagem(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="flex-1"
                disabled={carregando}
              />
              <Button
                onClick={handleEnviar}
                disabled={carregando || !inputMensagem.trim()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}