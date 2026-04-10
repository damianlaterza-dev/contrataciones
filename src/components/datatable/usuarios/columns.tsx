"use client";

import { TUsuarios } from "@/@types/data";
import { UserRoleBadge } from "@/components/badges/BadgeRole"; // Fixed casing
import { ActionsCell } from "./ActionsCell";
import { ColumnDef } from "@tanstack/react-table";

export function getUsuariosColumns(
  isDev: boolean,
  onEdit?: (user: TUsuarios) => void,
): ColumnDef<TUsuarios>[] {
  const columns: ColumnDef<TUsuarios>[] = [
    {
      accessorKey: "full_name",
      header: "Nombre completo",
    },
    {
      accessorKey: "email",
      header: "Mail",
    },
    {
      accessorKey: "role_id",
      header: "Rol",
      cell: ({ row }) => {
        const { role_id } = row.original;
        return <UserRoleBadge role_id={String(role_id)} />;
      },
    },
  ];
  if (isDev) {
    columns.push(
      {
        accessorKey: "last_login_at",
        header: "Último inicio de sesión",
      },
      {
        header: "Acciones",
        id: "actions",
        cell: ({ row }) => <ActionsCell user={row.original} onEdit={onEdit} />,
      },
    );
  } else {
    columns.push({
      header: "Acciones",
      id: "actions",
      cell: ({ row }) => <ActionsCell user={row.original} onEdit={onEdit} />,
    });
  }

  return columns;
}
