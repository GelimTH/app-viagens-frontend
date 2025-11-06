import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/api/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { File, Image, Calendar, Edit, Trash2, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { statusConfig, formatarMoeda } from "@/lib/utils";
import ComprovanteViewer from "./ComprovanteViewer";

const tipoLabels = {
  transporte: "Transporte",
  hospedagem: "Hospedagem",
  alimentacao: "Alimentação",
  outros: "Outros"
};

// 1. A prop 'viagem' deve ser recebida aqui
export default function ListaDespesas({ despesas, viagem }) {

  const totalDespesas = despesas.reduce((sum, d) => sum + (d.valor || 0), 0);
  const queryClient = useQueryClient();

  const [viewingUrl, setViewingUrl] = useState(null);

  // ... (Estados de hover e miniatura) ...
  const [hoveredFile, setHoveredFile] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ top: 0, left: 0 });
  const [hoverTimeoutId, setHoverTimeoutId] = useState(null);

  const deleteDespesaMutation = useMutation({
    // ... (função de deletar) ...
    mutationFn: api.deleteDespesa,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas'] });
    },
    onError: () => alert("Erro ao deletar despesa.")
  });

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja deletar esta despesa?")) {
      deleteDespesaMutation.mutate(id);
    }
  };

  // ... (funções de handleMouseEnter/Leave) ...
  const handleMouseEnter = (event, url) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const id = setTimeout(() => {
      const previewWidth = 340;
      const previewHeight = 210;
      let left = rect.right + 10;
      if (left + previewWidth > window.innerWidth) left = rect.left - previewWidth - 10;
      let top = rect.top;
      if (top + previewHeight > window.innerHeight) top = rect.bottom - previewHeight;
      if (top < 0) top = 10;
      setHoverPosition({ top, left });
      setHoveredFile(url);
    }, 500);
    setHoverTimeoutId(id);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeoutId);
    setHoveredFile(null);
  };
  
  // 2. A constante 'solicitante' deve ser definida aqui
  const solicitante = viagem?.colaborador?.fullName || "Solicitante";

  return (
    <>
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-slate-900">Despesas Registradas</CardTitle>
            <div className="text-right">
              <p className="text-sm text-slate-500">Total</p>
              <p className="text-2xl font-bold text-green-600">{formatarMoeda(totalDespesas)}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {despesas.length === 0 ? (
            <div className="text-center py-12"><p className="text-slate-500">Nenhuma despesa registrada ainda</p></div>
          ) : (
            <div className="space-y-3">
              {despesas.map((despesa) => {
                const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(despesa.comprovanteImagemUrl);
                const isPdf = /\.pdf$/i.test(despesa.notaFiscalUrl);

                return (
                  <div key={despesa.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">{tipoLabels[despesa.tipo]}</p>
                        <p className="text-sm text-slate-600 mb-2">{despesa.descricao}</p>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                          {/* 3. A variável 'solicitante' é renderizada aqui */}
                          <span className="flex items-center gap-1.5" title="Solicitante da Despesa">
                            <User className="w-4 h-4" /> 
                            {solicitante}
                          </span>
                          
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" /> 
                            {format(new Date(despesa.data), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                          
                          <span className="font-bold text-green-600">{formatarMoeda(despesa.valor)}</span>
                        </div>
                      </div>

                      <div className="text-right space-y-2 flex-shrink-0">
                        <Badge variant={statusConfig[despesa.status]?.variant || 'default'}>
                          {statusConfig[despesa.status]?.label}
                        </Badge>

                        <div className="flex items-center justify-end gap-2">
                          {/* Botão de Editar */}
                          <Link to={`/app/despesas/editar/${despesa.id}`}>
                            <Button size="sm" variant="outline"><Edit className="w-4 h-4" /></Button>
                          </Link>
                          {/* Botão de Deletar */}
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(despesa.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>

                          {/* Botões de Comprovante */}
                          {isImage && (
                            <button
                              onClick={() => setViewingUrl(despesa.comprovanteImagemUrl)}
                              onMouseEnter={(e) => handleMouseEnter(e, despesa.comprovanteImagemUrl)}
                              onMouseLeave={handleMouseLeave}
                            >
                              <div className="p-0.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 hover:shadow-lg transition-shadow">
                                <div className="bg-white rounded-md px-3 py-1.5 flex items-center justify-center">
                                  <Image className="w-4 h-4 mr-2 text-blue-600" />
                                  <span className="text-sm font-semibold text-blue-600">Imagem</span>
                                </div>
                              </div>
                            </button>
                          )}
                          {isPdf && (
                            <button
                              onClick={() => setViewingUrl(despesa.notaFiscalUrl)}
                              onMouseEnter={(e) => handleMouseEnter(e, despesa.notaFiscalUrl)}
                              onMouseLeave={handleMouseLeave}
                            >
                              <div className="p-0.5 rounded-lg bg-gradient-to-r from-red-500 to-orange-400 hover:shadow-lg transition-shadow">
                                <div className="bg-white rounded-md px-3 py-1.5 flex items-center justify-center">
                                  <File className="w-4 h-4 mr-2 text-red-600" />
                                  <span className="text-sm font-semibold text-red-600">PDF</span>
                                </div>
                              </div>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Componente de Preview em miniatura */}
      {hoveredFile && (
        <div
          className="fixed z-[100] p-1 bg-white rounded-lg shadow-2xl border border-slate-300 animate-in fade-in-0 zoom-in-95 pointer-events-none"
          style={{ top: hoverPosition.top, left: hoverPosition.left }}
        >
          {/\.(jpg|jpeg|png|gif|webp)$/i.test(hoveredFile) ?
            <img src={hoveredFile} className="max-w-xs max-h-48 rounded" alt="Preview" /> :
            <div className="p-4 flex items-center gap-2 max-w-xs">
              <File className="w-8 h-8 text-red-500 flex-shrink-0" />
              <span className="text-sm font-medium text-slate-700 truncate">{hoveredFile.split('/').pop()}</span>
            </div>
          }
        </div>
      )}

      {/* Modal de visualização principal */}
      {viewingUrl && <ComprovanteViewer url={viewingUrl} onClose={() => setViewingUrl(null)} />}
    </>
  );
}