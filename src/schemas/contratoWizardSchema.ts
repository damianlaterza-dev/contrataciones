import { z } from "zod";

export const contratoStep1Schema = z.object({
  proveedor_id: z
    .number({ error: "El proveedor es requerido" })
    .int()
    .positive("El proveedor es requerido"),
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
    .number({ error: "Debe ser un número válido" })
    .positive("Debe ser mayor a 0"),
  valor_hora: z.number().positive("Debe ser mayor a 0").optional().nullable(),
  es_accesoridad: z.boolean().nullable(),
  contrato_principal_id: z.number().int().positive().optional().nullable(),
  observaciones: z.string().max(1000).optional().nullable(),
});

export const contratoWizardSchema = contratoStep1Schema;

export type ContratoStep1Data = z.infer<typeof contratoStep1Schema>;
export type ContratoWizardData = z.infer<typeof contratoWizardSchema>;

export const prorrogaSchema = z.object({
  contrato_id: z.number().int().positive("El contrato es requerido"),
  numero_expediente: z
    .string()
    .min(1, "El número de expediente es requerido")
    .max(100),
  fecha_fin: z.string().min(1, "La fecha de fin es requerida"),
  observacion: z.string().max(1000).optional().nullable(),
});

export const incrementoSchema = z.object({
  contrato_id: z.number().int().positive("El contrato es requerido"),
  horas_extra: z
    .number({ error: "Debe ser un número válido" })
    .positive("Debe ser mayor a 0"),
  numero_expediente: z
    .string()
    .min(1, "El número de expediente es requerido")
    .max(100),
  observacion: z.string().max(1000).optional().nullable(),
});

export type ProrrogaData = z.infer<typeof prorrogaSchema>;
export type IncrementoData = z.infer<typeof incrementoSchema>;
