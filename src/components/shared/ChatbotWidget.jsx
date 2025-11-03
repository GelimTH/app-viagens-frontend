import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, X, Send, User } from 'lucide-react';
import { api } from '@/api/apiClient';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [mensagens, setMensagens] = useState([
    {
      tipo: "bot",
      texto: "Olá! 👋 Sou seu assistente de viagens. Como posso ajudar com suas solicitações ou dúvidas?"
    }
  ]);
  const [inputMensagem, setInputMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);
  const mensagensEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [mensagens, isOpen]);

  const scrollToBottom = () => {
    mensagensEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

const handleEnviar = async () => {
    if (!inputMensagem.trim() || carregando) return;

    const novaMensagemUsuario = { tipo: "usuario", texto: inputMensagem };
    setMensagens(prev => [...prev, novaMensagemUsuario]);
    const pergunta = inputMensagem;
    setInputMensagem("");
    setCarregando(true);

    try {
      const [respostaDoBot] = await Promise.all([
        api.askChatbot({ pergunta }),
        new Promise(resolve => setTimeout(resolve, 750))
      ]);

      // --- NOVA LÓGICA DE AÇÃO ---
      switch (respostaDoBot.action) {
        case 'show_text':
          // Ação Padrão: Apenas mostra a mensagem
          setMensagens(prev => [...prev, { tipo: "bot", texto: respostaDoBot.payload.message }]);
          break;

        case 'navigate':
          // Ação Executável: Navega para uma página
          setMensagens(prev => [...prev, { 
            tipo: "bot", 
            texto: `Claro! Estou te levando para a página '${respostaDoBot.payload.to.replace('/app/','')}'...` 
          }]);

          // Navega após um pequeno atraso para o usuário ler
          setTimeout(() => {
            navigate(respostaDoBot.payload.to);
            setIsOpen(false); // Fecha o chat
          }, 1200);
          break;

        // (Futuro) case 'cotar_voo':
        //   setMensagens(prev => [...prev, { tipo: "bot", texto: "Entendido. Buscando cotações..." }]);
        //   // Chamar uma função para abrir o modal de cotação
        //   break;

        default:
          // Fallback se a API retornar algo inesperado
          setMensagens(prev => [...prev, { tipo: "bot", texto: "Não entendi o comando da IA." }]);
      }
      // --- FIM DA NOVA LÓGICA ---

    } catch (error) {
      console.error("Erro ao falar com o chatbot:", error);
      setMensagens(prev => [...prev, { tipo: "bot", texto: "Desculpe, não consegui me conectar. Tente novamente." }]);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <>
      {/* ===== Botão Flutuante (permanece o mesmo) ===== */}
      <div className="fixed bottom-4 right-4 z-[60]">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-2xl transform hover:scale-110 transition-transform"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
        </Button>
      </div>

      {/* ===== Janela de Chat (MODIFICADA) ===== */}
      {/* A MUDANÇA ESTÁ AQUI: 
        - Removemos o container de tela cheia (que tinha 'fixed inset-0').
        - Removemos o 'overlay' escuro.
        - Aplicamos o posicionamento e a animação diretamente no container do Card.
        - Adicionamos 'pointer-events-none' quando o chat está fechado.
      */}
      <div
        className={`fixed bottom-20 right-4 z-50 transition-all duration-300 ease-in-out
                    ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}
      >
        <Card 
          className="w-[90vw] max-w-lg h-[80vh] flex flex-col shadow-2xl 
                     sm:w-96 sm:h-[60vh] sm:max-h-[700px]"
        >
            <CardHeader className="flex flex-row items-center justify-between p-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    Assistente Virtual
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                    {mensagens.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 text-sm ${msg.tipo === "usuario" ? "justify-end" : "justify-start"}`}>
                            {msg.tipo === "bot" && <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-white" /></div>}
                            <div className={`max-w-[80%] p-3 rounded-2xl ${msg.tipo === "usuario" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-900"}`}>
                                <p className="whitespace-pre-wrap">{msg.texto}</p>
                            </div>
                            {msg.tipo === "usuario" && <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0"><User className="w-5 h-5 text-slate-600" /></div>}
                        </div>
                    ))}
                    {carregando && (
                        <div className="flex gap-3 justify-start">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-white" /></div>
                            <div className="bg-slate-100 p-3 rounded-2xl flex items-center"><div className="flex gap-1"><div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" /><div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} /><div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} /></div></div>
                        </div>
                    )}
                    <div ref={mensagensEndRef} />
                </div>
                <div className="flex gap-2 border-t pt-4">
                    <Input value={inputMensagem} onChange={(e) => setInputMensagem(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleEnviar()} placeholder="Digite sua mensagem..." className="flex-1" disabled={carregando} />
                    <Button onClick={handleEnviar} disabled={carregando || !inputMensagem.trim()}><Send className="w-4 h-4" /></Button>
                </div>
            </CardContent>
        </Card>
      </div>
    </>
  );
}