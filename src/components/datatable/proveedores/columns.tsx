"use client";

import { proveedores } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

export function getProveedoresColumns(
  onEdit?: (proveedor: proveedores) => void,
): ColumnDef<proveedores>[] {
  return [
    {
      accessorKey: "label",
      header: "Nombre",
    },
    {
      header: "Acciones",
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-8 w-8 p-0"
          onClick={() => onEdit?.(row.original)}
        >
          <span className="sr-only">Editar</span>
          <Edit className="size-4" />
        </Button>
      ),
    },
  ];
}
