"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AlertTriangle, FileText } from "lucide-react";

type ContratoInfo = {
  id: number;
  numero_expediente: string;
  horas_totales: number;
  valor_hora: number | null;
  fecha_fin: string;
  suma_proyectada: number;
};

type Props = {
  contratos: ContratoInfo[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(dateStr: string) {
  try {
    return format(new Date(dateStr + "T00:00:00"), "dd/MM/yyyy", {
      locale: es,
    });
  } catch {
    return dateStr;
  }
}

export function ContratoPanelInfo({ contratos }: Props) {
  if (contratos.length === 0) {
    return (
      <div className="border rounded-lg p-4 text-sm text-muted-foreground">
        Sin contratos asociados.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {contratos.map((c) => {
        const disponible = c.horas_totales - c.suma_proyectada;
        const porcentaje = Math.min(
          100,
          Math.round((c.suma_proyectada / c.horas_totales) * 100),
        );
        const isOver = c.suma_proyectada > c.horas_totales;

        return (
          <div key={c.id} className="border rounded-lg p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start gap-2">
              <FileText size={16} className="mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <p className="font-semibold text-sm leading-tight">
                  {c.numero_expediente}
                </p>
                <p className="text-xs text-muted-foreground">
                  Vence: {formatDate(c.fecha_fin)}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hs. contrato</span>
                <span className="tabular-nums font-medium">
                  {c.horas_totales.toLocaleString()}
                </span>
              </div>
              {c.valor_hora != null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor/hora</span>
                  <span className="tabular-nums">
                    {formatCurrency(c.valor_hora)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Proyectado</span>
                <span
                  className={cn(
                    "tabular-nums font-medium",
                    isOver ? "text-destructive" : "",
                  )}
                >
                  {c.suma_proyectada.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Disponible</span>
                <span
                  className={cn(
                    "tabular-nums font-medium",
                    disponible < 0 ? "text-destructive" : "text-emerald-600",
                  )}
                >
                  {disponible.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    isOver ? "bg-destructive" : "bg-primary",
                  )}
                  style={{ width: `${porcentaje}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-right">
                {porcentaje}% utilizado
              </p>
            </div>

            {/* Alerta si se pasa */}
            {isOver && (
              <div className="flex items-center gap-1.5 text-xs text-destructive bg-destructive/10 rounded px-2 py-1.5">
                <AlertTriangle size={12} />
                <span>
                  Las horas proyectadas superan el contrato por{" "}
                  {Math.abs(disponible).toLocaleString()} hs
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
