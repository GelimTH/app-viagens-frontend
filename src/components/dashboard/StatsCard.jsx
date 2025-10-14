import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const colorClasses = {
  blue: {
    bg: "bg-blue-500",
    light: "bg-blue-50",
    text: "text-blue-600"
  },
  green: {
    bg: "bg-green-500",
    light: "bg-green-50",
    text: "text-green-600"
  },
  orange: {
    bg: "bg-orange-500",
    light: "bg-orange-50",
    text: "text-orange-600"
  },
  red: {
    bg: "bg-red-500",
    light: "bg-red-50",
    text: "text-red-600"
  }
};

export default function StatsCard({ title, value, icon: Icon, color, trend }) {
  const colors = colorClasses[color];
  
  return (
    <Card className="border-0 shadow-xl bg-white overflow-hidden hover:shadow-2xl transition-shadow duration-300">
      <div className={`absolute top-0 right-0 w-32 h-32 ${colors.bg} opacity-5 rounded-full transform translate-x-12 -translate-y-12`} />
      <CardContent className="p-6 relative">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
          </div>
          <div className={`${colors.light} ${colors.text} p-3 rounded-2xl`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-600 font-medium">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}