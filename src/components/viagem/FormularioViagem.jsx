// src/components/viagem/FormularioViagem.jsx
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Save } from 'lucide-react';
import { format } from 'date-fns';

export default function FormularioViagem({ initialData, onSubmit, isLoading, botaoTexto = "Salvar" }) {
  const [formData, setFormData] = useState({
    destino: '',
    dataIda: '',
    dataVolta: '',
    orcamento: '',
    status: 'PLANEJAMENTO',
    descricao: ''
  });

  // Carrega os dados iniciais quando disponíveis
  useEffect(() => {
    if (initialData) {
      setFormData({
        destino: initialData.destino || '',
        // Formata datas para o input type="date" (yyyy-MM-dd)
        dataIda: initialData.dataIda ? new Date(initialData.dataIda).toISOString().split('T')[0] : '',
        dataVolta: initialData.dataVolta ? new Date(initialData.dataVolta).toISOString().split('T')[0] : '',
        orcamento: initialData.orcamento || '',
        status: initialData.status || 'PLANEJAMENTO',
        descricao: initialData.descricao || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, status: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Envia os dados para a função pai
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Destino */}
        <div className="space-y-2">
          <Label htmlFor="destino">Destino da Missão</Label>
          <Input 
            id="destino" 
            name="destino" 
            value={formData.destino} 
            onChange={handleChange} 
            placeholder="Ex: Missão Técnica Dubai" 
            required 
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status da Viagem</Label>
          <Select onValueChange={handleSelectChange} value={formData.status}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PLANEJAMENTO">Planejamento</SelectItem>
              <SelectItem value="CONFIRMADA">Confirmada</SelectItem>
              <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
              <SelectItem value="CONCLUIDA">Concluída</SelectItem>
              <SelectItem value="CANCELADA">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Data Ida */}
        <div className="space-y-2">
          <Label htmlFor="dataIda">Data de Ida</Label>
          <div className="relative">
            <Input 
              type="date" 
              id="dataIda" 
              name="dataIda" 
              value={formData.dataIda} 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>

        {/* Data Volta */}
        <div className="space-y-2">
          <Label htmlFor="dataVolta">Data de Volta</Label>
          <div className="relative">
            <Input 
              type="date" 
              id="dataVolta" 
              name="dataVolta" 
              value={formData.dataVolta} 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>

        {/* Orçamento */}
        <div className="space-y-2">
          <Label htmlFor="orcamento">Orçamento Estimado (R$)</Label>
          <Input 
            type="number" 
            id="orcamento" 
            name="orcamento" 
            value={formData.orcamento} 
            onChange={handleChange} 
            placeholder="0.00" 
          />
        </div>
      </div>

      {/* Descrição / Observações */}
      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição / Observações</Label>
        <Textarea 
          id="descricao" 
          name="descricao" 
          value={formData.descricao} 
          onChange={handleChange} 
          placeholder="Detalhes adicionais sobre a missão..." 
          className="h-24"
        />
      </div>

      {/* Botão de Salvar */}
      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 min-w-[150px]">
          {isLoading ? (
            <span className="flex items-center gap-2">Salvando...</span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="w-4 h-4" /> {botaoTexto}
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}