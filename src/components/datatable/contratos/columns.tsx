"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { formatDate } from "@/lib/utils";

export type TProrroga = {
  id: number;
  numero_expediente: string | null;
  fecha_fin: Date;
  observacion: string | null;
  created_at: Date;
};

export type TIncremento = {
  id: number;
  horas_extra: number;
  numero_expediente: string | null;
  observacion: string | null;
  created_at: Date;
};

export type TContrato = {
  id: number;
  nombre: string;
  numero_expediente: string;
  fecha_inicio: Date;
  fecha_fin: Date;
  cantidad_horas: number;
  valor_hora: number | null;
  es_accesoridad: boolean | null;
  contrato_principal_id: number | null;
  observaciones: string | null;
  fecha_fin_vigente: Date;
  horas_totales: number;
  horas_asignadas: number;
  horas_disponibles: number;
  proyecto_ids: number[];
  valor_hora_vigente: number | null;
  prorrogas: TProrroga[];
  incrementos: TIncremento[];
  accesorios_count: number;
};

type ColumnCallbacks = {
  onVerDetalle: (contrato: TContrato) => void;
  onAgregarProrroga: (contrato: TContrato) => void;
  onAgregarIncremento: (contrato: TContrato) => void;
};

export function getContratosColumns({
  onVerDetalle,
  onAgregarProrroga,
  onAgregarIncremento,
}: ColumnCallbacks): ColumnDef<TContrato>[] {
  return [
    {
      accessorKey: "nombre",
      header: "Nombre y N° Expte.",
      cell: ({ row }) => {
        return (
          <div
            className="flex flex-col gap-0.5 min-w-0"
            title={row.original.nombre}>
            <p className="line-clamp-2">{row.original.nombre}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.numero_expediente}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "fecha_inicio",
      header: "Fecha inicio",
      cell: ({ row }) => formatDate(row.original.fecha_inicio),
    },
    {
      accessorKey: "fecha_fin",
      header: "Fecha fin",
      cell: ({ row }) => formatDate(row.original.fecha_fin),
    },
    {
      id: "vencimiento_vigente",
      header: "Fecha fin extendida",
      cell: ({ row }) => {
        const { fecha_fin, fecha_fin_vigente, prorrogas } = row.original;
        if (prorrogas.length === 0) {
          return <span className="text-muted-foreground">—</span>;
        }
        if (
          String(fecha_fin).slice(0, 10) ===
          String(fecha_fin_vigente).slice(0, 10)
        ) {
          return <span className="text-muted-foreground">—</span>;
        }
        return formatDate(fecha_fin_vigente);
      },
    },
    {
      accessorKey: "cantidad_horas",
      header: "Hs. Contrato",
      cell: ({ row }) => (
        <span className="tabular-nums">
          {row.original.cantidad_horas.toLocaleString("es-AR")}
        </span>
      ),
    },
    {
      id: "horas_totales",
      header: "Hs. Totales",
      cell: ({ row }) => {
        const { cantidad_horas, horas_totales, incrementos } = row.original;
        const extra = horas_totales - cantidad_horas;
        return (
          <span className="tabular-nums">
            {horas_totales.toLocaleString("es-AR")}
            {incrementos.some((inc) => inc.horas_extra > 0) && (
              <span className="ml-1 text-xs text-muted-foreground">
                (+{extra.toLocaleString("es-AR")})
              </span>
            )}
          </span>
        );
      },
    },
    {
      id: "valor_hora_vigente",
      header: "$ / Hora",
      cell: ({ row }) => {
        const valor = row.original.valor_hora_vigente;
        if (!valor) {
          return <span className="text-muted-foreground">—</span>;
        }
        return (
          <span className="tabular-nums">
            {valor.toLocaleString("es-AR", {
              style: "currency",
              currency: "ARS",
              minimumFractionDigits: 2,
            })}
          </span>
        );
      },
    },
    {
      id: "prorrogas",
      header: "Prórrogas",
      cell: ({ row }) => {
        const tiene = row.original.prorrogas.length > 0;
        return (
          <Badge variant={tiene ? "success" : "danger"}>
            {tiene ? "Si" : "No"}
          </Badge>
        );
      },
    },
    {
      id: "incrementos",
      header: "Incrementos",
      cell: ({ row }) => {
        const tiene = row.original.incrementos.length > 0;
        return (
          <Badge variant={tiene ? "success" : "danger"}>
            {tiene ? "Si" : "No"}
          </Badge>
        );
      },
    },
    {
      id: "accesoridad",
      header: "Accesoridad",
      cell: ({ row }) => {
        const tiene =
          !!row.original.es_accesoridad || row.original.accesorios_count > 0;
        return (
          <Badge variant={tiene ? "success" : "danger"}>
            {tiene ? "Si" : "No"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="h-8 w-8">
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Acciones</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onVerDetalle(row.original)}>
              Ver detalle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAgregarProrroga(row.original)}>
              Agregar prórroga
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAgregarIncremento(row.original)}>
              Agregar incremento hs
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
