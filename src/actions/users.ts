"use server";

import { userSchema, type User } from "@/schemas/userSchema";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createUser(data: User) {
  const result = userSchema.safeParse(data);

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

    return {
      success: false,
      message: "Datos inválidos",
      errors: fieldErrors,
    };
  }

  const { nombreCompleto, email, rol } = result.data;

  try {
    // Verificar si el usuario ya existe
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        message: "El email ya está registrado",
      };
    }

    const roleRecord = await prisma.roles.findFirst({
      where: {
        OR: [{ value: rol }, { label: rol }],
      },
    });

    if (!roleRecord) {
      return {
        success: false,
        message: "Rol no válido o no encontrado",
      };
    }

    // Crear el usuario
    await prisma.users.create({
      data: {
        full_name: nombreCompleto,
        email: email,
        role_id: roleRecord.id,
      },
    });

    revalidatePath("/usuarios");

    return {
      success: true,
      message: "El usuario ha sido creado correctamente",
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: false,
      message: "Ha ocurrido un error al crear el usuario",
    };
  }
}
