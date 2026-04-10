"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TContrato } from "@/components/datatable/contratos/columns";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, DollarSign } from "lucide-react";
import { formatDate } from "@/lib/utils";

function formatFecha(date: Date | string) {
  return formatDate(date);
}

function formatPesos(valor: number | null) {
  if (!valor) return "—";
  return valor.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  });
}

type Props = {
  contrato: TContrato;
  open: boolean;
  onClose: () => void;
};

export function ContratoDetalleModal({ contrato, open, onClose }: Props) {
  const tieneProrrogas = contrato.prorrogas.length > 0;
  const tieneIncrementos = contrato.incrementos.length > 0;
  const tieneAccesoridad =
    contrato.es_accesoridad || contrato.accesorios_count > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            {contrato.numero_expediente}
            {tieneProrrogas && (
              <Badge variant="secondary">
                {contrato.prorrogas.length}{" "}
                {contrato.prorrogas.length === 1 ? "prórroga" : "prórrogas"}
              </Badge>
            )}
            {tieneIncrementos && (
              <Badge variant="secondary">
                {contrato.incrementos.length}{" "}
                {contrato.incrementos.length === 1
                  ? "incremento"
                  : "incrementos"}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>Historial completo del contrato</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 overflow-y-auto pr-1">
          {/* Contrato original */}
          <div className="rounded-lg border p-4 flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Contrato original
            </p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <CalendarDays size={14} />
                {formatFecha(contrato.fecha_inicio)} →{" "}
                {formatFecha(contrato.fecha_fin)}
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock size={14} />
                {contrato.cantidad_horas.toLocaleString("es-AR")} hs
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <DollarSign size={14} />
                {formatPesos(contrato.valor_hora)}/h
              </span>
            </div>
            {contrato.observaciones && (
              <p className="text-xs text-muted-foreground italic">
                {contrato.observaciones}
              </p>
            )}
          </div>

          {/* Prórrogas */}
          {tieneProrrogas && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Prórrogas
              </p>
              {contrato.prorrogas.map((p, i) => (
                <div
                  key={p.id}
                  className="rounded-lg border border-dashed p-4 flex flex-col gap-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Prórroga {i + 1} —{" "}
                    {new Date(p.created_at).toLocaleDateString("es-AR")}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays
                        size={14}
                        className="text-muted-foreground"
                      />
                      Nueva fecha fin: {formatFecha(p.fecha_fin)}
                    </span>
                    {p.numero_expediente && (
                      <span className="flex items-center gap-1.5">
                        Expediente: {p.numero_expediente}
                      </span>
                    )}
                  </div>
                  {p.observacion && (
                    <p className="text-xs text-muted-foreground italic">
                      {p.observacion}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Incrementos de horas */}
          {tieneIncrementos && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Incrementos de horas
              </p>
              {contrato.incrementos.map((inc, i) => (
                <div
                  key={inc.id}
                  className="rounded-lg border border-dashed p-4 flex flex-col gap-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Incremento {i + 1} —{" "}
                    {new Date(inc.created_at).toLocaleDateString("es-AR")}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} className="text-muted-foreground" />+
                      {inc.horas_extra.toLocaleString("es-AR")} hs
                    </span>
                    {inc.numero_expediente && (
                      <span className="flex items-center gap-1.5">
                        Expediente: {inc.numero_expediente}
                      </span>
                    )}
                  </div>
                  {inc.observacion && (
                    <p className="text-xs text-muted-foreground italic">
                      {inc.observacion}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Accesoridad */}
          {tieneAccesoridad && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Accesoridad
              </p>
              <div className="flex gap-2 flex-wrap">
                {contrato.es_accesoridad && (
                  <Badge variant="outline">Es accesorio</Badge>
                )}
                {contrato.accesorios_count > 0 && (
                  <Badge variant="secondary">
                    Tiene {contrato.accesorios_count}{" "}
                    {contrato.accesorios_count === 1
                      ? "accesorio"
                      : "accesorios"}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Resumen vigente */}
          <div className="rounded-lg bg-muted/50 p-4 flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Estado vigente
            </p>
            <div className="grid grid-cols-3 gap-4 text-sm font-medium">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={14} className="text-primary" />
                {formatFecha(contrato.fecha_fin_vigente)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-primary" />
                {contrato.horas_totales.toLocaleString("es-AR")} hs
              </span>
              <span className="flex items-center gap-1.5">
                <DollarSign size={14} className="text-primary" />
                {formatPesos(contrato.valor_hora_vigente)}/h
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
