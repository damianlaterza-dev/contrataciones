"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  proyectoSchema,
  proyectoProrrogaSchema,
  type ProyectoData,
  type ProyectoProrrogaData,
} from "@/schemas/proyectoSchema";

// estado_id 5 = sin_asignar (default estado proyecto)
// estado_contratacion_id 1 = en_proceso (default estado contratacion)
const DEFAULT_ESTADO_PROYECTO_ID = 5;
const DEFAULT_ESTADO_CONTRATACION_ID = 1;

export async function createProyecto(data: ProyectoData) {
  const result = proyectoSchema.safeParse(data);
  if (!result.success) {
    return { success: false, message: "Datos inválidos" };
  }

  const {
    nombre,
    area_id,
    contrato_id,
    horas_proyectadas,
    fecha_inicio,
    fecha_fin,
    uso_mensual,
  } = result.data;

  try {
    await prisma.$transaction(async (tx) => {
      const contrato = await tx.contratos.findUnique({
        where: { id: contrato_id },
        select: {
          fecha_inicio: true,
          fecha_fin: true,
          cantidad_horas: true,
          incrementos: { select: { horas_extra: true } },
          proyectos: { select: { horas_proyectadas: true } },
          prorrogas: { select: { fecha_fin: true }, orderBy: { created_at: "asc" } },
        },
      });

      if (!contrato) throw new Error("Contrato no encontrado");

      const contratoFechaFinVigente =
        contrato.prorrogas.at(-1)?.fecha_fin ?? contrato.fecha_fin;

      const proyFechaInicio = new Date(fecha_inicio);
      const proyFechaFin = new Date(fecha_fin);

      if (proyFechaInicio < contrato.fecha_inicio) {
        throw new Error(
          "La fecha de inicio del proyecto no puede ser anterior a la del contrato",
        );
      }
      if (proyFechaFin > contratoFechaFinVigente) {
        throw new Error(
          "La fecha de fin del proyecto no puede superar la fecha vigente del contrato",
        );
      }

      const horasExtra = contrato.incrementos.reduce(
        (sum, inc) => sum + inc.horas_extra,
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

      const proyecto = await tx.proyectos.create({
        data: {
          nombre,
          area_id,
          estado_id: DEFAULT_ESTADO_PROYECTO_ID,
          estado_contratacion_id: DEFAULT_ESTADO_CONTRATACION_ID,
          fecha_inicio: proyFechaInicio,
          fecha_fin: proyFechaFin,
        },
      });

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
    });

    revalidatePath("/proyectos");
    return { success: true, message: "Proyecto creado correctamente" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al crear el proyecto";
    return { success: false, message };
  }
}

export async function addProyectoProrroga(data: ProyectoProrrogaData) {
  const result = proyectoProrrogaSchema.safeParse(data);
  if (!result.success) {
    return { success: false, message: "Datos inválidos" };
  }

  const { proyecto_id, fecha_fin, numero_expediente, observacion, uso_mensual } =
    result.data;

  try {
    await prisma.$transaction(async (tx) => {
      const proyecto = await tx.proyectos.findUnique({
        where: { id: proyecto_id },
        include: {
          proyecto_prorrogas: { orderBy: { created_at: "asc" } },
          contrato_proyectos: {
            include: {
              contratos: {
                select: {
                  fecha_fin: true,
                  prorrogas: {
                    select: { fecha_fin: true },
                    orderBy: { created_at: "asc" },
                  },
                },
              },
              uso_mensual: { select: { horas_estimadas: true } },
            },
          },
        },
      });

      if (!proyecto) throw new Error("Proyecto no encontrado");

      const fechaFinVigenteProyecto =
        proyecto.proyecto_prorrogas.at(-1)?.fecha_fin ?? proyecto.fecha_fin;

      const nuevaFechaFin = new Date(fecha_fin);

      if (nuevaFechaFin <= fechaFinVigenteProyecto) {
        throw new Error(
          "La nueva fecha de fin debe ser posterior a la fecha vigente del proyecto",
        );
      }

      // Validar contra la fecha vigente del contrato
      const cp = proyecto.contrato_proyectos[0];
      if (cp) {
        const contrato = cp.contratos;
        const contratoFechaFinVigente =
          contrato.prorrogas.at(-1)?.fecha_fin ?? contrato.fecha_fin;

        if (nuevaFechaFin > contratoFechaFinVigente) {
          throw new Error(
            "La nueva fecha de fin del proyecto no puede superar la fecha vigente del contrato",
          );
        }

        // Validar horas: suma de horas ya distribuidas + nuevas no puede superar horas_proyectadas
        const horasYaDistribuidas = cp.uso_mensual.reduce(
          (sum, u) => sum + (u.horas_estimadas ?? 0),
          0,
        );
        const horasNuevas = uso_mensual.reduce(
          (sum, u) => sum + (u.horas_estimadas ?? 0),
          0,
        );
        const cpData = await tx.contrato_proyectos.findUnique({
          where: { id: cp.id },
          select: { horas_proyectadas: true },
        });
        if (cpData && horasYaDistribuidas + horasNuevas > cpData.horas_proyectadas + 0.001) {
          throw new Error(
            `Las horas exceden las proyectadas del proyecto (${cpData.horas_proyectadas} hs)`,
          );
        }

        // Crear uso_mensual para los meses nuevos
        const mesesConHoras = uso_mensual.filter((u) => u.horas_estimadas > 0);
        if (mesesConHoras.length > 0) {
          await tx.uso_mensual.createMany({
            data: mesesConHoras.map((u) => ({
              contrato_proyecto_id: cp.id,
              anio: u.anio,
              mes: u.mes,
              horas_estimadas: u.horas_estimadas,
            })),
            skipDuplicates: true,
          });
        }
      }

      await tx.proyecto_prorrogas.create({
        data: {
          proyecto_id,
          fecha_fin: nuevaFechaFin,
          numero_expediente: numero_expediente || null,
          observacion: observacion || null,
        },
      });
    });

    revalidatePath("/proyectos");
    return { success: true, message: "Prórroga agregada correctamente" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al agregar la prórroga";
    return { success: false, message };
  }
}
