import { z } from "zod";

const usoMensualItemSchema = z.object({
  anio: z.number().int(),
  mes: z.number().int().min(1).max(12),
  horas_estimadas: z
    .number({ error: "Ingresá un valor válido" })
    .positive("Debe ser mayor a 0")
    .optional(),
});

export const proyectoSchema = z
  .object({
    nombre: z
      .string()
      .min(1, "El nombre del proyecto es requerido")
      .max(150, "Máximo 150 caracteres"),
    area_id: z
      .number({ error: "El área es requerida" })
      .int()
      .positive("El área es requerida"),
    contrato_id: z
      .number({ error: "El contrato es requerido" })
      .int()
      .positive("El contrato es requerido"),
    horas_proyectadas: z
      .number({ error: "Ingresá un valor válido" })
      .positive("Debe ser mayor a 0"),
    fecha_inicio: z.string().min(1, "La fecha de inicio es requerida"),
    fecha_fin: z.string().min(1, "La fecha de fin es requerida"),
    uso_mensual: z
      .array(usoMensualItemSchema)
      .superRefine((items, ctx) => {
        items.forEach((item, i) => {
          if (item.horas_estimadas == null) {
            ctx.addIssue({
              code: "custom",
              message: "Ingresá las horas estimadas",
              path: [i, "horas_estimadas"],
            });
          }
        });
      })
      .optional(),
  })
  .refine(
    (data) => {
      if (data.contrato_id && !data.horas_proyectadas) return false;
      return true;
    },
    {
      message: "Las horas proyectadas son requeridas al asignar un contrato",
      path: ["horas_proyectadas"],
    },
  )
  .refine(
    (data) => {
      if (!data.fecha_inicio || !data.fecha_fin) return true;
      return new Date(data.fecha_fin) >= new Date(data.fecha_inicio);
    },
    {
      message: "La fecha de fin debe ser posterior a la fecha de inicio",
      path: ["fecha_fin"],
    },
  )
  .refine(
    (data) => {
      if (!data.horas_proyectadas) return true;
      const total = parseFloat(
        (data.uso_mensual ?? [])
          .reduce((sum, u) => sum + (u.horas_estimadas ?? 0), 0)
          .toFixed(6),
      );
      return Math.abs(total - data.horas_proyectadas) < 0.001;
    },
    {
      message:
        "La suma de horas mensuales debe ser igual a las horas proyectadas del proyecto",
      path: ["uso_mensual"],
    },
  );

export type ProyectoData = z.infer<typeof proyectoSchema>;
export type UsoMensualItem = z.infer<typeof usoMensualItemSchema>;

export const proyectoProrrogaSchema = z.object({
  proyecto_id: z.number().int().positive("El proyecto es requerido"),
  fecha_fin: z.string().min(1, "La fecha de fin es requerida"),
  numero_expediente: z.string().max(100).optional().nullable(),
  observacion: z.string().max(1000).optional().nullable(),
  uso_mensual: z.array(
    z.object({
      anio: z.number().int(),
      mes: z.number().int().min(1).max(12),
      horas_estimadas: z
        .number({ error: "Ingresá un valor válido" })
        .min(0, "Debe ser 0 o mayor"),
    }),
  ),
});

export type ProyectoProrrogaData = z.infer<typeof proyectoProrrogaSchema>;
