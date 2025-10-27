import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { Link } from 'react-router-dom';
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Plane, Calendar, Bell, Settings, MapPin, Clock, Hotel, MessageSquare, 
  Loader2, AlertCircle, BookOpen, Megaphone 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
// 1. Importar os componentes do Card
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// 2. Componentes de Skeleton (esqueleto) atualizados com o estilo do projeto
const SkeletonLoader = ({ height = "h-6", width = "w-full", className = "" }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${height} ${width} ${className}`}></div>
);

const LoadingCard = () => (
  // 3. Aplicando shadow-xl e border-0
  <Card className="border-0 shadow-xl p-6 space-y-4">
    <SkeletonLoader height="h-8" width="w-3/4" />
    <div className="space-y-3">
      {[...Array(6)].map((_, i) => (
        <SkeletonLoader key={i} height="h-5" width="w-full" />
      ))}
    </div>
  </Card>
);

const LoadingWidget = () => (
  // 3. Aplicando shadow-xl e border-0
  <Card className="border-0 shadow-xl p-6 space-y-3">
    <SkeletonLoader height="h-6" width="w-1/2" />
    <SkeletonLoader height="h-4" width="w-full" />
    <SkeletonLoader height="h-4" width="w-3/4" />
    <SkeletonLoader height="h-4" width="w-2/3" />
  </Card>
);

export default function MinhaViagem() {
  const { data: user } = useQuery({ queryKey: ['currentUser'] });

  const { data, isLoading, error } = useQuery({
    queryKey: ['minhaViagem', user?.id],
    queryFn: api.getMinhaViagem,
    enabled: !!user?.id,
  });

  // 4. Estado de carregamento com o layout da página
  if (isLoading) {
    return (
      // 5. Aplicando o padding padrão da página
      <div className="p-6 md:p-8">
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
          <LoadingCard />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              // 3. Aplicando shadow-xl e border-0
              <Card key={i} className="border-0 shadow-xl p-4 flex flex-col items-center space-y-2 h-24">
                <SkeletonLoader height="h-8" width="w-8" className="rounded-full" />
                <SkeletonLoader height="h-4" width="w-16" />
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LoadingWidget />
            <LoadingWidget />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-600 flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        {error.response?.data?.error || "Ocorreu um erro ao buscar os dados da sua viagem."}
      </div>
    );
  }

  if (!data) {
    return <div className="p-8 text-slate-500">Nenhuma viagem encontrada.</div>;
  }

  const { viagem, gestor } = data;
  const diasFora = differenceInDays(new Date(viagem.dataVolta), new Date(viagem.dataIda)) + 1;

  const missionData = {
    title: `Sua Viagem para ${viagem.destino}`,
    airline: "LATAM Airlines (Placeholder)",
    departureDate: format(new Date(viagem.dataIda), "dd/MM/yyyy", { locale: ptBR }),
    returnDate: format(new Date(viagem.dataVolta), "dd/MM/yyyy", { locale: ptBR }),
    duration: `${diasFora} dia(s)`,
    manager: gestor.fullName,
    accommodation: "Grand Hotel São Paulo (Placeholder)"
  };

  const upcomingEvents = [
    { id: 1, title: "Reunião de Abertura", date: "15/03/2024", time: "14:00" },
    { id: 2, title: "Visita à Expo", date: "16/03/2024", time: "09:30" }
  ];
  const recentAnnouncements = [
    { id: 1, title: "Alteração no horário do café da manhã", date: "14/03/2024" },
    { id: 2, title: "Bem-vindos à Missão Expo 2025!", date: "13/03/2024" }
  ];

  // 6. JSX principal com componentes <Card> e estilos do projeto
  return (
    // 5. Aplicando o padding padrão da página
    <div className="p-6 md:p-8">
      {/* 7. Usando o container max-w-5xl, padrão do projeto */}
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* 8. Reintroduzindo o Header padrão das páginas */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Plane className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Minha Viagem</h1>
            <p className="text-slate-600">Olá, {user?.fullName?.split(' ')[0]}! Estes são os detalhes da sua viagem.</p>
          </div>
        </div>

        {/* C1: Resumo Logístico como Card */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900">{missionData.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Plane className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Companhia Aérea</p>
                    <p className="font-medium text-gray-900">{missionData.airline}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Data de Ida</p>
                    <p className="font-medium text-gray-900">{missionData.departureDate}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Data de Volta</p>
                    <p className="font-medium text-gray-900">{missionData.returnDate}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Duração</p>
                    <p className="font-medium text-gray-900">{missionData.duration}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Hospedagem</p>
                    <p className="font-medium text-gray-900">{missionData.accommodation}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">G</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gestor Responsável</p>
                    <p className="font-medium text-gray-900">{missionData.manager}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* C2: Central de Navegação (Botões como Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* 9. Aplicando o estilo de Card (bg-card, shadow-xl) aos botões */}
          <button className="bg-card rounded-xl shadow-xl border-0 p-4 flex flex-col items-center justify-center space-y-2 hover:shadow-2xl transition-shadow duration-200 h-24">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <span className="text-sm font-medium text-gray-900 text-center">Itinerário da Viagem</span>
          </button>
          
          <button className="bg-card rounded-xl shadow-xl border-0 p-4 flex flex-col items-center justify-center space-y-2 hover:shadow-2xl transition-shadow duration-200 h-24">
            <Hotel className="w-8 h-8 text-blue-600" />
            <span className="text-sm font-medium text-gray-900 text-center">Horários do Hotel</span>
          </button>
          
          <button className="bg-card rounded-xl shadow-xl border-0 p-4 flex flex-col items-center justify-center space-y-2 hover:shadow-2xl transition-shadow duration-200 h-24">
            <Megaphone className="w-8 h-8 text-blue-600" />
            <span className="text-sm font-medium text-gray-900 text-center">Mural de Comunicados</span>
          </button>
          
          <Link to="/app/perfil" className="bg-card rounded-xl shadow-xl border-0 p-4 flex flex-col items-center justify-center space-y-2 hover:shadow-2xl transition-shadow duration-200 h-24">
            <Settings className="w-8 h-8 text-blue-600" />
            <span className="text-sm font-medium text-gray-900 text-center">Configurações</span>
          </Link>
        </div>

        {/* C3: Dashboard de Widgets como Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Widget: Próximos Eventos */}
          <Card className="border-0 shadow-xl">
            {/* 10. Usando CardHeader e CardTitle para o título do widget */}
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-bold text-gray-900">Próximos Eventos</CardTitle>
              <Calendar className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent className="p-6">
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="border-l-4 border-blue-600 pl-3 py-1">
                      <p className="font-medium text-gray-900 text-sm">{event.title}</p>
                      <p className="text-xs text-gray-500">{event.date} • {event.time}</p>
                    </div>
                  ))}
                  {/* 11. Usando o componente Button com variant="link" */}
                  <Button variant="link" className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 p-0 h-auto">
                    Ver itinerário completo
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">Nenhum evento agendado no momento.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Widget: Últimos Comunicados */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-bold text-gray-900">Últimos Comunicados</CardTitle>
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent className="p-6">
              {recentAnnouncements.length > 0 ? (
                <div className="space-y-3">
                  {recentAnnouncements.map((announcement) => (
                    <div key={announcement.id} className="border-l-4 border-blue-600 pl-3 py-1">
                      <p className="font-medium text-gray-900 text-sm">{announcement.title}</p>
                      <p className="text-xs text-gray-500">{announcement.date}</p>
                    </div>
                  ))}
                  <Button variant="link" className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 p-0 h-auto">
                    Ver todos os comunicados
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">Nenhum aviso novo.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};