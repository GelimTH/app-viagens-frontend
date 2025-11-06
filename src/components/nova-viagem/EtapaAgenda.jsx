import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Calendar, MapPin, Briefcase, Plane, Hotel } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Formulário para novo evento
function FormNovoEvento({ onAddEvento }) {
    const [dados, setDados] = useState({
        tipo: 'reuniao',
        titulo: '',
        dataHoraInicio: '',
        local: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddEvento(dados);
        // Limpa o formulário (exceto o tipo)
        setDados({ ...dados, titulo: '', dataHoraInicio: '', local: '', descricao: '' });
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded-lg bg-slate-50 space-y-4">
            <h4 className="font-semibold text-slate-800">Adicionar novo evento</h4>
            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="titulo">Título do Evento</Label>
                    <Input id="titulo" value={dados.titulo} onChange={(e) => setDados({ ...dados, titulo: e.target.value })} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="dataHoraInicio">Data e Hora de Início</Label>
                    <Input id="dataHoraInicio" type="datetime-local" value={dados.dataHoraInicio} onChange={(e) => setDados({ ...dados, dataHoraInicio: e.target.value })} required />
                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select required value={dados.tipo} onValueChange={(v) => setDados({ ...dados, tipo: v })}>
                        <SelectTrigger id="tipo"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="reuniao">Reunião</SelectItem>
                            <SelectItem value="voo">Voo</SelectItem>
                            <SelectItem value="hotel">Hotel (Check-in/out)</SelectItem>
                            <SelectItem value="transfer">Transfer/Deslocamento</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="local">Local (Opcional)</Label>
                    <Input id="local" value={dados.local} onChange={(e) => setDados({ ...dados, local: e.target.value })} placeholder="Ex: Escritório Cliente XYZ" />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="descricao">Descrição (Opcional)</Label>
                    <Textarea id="descricao" value={dados.descricao} onChange={(e) => setDados({ ...dados, descricao: e.target.value })} placeholder="Detalhes do voo, pauta da reunião, etc." />
                </div>
            </div>
            <Button type="submit" size="sm" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Evento
            </Button>
        </form>
    );
}

// Componente principal
export default function EtapaAgenda({ eventos, setEventos, onVoltar, onAvancar }) {

    const handleAddEvento = (novoEvento) => {
        setEventos([...eventos, novoEvento].sort((a, b) => new Date(a.dataHoraInicio) - new Date(b.dataHoraInicio)));
    };

    const handleRemoveEvento = (index) => {
        setEventos(eventos.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-6">
            <Card className="border-0 shadow-xl bg-white">
                <CardHeader className="border-b border-slate-100 pb-4">
                    <CardTitle className="text-xl font-bold text-slate-900">
                        Itinerário da Missão (Etapa 2 de 3)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <FormNovoEvento onAddEvento={handleAddEvento} />

                    <div className="space-y-3">
                        <h4 className="font-semibold text-slate-800">Eventos Planejados</h4>
                        {eventos.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-4">Nenhum evento adicionado.</p>
                        ) : (
                            eventos.map((evento, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border bg-slate-50">
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-900">{evento.titulo} ({evento.tipo})</p>
                                        <p className="text-sm text-slate-600">
                                            {format(new Date(evento.dataHoraInicio), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveEvento(index)}>
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="flex gap-3">
                <Button variant="outline" onClick={onVoltar} className="w-full">
                    Voltar (Dados Básicos)
                </Button>
                <Button onClick={onAvancar} className="w-full bg-gradient-to-r from-blue-600 to-blue-700">
                    Avançar (Custos e IA)
                </Button>
            </div>
        </div>
    );
}