"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, History } from "lucide-react";

interface CashMetricsProps {
  stats: {
    totalSales: number;
    totalExpenses: number;
    closedSessionsCount: number;
  } | null | undefined;
}

export default function CashMetrics({ stats }: CashMetricsProps) {
  // Si stats no ha llegado aún, no renderizamos nada para evitar errores
  if (!stats) return <div className="p-4 border-2 border-red-500">NO HAY DATOS (STATS ES NULL)</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* TARJETA DE VENTAS */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ventas del Día</CardTitle>
          <DollarSign className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">
            ${(stats?.totalSales ?? 0).toLocaleString('es-CO')}
          </div>
        </CardContent>
      </Card>

      {/* TARJETA DE GASTOS */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gastos del Día</CardTitle>
          <TrendingUp className="h-4 w-4 text-rose-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-rose-600">
            ${(stats?.totalExpenses ?? 0).toLocaleString('es-CO')}
          </div>
        </CardContent>
      </Card>

      {/* TARJETA DE SESIONES */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sesiones Cerradas</CardTitle>
          <History className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {stats?.closedSessionsCount ?? 0}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}