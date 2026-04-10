import { z } from "zod";

export const contratoSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre del contrato es requerido")
    .max(150, "Máximo 150 caracteres"),
  numero_expediente: z
    .string()
    .min(1, "El número de expediente es requerido")
    .max(100, "Máximo 100 caracteres"),
  fecha_inicio: z.string().min(1, "La fecha de inicio es requerida"),
  fecha_fin: z.string().min(1, "La fecha de fin es requerida"),
  cantidad_horas: z
    .int({ error: "Debe ser un número entero" })
    .min(1, "Debe ser mayor a 0"),
  valor_hora: z
    .number({ error: "Debe ser un número" })
    .positive("Debe ser mayor a 0")
    .optional()
    .nullable(),
  es_accesoridad: z.boolean().nullable(),
  contrato_principal_id: z.number().int().positive().optional().nullable(),
  observaciones: z.string().max(1000).optional().nullable(),
});

export type ContratoFormData = z.infer<typeof contratoSchema>;
