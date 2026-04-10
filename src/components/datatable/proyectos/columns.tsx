"use client";

import { StatusBadge } from "@/components/badges/badgeStatus";
import { ContratacionStatusBadge } from "@/components/badges/badgeContratacionStatus";
import { ColumnDef } from "@tanstack/react-table";

export type TProyecto = {
  id: number;
  nombre: string;
  estado_id: number;
  estado_contratacion_id: number;
  area_id: number;
  areas: {
    nombre: string;
  };
  contrato_proyectos: {
    contratos: {
      proveedores: {
        id: number;
        label: string;
      };
    };
  }[];
};

export const Proyectoscolumns: ColumnDef<TProyecto>[] = [
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
    accessorKey: "estado_contratacion_id",
    header: "Estado contratación",
    cell: ({ row }) => {
      return <ContratacionStatusBadge status={row.original.estado_contratacion_id} />;
    },
  },
  {
    accessorKey: "estado_id",
    header: "Estado proyecto",
    cell: ({ row }) => {
      return <StatusBadge status={row.original.estado_id} />;
    },
  },
];
