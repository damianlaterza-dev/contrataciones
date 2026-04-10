import { z } from "zod";

export const userRoles = [
  "Usuario",
  "Admin",
  "Super Admin",
  "Invitado",
  "Developer",
] as const;

export const userSchema = z.object({
  nombreCompleto: z
    .string()
    .min(1, "El nombre completo es requerido")
    .max(100, "El nombre completo no puede exceder los 100 caracteres"),
  email: z.email("Ingrese un email válido").min(1, "El email es requerido"),
  rol: z.enum(userRoles, { message: "Seleccione un rol válido" }),
});

export type User = z.infer<typeof userSchema>;
export type UserRole = (typeof userRoles)[number];
