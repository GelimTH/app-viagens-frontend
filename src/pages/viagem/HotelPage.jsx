import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Hotel, MapPin, Clock, Utensils, Wifi, Dumbbell } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start">
    <Icon className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
    <div className="ml-4">
      <p className="font-semibold text-slate-800">{label}</p>
      <p className="text-slate-600">{value}</p>
    </div>
  </div>
);

export default function HotelViagemPage() {
  const { dadosViagem } = useOutletContext();

  if (!dadosViagem) return <Loader2 className="w-5 h-5 animate-spin" />;

  const { hotelInfo } = dadosViagem.viagem;

  if (!hotelInfo) {
    return (
      <Card className="border-0 shadow-xl bg-white max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Informações de Hospedagem</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-center py-4">
            Nenhuma informação de hotel cadastrada para esta viagem.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-white max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hotel className="w-6 h-6 text-purple-600" />
          {hotelInfo.nomeHotel}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <InfoItem 
          icon={MapPin} 
          label="Endereço" 
          value={hotelInfo.endereco} 
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoItem 
            icon={Clock} 
            label="Check-in" 
            value={format(new Date(hotelInfo.checkIn), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} 
          />
          <InfoItem 
            icon={Clock} 
            label="Check-out" 
            value={format(new Date(hotelInfo.checkOut), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} 
          />
        </div>
        {hotelInfo.horarioCafe && (
          <InfoItem icon={Utensils} label="Café da Manhã" value={hotelInfo.horarioCafe} />
        )}
        {hotelInfo.servicosInclusos && (
          <InfoItem icon={Wifi} label="Serviços Inclusos" value={hotelInfo.servicosInclusos} />
        )}
        {hotelInfo.eventosMissao && (
          <InfoItem icon={Dumbbell} label="Eventos da Missão no Hotel" value={hotelInfo.eventosMissao} />
        )}
      </CardContent>
    </Card>
  );
}