import { z } from "zod";

export const proveedorSchema = z.object({
  label: z
    .string()
    .min(1, "El nombre es requerido")
    .max(150, "El nombre no puede exceder los 150 caracteres"),
  value: z
    .string()
    .min(1, "El valor es requerido")
    .max(150, "El valor no puede exceder los 150 caracteres"),
});

export type Proveedor = z.infer<typeof proveedorSchema>;
