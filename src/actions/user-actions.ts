"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleUserAccess(userId: number) {
  const session = await auth();

  if (!session?.user) {
    return { success: false, message: "No autorizado" };
  }

  const currentUserId = Number(session.user.id);
  const currentUserRole = session.user.role_id;

  if (userId === currentUserId) {
    return {
      success: false,
      message: "No puedes cambiar el estado de tu propio usuario",
    };
  }

  try {
    const targetUser = await prisma.users.findUnique({
      where: { id: userId },
      select: { role_id: true, deleted_at: true },
    });

    if (!targetUser) {
      return { success: false, message: "Usuario no encontrado" };
    }

    if (currentUserRole > targetUser.role_id) {
      return {
        success: false,
        message: "No tienes permisos para modificar a este usuario",
      };
    }

    const isCurrentlyDisabled = !!targetUser.deleted_at;
    const newDeletedAt = isCurrentlyDisabled ? null : new Date();

    await prisma.users.update({
      where: { id: userId },
      data: { deleted_at: newDeletedAt },
    });

    revalidatePath("/usuarios");
    return {
      success: true,
      message: isCurrentlyDisabled
        ? "Usuario habilitado correctamente"
        : "Usuario deshabilitado correctamente",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Error interno" };
  }
}

export async function updateUserRole(userId: number, newRoleId: number) {
  const session = await auth();

  if (!session?.user) {
    return { success: false, message: "No autorizado" };
  }

  const currentUserId = Number(session.user.id);
  const currentUserRole = session.user.role_id;

  if (userId === currentUserId) {
    return { success: false, message: "No puedes editar tu propio rol" };
  }

  try {
    const targetUser = await prisma.users.findUnique({
      where: { id: userId },
      select: { role_id: true },
    });

    if (!targetUser) {
      return { success: false, message: "Usuario no encontrado" };
    }

    // Permission check: Can I modify this user? matching the "toggle" logic.
    if (currentUserRole > targetUser.role_id) {
      return {
        success: false,
        message: "No tienes permisos para modificar a este usuario",
      };
    }

    // Also check if I can assign the new role?
    // Usually I shouldn't be able to promote someone to a role higher than mine.
    // e.g. Admin (2) assigning SuperAdmin (1).
    if (newRoleId < currentUserRole) {
      // Lower ID means higher role
      return {
        success: false,
        message: "No puedes asignar un rol superior al tuyo",
      };
    }

    await prisma.users.update({
      where: { id: userId },
      data: { role_id: newRoleId },
    });

    revalidatePath("/usuarios");
    return { success: true, message: "Rol actualizado correctamente" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Error interno" };
  }
}
