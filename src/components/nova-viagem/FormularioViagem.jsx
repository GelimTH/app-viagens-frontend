import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Calendar, FileText, ArrowRight, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function FormularioViagem({ onSubmit, carregando, perfilColaborador }) {
  const [dados, setDados] = useState({
    origem: "",
    destino: "",
    data_ida: "",
    data_volta: "",
    motivo: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(dados);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-xl font-bold text-slate-900">
            Dados Básicos da Viagem
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Perfil Info */}
          {perfilColaborador && (
            <Alert className="bg-blue-50 border-blue-200">
              <User className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-sm text-slate-700">
                <strong>Perfil detectado:</strong> {perfilColaborador.cargo} - {perfilColaborador.departamento}
                <br />
                <strong>Centro de custo padrão:</strong> {perfilColaborador.centro_custo_padrao}
              </AlertDescription>
            </Alert>
          )}

          {/* Origem/Destino */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origem" className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Cidade de Origem
              </Label>
              <Input
                id="origem"
                required
                value={dados.origem}
                onChange={(e) => setDados({ ...dados, origem: e.target.value })}
                placeholder="Ex: São Paulo"
                className="border-slate-200 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destino" className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Cidade de Destino
              </Label>
              <Input
                id="destino"
                required
                value={dados.destino}
                onChange={(e) => setDados({ ...dados, destino: e.target.value })}
                placeholder="Ex: Rio de Janeiro"
                className="border-slate-200 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Datas */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_ida" className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Data de Ida
              </Label>
              <Input
                id="data_ida"
                type="date"
                required
                value={dados.data_ida}
                onChange={(e) => setDados({ ...dados, data_ida: e.target.value })}
                className="border-slate-200 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_volta" className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Data de Volta
              </Label>
              <Input
                id="data_volta"
                type="date"
                required
                value={dados.data_volta}
                onChange={(e) => setDados({ ...dados, data_volta: e.target.value })}
                className="border-slate-200 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Motivo */}
          <div className="space-y-2">
            <Label htmlFor="motivo" className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Motivo da Viagem
            </Label>
            <Textarea
              id="motivo"
              required
              value={dados.motivo}
              onChange={(e) => setDados({ ...dados, motivo: e.target.value })}
              placeholder="Descreva o motivo da viagem..."
              className="border-slate-200 focus:border-blue-500 min-h-[100px]"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={carregando}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 text-white h-12 text-base"
          >
            {carregando ? (
              <>
                <span className="animate-spin mr-2">⚙️</span>
                IA processando suas informações...
              </>
            ) : (
              <>
                Continuar com IA
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}