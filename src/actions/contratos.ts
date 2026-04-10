"use server";

import {
  contratoWizardSchema,
  prorrogaSchema,
  incrementoSchema,
  type ContratoWizardData,
  type ProrrogaData,
  type IncrementoData,
} from "@/schemas/contratoWizardSchema";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createContratoCompleto(data: ContratoWizardData) {
  const result = contratoWizardSchema.safeParse(data);

  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {};
    result.error.issues.forEach((issue) => {
      if (issue.path.length > 0) {
        const key = issue.path[0].toString();
        if (!fieldErrors[key]) fieldErrors[key] = [];
        fieldErrors[key].push(issue.message);
      }
    });
    return { success: false, message: "Datos inválidos", errors: fieldErrors };
  }

  const {
    nombre,
    numero_expediente,
    proveedor_id,
    fecha_inicio,
    fecha_fin,
    cantidad_horas,
    valor_hora,
    es_accesoridad,
    contrato_principal_id,
    observaciones,
  } = result.data;

  const existing = await prisma.contratos.findFirst({
    where: { numero_expediente: { equals: numero_expediente } },
  });

  if (existing) {
    return {
      success: false,
      message: "Ya existe un contrato con ese número de expediente",
    };
  }

  try {
    await prisma.contratos.create({
      data: {
        nombre,
        numero_expediente,
        proveedor_id,
        fecha_inicio: new Date(fecha_inicio),
        fecha_fin: new Date(fecha_fin),
        cantidad_horas,
        valor_hora: valor_hora ?? null,
        es_accesoridad: es_accesoridad ?? null,
        contrato_principal_id: contrato_principal_id ?? null,
        observaciones: observaciones ?? null,
      },
    });

    revalidatePath("/contratos");

    return {
      success: true,
      message: "El contrato ha sido creado correctamente",
    };
  } catch (error) {
    console.error("Error creating contrato:", error);
    return {
      success: false,
      message: "Ha ocurrido un error al crear el contrato",
    };
  }
}

export async function assignProyectoToContrato(data: {
  contrato_id: number;
  proyecto_id: number;
  horas_proyectadas: number;
}) {
  const { contrato_id, proyecto_id, horas_proyectadas } = data;

  if (
    !Number.isInteger(contrato_id) ||
    !Number.isInteger(proyecto_id) ||
    !Number.isInteger(horas_proyectadas) ||
    contrato_id <= 0 ||
    proyecto_id <= 0 ||
    horas_proyectadas <= 0
  ) {
    return {
      success: false,
      message: "Datos inválidos para asignar proyecto",
    };
  }

  try {
    const contrato = await prisma.contratos.findUnique({
      where: { id: contrato_id },
      include: {
        incrementos: {
          select: { horas_extra: true },
        },
        proyectos: {
          select: {
            proyecto_id: true,
            horas_proyectadas: true,
          },
        },
      },
    });

    if (!contrato) {
      return { success: false, message: "Contrato no encontrado" };
    }

    const proyecto = await prisma.proyectos.findUnique({
      where: { id: proyecto_id },
      select: { id: true },
    });

    if (!proyecto) {
      return { success: false, message: "Proyecto no encontrado" };
    }

    if (contrato.proyectos.some((item) => item.proyecto_id === proyecto_id)) {
      return {
        success: false,
        message: "Ese proyecto ya está asignado al contrato",
      };
    }

    const horasExtra = contrato.incrementos.reduce(
      (sum, inc) => sum + inc.horas_extra,
      0,
    );
    const horasTotales = contrato.cantidad_horas + horasExtra;
    const horasAsignadas = contrato.proyectos.reduce(
      (sum, item) => sum + item.horas_proyectadas,
      0,
    );
    const horasDisponibles = horasTotales - horasAsignadas;

    if (horas_proyectadas > horasDisponibles) {
      return {
        success: false,
        message: `Las horas proyectadas no pueden superar las horas disponibles (${horasDisponibles})`,
      };
    }

    await prisma.contrato_proyectos.create({
      data: {
        contrato_id,
        proyecto_id,
        horas_proyectadas,
      },
    });

    revalidatePath("/contratos");
    revalidatePath("/proveedores");

    return {
      success: true,
      message: "El proyecto ha sido asignado al contrato",
    };
  } catch (error) {
    console.error("Error assigning proyecto to contrato:", error);
    return {
      success: false,
      message: "Ha ocurrido un error al asignar el proyecto",
    };
  }
}

export async function addProrroga(data: ProrrogaData) {
  const result = prorrogaSchema.safeParse(data);
  if (!result.success) {
    return { success: false, message: "Datos inválidos" };
  }
  const { contrato_id, numero_expediente, fecha_fin, observacion } = result.data;
  try {
    await prisma.contrato_prorrogas.create({
      data: {
        contrato_id,
        numero_expediente: numero_expediente ?? null,
        fecha_fin: new Date(fecha_fin),
        observacion: observacion ?? null,
      },
    });
    revalidatePath("/contratos");
    return { success: true, message: "Prórroga agregada correctamente" };
  } catch (error) {
    console.error("Error adding prorroga:", error);
    return {
      success: false,
      message: "Ha ocurrido un error al agregar la prórroga",
    };
  }
}

export async function addIncremento(data: IncrementoData) {
  const result = incrementoSchema.safeParse(data);
  if (!result.success) {
    return { success: false, message: "Datos inválidos" };
  }
  const { contrato_id, horas_extra, numero_expediente, observacion } = result.data;
  try {
    await prisma.contrato_incrementos.create({
      data: {
        contrato_id,
        horas_extra,
        numero_expediente: numero_expediente ?? null,
        observacion: observacion ?? null,
      },
    });
    revalidatePath("/contratos");
    return {
      success: true,
      message: "Incremento de horas agregado correctamente",
    };
  } catch (error) {
    console.error("Error adding incremento:", error);
    return {
      success: false,
      message: "Ha ocurrido un error al agregar el incremento",
    };
  }
}
