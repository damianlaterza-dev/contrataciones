import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Payload = {
  contrato_proyecto_id: number;
  anio: number;
  mes: number;
  horas_reales: number | null;
};

const MAX_HORAS = 999999;

function isValidNullableHours(value: unknown) {
  return (
    value === null ||
    (typeof value === "number" &&
      Number.isInteger(value) &&
      Number.isFinite(value) &&
      value >= 0 &&
      value <= MAX_HORAS)
  );
}

export async function PUT(request: Request) {
  const body = (await request.json()) as Partial<Payload>;

  if (
    !Number.isInteger(body.contrato_proyecto_id) ||
    !Number.isInteger(body.anio) ||
    !Number.isInteger(body.mes) ||
    !isValidNullableHours(body.horas_reales)
  ) {
    return NextResponse.json(
      { message: "Datos inválidos para uso mensual" },
      { status: 400 },
    );
  }

  const contratoProyectoId = body.contrato_proyecto_id as number;
  const anio = body.anio as number;
  const mes = body.mes as number;
  const horasReales = body.horas_reales;

  if (contratoProyectoId <= 0 || anio <= 0 || mes < 1 || mes > 12) {
    return NextResponse.json(
      { message: "Datos inválidos para uso mensual" },
      { status: 400 },
    );
  }

  try {
    const contratoProyecto = await prisma.contrato_proyectos.findUnique({
      where: { id: contratoProyectoId },
      select: { id: true },
    });

    if (!contratoProyecto) {
      return NextResponse.json(
        { message: "No existe el contrato/proyecto indicado" },
        { status: 404 },
      );
    }

    const where = {
      contrato_proyecto_id_anio_mes: {
        contrato_proyecto_id: contratoProyectoId,
        anio,
        mes,
      },
    };

    if (horasReales == null) {
      const existing = await prisma.uso_mensual.findUnique({ where });

      if (existing) {
        await prisma.uso_mensual.delete({ where });
      }

      return NextResponse.json({
        message: "El uso mensual ha sido actualizado",
      });
    }

    await prisma.uso_mensual.upsert({
      where,
      update: {
        horas_reales: horasReales,
      },
      create: {
        contrato_proyecto_id: contratoProyectoId,
        anio,
        mes,
        horas_reales: horasReales,
      },
    });

    return NextResponse.json({
      message: "El uso mensual ha sido actualizado",
    });
  } catch (error) {
    console.error("Error updating uso_mensual:", error);
    return NextResponse.json(
      { message: "Ha ocurrido un error al actualizar el uso mensual" },
      { status: 500 },
    );
  }
}
