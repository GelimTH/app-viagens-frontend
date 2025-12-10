// src/components/viagem/ListaParticipantes.jsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { User, FileText, Activity, Phone, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ListaParticipantes({ viagemId }) {
  const [participanteSelecionado, setParticipanteSelecionado] = useState(null);

  // Busca a lista de participantes daquela viagem específica
  const { data: participantes = [], isLoading, error } = useQuery({
    queryKey: ['participantes', viagemId],
    queryFn: () => api.getParticipantesViagem(viagemId),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">Erro ao carregar participantes.</div>;
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {participantes.map((p) => (
          <Card 
            key={p.id} 
            className="cursor-pointer hover:shadow-lg transition-all border-l-4 group relative overflow-hidden" 
            style={{ borderLeftColor: p.termosAceitos ? '#22c55e' : '#f59e0b' }}
            onClick={() => setParticipanteSelecionado(p)}
          >
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="font-bold text-slate-800 flex items-center gap-2 truncate pr-2">
                  <div className="bg-slate-100 p-2 rounded-full group-hover:bg-blue-100 transition-colors">
                    <User className="w-5 h-5 text-slate-500 group-hover:text-blue-600" />
                  </div>
                  <span className="truncate" title={p.nome}>{p.nome}</span>
                </div>
                {p.termosAceitos ? (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0 shadow-none whitespace-nowrap">
                    <CheckCircle className="w-3 h-3 mr-1" /> Contrato OK
                  </Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0 shadow-none whitespace-nowrap">
                    <AlertCircle className="w-3 h-3 mr-1" /> Pendente
                  </Badge>
                )}
              </div>
              
              <div className="text-sm text-slate-500 space-y-1.5 pl-11">
                <p className="truncate" title={p.email}>{p.email}</p>
                <p className="text-xs font-mono bg-slate-50 inline-block px-2 py-1 rounded">
                  CPF: {p.documento || 'Não informado'}
                </p>
              </div>
              
              <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-blue-600 font-medium">
                Ver detalhes →
              </div>
            </CardContent>
          </Card>
        ))}
        
        {participantes.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50 rounded-lg border border-dashed">
            <User className="w-12 h-12 mb-3 opacity-20" />
            <p>Nenhum participante confirmado ainda.</p>
          </div>
        )}
      </div>

      {/* Modal de Detalhes (Dados Sensíveis - Visível Apenas para o Gestor) */}
      {participanteSelecionado && (
        <Modal open={true} onClose={() => setParticipanteSelecionado(null)}>
          <ModalHeader onClose={() => setParticipanteSelecionado(null)}>
            <div className="flex flex-col">
              <span className="text-sm text-slate-500 font-normal">Prontuário do Participante</span>
              <span className="text-xl font-bold">{participanteSelecionado.nome}</span>
            </div>
          </ModalHeader>
          
          <ModalBody>
            <div className="space-y-4">
              {/* Seção Médica */}
              <div className="bg-red-50/50 p-4 rounded-lg border border-red-100">
                <h4 className="font-semibold flex items-center gap-2 mb-3 text-red-900 border-b border-red-200 pb-2">
                  <Activity className="w-5 h-5 text-red-500" /> Ficha Médica
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Alergias</span>
                    <p className="text-sm text-slate-700 font-medium">
                      {participanteSelecionado.alergias || 'Nenhuma declarada'}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Condições</span>
                    <p className="text-sm text-slate-700 font-medium">
                      {participanteSelecionado.condicoesMedicas || 'Nenhuma declarada'}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Medicamentos</span>
                    <p className="text-sm text-slate-700 font-medium">
                      {participanteSelecionado.medicamentos || 'Nenhum informado'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contato de Emergência */}
              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                <h4 className="font-semibold flex items-center gap-2 mb-3 text-blue-900 border-b border-blue-200 pb-2">
                  <Phone className="w-5 h-5 text-blue-500" /> Contato de Emergência
                </h4>
                <p className="text-sm text-slate-700 font-medium">
                  {participanteSelecionado.contatoEmergencia || 'Não informado'}
                </p>
              </div>

              {/* Status Legal */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-semibold flex items-center gap-2 mb-3 text-slate-800 border-b border-slate-200 pb-2">
                  <FileText className="w-5 h-5 text-slate-500" /> Status Legal
                </h4>
                <div className="flex items-center gap-3">
                  {participanteSelecionado.termosAceitos ? (
                    <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded-md w-full">
                      <CheckCircle className="w-5 h-5" />
                      <div>
                        <p className="font-bold text-sm">Termos Aceitos</p>
                        {participanteSelecionado.dataAceite && (
                          <p className="text-xs opacity-80">
                            Em: {format(new Date(participanteSelecionado.dataAceite), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-2 rounded-md w-full">
                      <AlertCircle className="w-5 h-5" />
                      <p className="font-bold text-sm">Aguardando aceite dos termos</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="outline" onClick={() => setParticipanteSelecionado(null)}>
              Fechar Prontuário
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
}