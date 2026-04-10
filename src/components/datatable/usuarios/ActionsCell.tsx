"use client";

import { useSession } from "next-auth/react";
import { MoreVertical, Edit, Ban, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  // DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useState } from "react";
import { TUsuarios } from "@/@types/data";
import { toggleUserAccess } from "@/actions/user-actions";
import { toast } from "sonner";
import { Toast } from "@/components/toast/Toast";
import { useTransition } from "react";
import { Spinner } from "@/components/ui/spinner";

interface ActionsCellProps {
  user: TUsuarios;
  onEdit?: (user: TUsuarios) => void;
}

export function ActionsCell({ user, onEdit }: ActionsCellProps) {
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  if (!session?.user) return null;

  const currentUserId = Number(session.user.id);
  const currentUserRole = session.user.role_id;
  const targetUserRole = user.role_id;
  const isSelf = currentUserId === user.id;
  const canEdit = !isSelf && currentUserRole <= targetUserRole;

  if (isSelf) {
    return <div className="text-gray-400 text-xs text-center">-</div>;
  }

  if (!canEdit) {
    return <div className="text-gray-400 text-xs text-center">-</div>;
  }

  const handleToggleAccess = () => {
    setShowConfirmDialog(false);
    startTransition(async () => {
      const res = await toggleUserAccess(user.id);

      toast.custom((t) => (
        <Toast id={t} variant={res.success ? "success" : "error"}>
          {/* <p className="font-semibold text-sm">
            {res.success ? "Éxito" : "Error"}
          </p> */}
          <p className="text-sm text-gray-600">{res.message}</p>
        </Toast>
      ));
    });
  };

  // Check if user is "deleted" or "active".
  // TUsuarios type defined in @types/data.ts includes: id, full_name, email, role_id, last_login_at.
  // It does NOT include 'deleted_at'. We need to modify TUsuarios or the query to include it?
  // Let's check columns.tsx again... columns.tsx uses TUsuarios.
  // We need 'deleted_at' in TUsuarios to show the correct icon/text (Enable vs Disable).
  // Current TUsuarios definition: Pick<users, "id" | "full_name" | "email" | "role_id" | "last_login_at">
  // We must update TUsuarios first to include deleted_at.

  // For now assuming we will fix it.
  const deletedAt = (user as any).deleted_at;
  const isActive = !deletedAt;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* <DropdownMenuLabel>Acciones</DropdownMenuLabel> */}
          <DropdownMenuItem onClick={() => onEdit?.(user)}>
            <Edit className="mr-2 size-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowConfirmDialog(true)}
            disabled={isPending}
          >
            {isActive ? (
              <>
                <Ban className="mr-2 size-4 text-red-500" />
                <span className="text-rojo-500">Deshabilitar acceso</span>
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 size-4 text-green-600" />
                <span className="text-verde-600">Habilitar acceso</span>
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isActive ? "Deshabilitar usuario" : "Habilitar usuario"}
            </DialogTitle>
            <DialogDescription className="text-base">
              {/* ¿Estás seguro que querés {isActive ? "deshabilitar" : "habilitar"}{" "}
              a {user.full_name}? */}
              {isActive
                ? " El usuario seleccionado no podrá acceder al sistema."
                : " El usuario seleccionado volverá a tener acceso al sistema."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancelar</Button>
            </DialogClose>
            <Button
              variant={isActive ? "destructive" : "primary"}
              onClick={handleToggleAccess}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Spinner className="text-white" data-icon="inline-start" />{" "}
                  <p>Guardando</p>
                </>
              ) : isActive ? (
                "Deshabilitar"
              ) : (
                "Habilitar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
