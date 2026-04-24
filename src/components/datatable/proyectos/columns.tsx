"use client";

import { StatusBadge } from "@/components/badges/badgeStatus";
import { ContratacionStatusBadge } from "@/components/badges/badgeContratacionStatus";
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

export type TProyectoProrroga = {
  id: number;
  numero_expediente: string | null;
  fecha_fin: Date;
  observacion: string | null;
  created_at: Date;
};

export type TProyecto = {
  id: number;
  nombre: string;
  estado_id: number;
  estado_contratacion_id: number;
  area_id: number;
  fecha_inicio: Date;
  fecha_fin: Date;
  fecha_fin_vigente: Date;
  horas_distribuidas: number;
  proyecto_prorrogas: TProyectoProrroga[];
  areas: {
    nombre: string;
  };
  contrato_proyectos: {
    id: number;
    horas_proyectadas: number;
    contratos: {
      id: number;
      fecha_fin: Date;
      fecha_fin_vigente: Date;
      proveedores: {
        id: number;
        label: string;
      };
    };
  }[];
};

type ColumnCallbacks = {
  onAgregarProrroga: (proyecto: TProyecto) => void;
};

export function getProyectosColumns({
  onAgregarProrroga,
}: ColumnCallbacks): ColumnDef<TProyecto>[] {
  return [
    {
      accessorKey: "nombre",
      header: "Nombre",
    },
    {
      accessorKey: "areas.nombre",
      header: "Área",
    },
    {
      id: "proveedor",
      header: "Proveedor",
      cell: ({ row }) => {
        const proveedores = row.original.contrato_proyectos.map(
          (cp) => cp.contratos.proveedores.label,
        );
        const unicos = [...new Set(proveedores)];
        if (unicos.length === 0) {
          return <span className="text-muted-foreground">—</span>;
        }
        return <span>{unicos.join(", ")}</span>;
      },
    },
    {
      id: "fechas",
      header: "Vigencia",
      cell: ({ row }) => {
        const p = row.original;
        const tieneProrrogas = p.proyecto_prorrogas.length > 0;
        return (
          <div className="flex flex-col gap-0.5 text-sm">
            <span>
              {formatDate(p.fecha_inicio)} al {formatDate(p.fecha_fin_vigente)}
            </span>
            {tieneProrrogas && (
              <span className="text-xs text-muted-foreground">
                Original: {formatDate(p.fecha_fin)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "prorrogas",
      header: "Prorrogas",
      cell: ({ row }) => {
        const tieneProrrogas = row.original.proyecto_prorrogas.length > 0;
        return (
          <Badge variant={tieneProrrogas ? "default" : "secondary"}>
            {tieneProrrogas ? "Sí" : "No"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "estado_contratacion_id",
      header: "Estado contratación",
      cell: ({ row }) => {
        return (
          <ContratacionStatusBadge
            status={row.original.estado_contratacion_id}
          />
        );
      },
    },
    {
      accessorKey: "estado_id",
      header: "Estado proyecto",
      cell: ({ row }) => {
        return <StatusBadge status={row.original.estado_id} />;
      },
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onAgregarProrroga(row.original)}>
                Agregar prórroga
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}

// Columnas estáticas sin callbacks (retrocompatibilidad)
export const Proyectoscolumns: ColumnDef<TProyecto>[] = getProyectosColumns({
  onAgregarProrroga: () => {},
});
