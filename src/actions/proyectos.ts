"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { proyectoSchema, type ProyectoData } from "@/schemas/proyectoSchema";

// estado_id 5 = sin_asignar (default estado proyecto)
// estado_contratacion_id 1 = en_proceso (default estado contratacion)
const DEFAULT_ESTADO_PROYECTO_ID = 5;
const DEFAULT_ESTADO_CONTRATACION_ID = 1;

export async function createProyecto(data: ProyectoData) {
  const result = proyectoSchema.safeParse(data);
  if (!result.success) {
    return { success: false, message: "Datos inválidos" };
  }

  const { nombre, area_id, contrato_id, horas_proyectadas, uso_mensual } =
    result.data;

  try {
    await prisma.$transaction(async (tx) => {
      const proyecto = await tx.proyectos.create({
        data: {
          nombre,
          area_id,
          estado_id: DEFAULT_ESTADO_PROYECTO_ID,
          estado_contratacion_id: DEFAULT_ESTADO_CONTRATACION_ID,
        },
      });

      if (contrato_id && horas_proyectadas) {
        const contrato = await tx.contratos.findUnique({
          where: { id: contrato_id },
          select: {
            cantidad_horas: true,
            incrementos: { select: { horas_extra: true } },
            proyectos: { select: { horas_proyectadas: true } },
          },
        });

        if (!contrato) {
          throw new Error("Contrato no encontrado");
        }

        const horasExtra = contrato.incrementos.reduce(
          (sum: number, inc: { horas_extra: number }) => sum + inc.horas_extra,
          0,
        );
        const horasTotales = contrato.cantidad_horas + horasExtra;
        const horasAsignadas = contrato.proyectos.reduce(
          (sum, p) => sum + p.horas_proyectadas,
          0,
        );
        const horasDisponibles = Math.max(horasTotales - horasAsignadas, 0);

        if (horas_proyectadas > horasDisponibles) {
          throw new Error(
            `Las horas proyectadas superan las horas disponibles del contrato (${horasDisponibles} hs)`,
          );
        }

        const cp = await tx.contrato_proyectos.create({
          data: {
            contrato_id,
            proyecto_id: proyecto.id,
            horas_proyectadas,
          },
        });

        const registrosMensuales = (uso_mensual ?? []).filter(
          (u) => u.horas_estimadas != null,
        );
        if (registrosMensuales.length > 0) {
          await tx.uso_mensual.createMany({
            data: registrosMensuales.map((u) => ({
              contrato_proyecto_id: cp.id,
              anio: u.anio,
              mes: u.mes,
              horas_estimadas: u.horas_estimadas!,
            })),
          });
        }
      }
    });

    revalidatePath("/proyectos");
    return { success: true, message: "Proyecto creado correctamente" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al crear el proyecto";
    return { success: false, message };
  }
}
