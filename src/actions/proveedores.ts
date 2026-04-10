"use server";

import { proveedorSchema, type Proveedor } from "@/schemas/proveedorSchema";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProveedor(data: Proveedor) {
  const result = proveedorSchema.safeParse(data);

  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {};
    result.error.issues.forEach((issue) => {
      if (issue.path.length > 0) {
        const key = issue.path[0].toString();
        if (!fieldErrors[key]) {
          fieldErrors[key] = [];
        }
        fieldErrors[key].push(issue.message);
      }
    });
    return { success: false, message: "Datos inválidos", errors: fieldErrors };
  }

  const { label, value } = result.data;

  try {
    const existing = await prisma.proveedores.findFirst({
      where: { label: { equals: label }, deleted_at: null },
    });

    if (existing) {
      return {
        success: false,
        message: "Ya existe un proveedor con ese nombre",
      };
    }

    await prisma.proveedores.create({ data: { label, value } });
    revalidatePath("/proveedores");

    return {
      success: true,
      message: "El proveedor ha sido creado correctamente",
    };
  } catch (error) {
    console.error("Error creating proveedor:", error);
    return {
      success: false,
      message: "Ha ocurrido un error al crear el proveedor",
    };
  }
}

export async function deleteProveedor(id: number) {
  try {
    await prisma.proveedores.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
    revalidatePath("/proveedores");
    return { success: true, message: "El proveedor ha sido eliminado" };
  } catch (error) {
    console.error("Error deleting proveedor:", error);
    return {
      success: false,
      message: "Ha ocurrido un error al eliminar el proveedor",
    };
  }
}

export async function updateProveedor(id: number, data: Proveedor) {
  const result = proveedorSchema.safeParse(data);

  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {};
    result.error.issues.forEach((issue) => {
      if (issue.path.length > 0) {
        const key = issue.path[0].toString();
        if (!fieldErrors[key]) {
          fieldErrors[key] = [];
        }
        fieldErrors[key].push(issue.message);
      }
    });
    return { success: false, message: "Datos inválidos", errors: fieldErrors };
  }

  const { label, value } = result.data;

  try {
    const existing = await prisma.proveedores.findFirst({
      where: { label: { equals: label }, NOT: { id }, deleted_at: null },
    });

    if (existing) {
      return {
        success: false,
        message: "Ya existe un proveedor con ese nombre",
      };
    }

    await prisma.proveedores.update({
      where: { id },
      data: { label, value, updated_at: new Date() },
    });
    revalidatePath("/proveedores");

    return {
      success: true,
      message: "El proveedor ha sido actualizado correctamente",
    };
  } catch (error) {
    console.error("Error updating proveedor:", error);
    return {
      success: false,
      message: "Ha ocurrido un error al actualizar el proveedor",
    };
  }
}
