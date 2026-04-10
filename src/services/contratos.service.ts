import { ContratosFilters } from "@/@types/filters";
import { prisma } from "@/lib/prisma";

export async function getAllContratosForSelect() {
  const data = await prisma.contratos.findMany({
    select: {
      id: true,
      nombre: true,
      numero_expediente: true,
      cantidad_horas: true,
      fecha_inicio: true,
      fecha_fin: true,
      incrementos: {
        select: { horas_extra: true },
        orderBy: { created_at: "asc" },
      },
      proyectos: {
        select: { horas_proyectadas: true },
      },
      prorrogas: {
        select: { fecha_fin: true },
      },
    },
    orderBy: { numero_expediente: "asc" },
  });

  return data.map((c) => {
    const horasExtra = c.incrementos.reduce(
      (sum, inc) => sum + inc.horas_extra,
      0,
    );
    const horasTotales = c.cantidad_horas + horasExtra;
    const horasAsignadas = c.proyectos.reduce(
      (sum, p) => sum + p.horas_proyectadas,
      0,
    );
    return {
      id: c.id,
      nombre: c.nombre,
      numero_expediente: c.numero_expediente,
      fecha_inicio: c.fecha_inicio,
      fecha_fin: c.fecha_fin,
      horas_disponibles: Math.max(horasTotales - horasAsignadas, 0),
      prorrogas: c.prorrogas.map((p) => ({ fecha_fin: p.fecha_fin })),
    };
  });
}

export async function getContratosPrincipalesForSelect() {
  return await prisma.contratos.findMany({
    where: {
      OR: [{ es_accesoridad: false }, { es_accesoridad: null }],
    },
    select: {
      id: true,
      nombre: true,
      numero_expediente: true,
    },
    orderBy: { numero_expediente: "asc" },
  });
}

export async function getContratos(filters: ContratosFilters) {
  const { page, limit } = filters;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.contratos.findMany({
      skip,
      take: limit,
      include: {
        prorrogas: { orderBy: { created_at: "asc" } },
        incrementos: { orderBy: { created_at: "asc" } },
        accesorios: { select: { id: true } },
        proyectos: {
          select: {
            proyecto_id: true,
            horas_proyectadas: true,
          },
        },
      },
    }),
    prisma.contratos.count(),
  ]);

  const serialized = data.map((contrato) => {
    const ultimaProrroga = contrato.prorrogas.at(-1);
    const horasExtraTotal = contrato.incrementos.reduce(
      (sum, inc) => sum + inc.horas_extra,
      0,
    );
    const horasAsignadas = contrato.proyectos.reduce(
      (sum, proyecto) => sum + proyecto.horas_proyectadas,
      0,
    );
    const horasTotales = contrato.cantidad_horas + horasExtraTotal;

    return {
      id: contrato.id,
      nombre: contrato.nombre,
      numero_expediente: contrato.numero_expediente,
      fecha_inicio: contrato.fecha_inicio,
      fecha_fin: contrato.fecha_fin,
      cantidad_horas: contrato.cantidad_horas,
      valor_hora: contrato.valor_hora?.toNumber() ?? null,
      es_accesoridad: contrato.es_accesoridad,
      contrato_principal_id: contrato.contrato_principal_id,
      observaciones: contrato.observaciones,
      fecha_fin_vigente: ultimaProrroga?.fecha_fin ?? contrato.fecha_fin,
      horas_totales: horasTotales,
      horas_asignadas: horasAsignadas,
      horas_disponibles: Math.max(horasTotales - horasAsignadas, 0),
      proyecto_ids: contrato.proyectos.map((proyecto) => proyecto.proyecto_id),
      valor_hora_vigente: contrato.valor_hora?.toNumber() ?? null,
      prorrogas: contrato.prorrogas.map((prorroga) => ({
        id: prorroga.id,
        numero_expediente: prorroga.numero_expediente ?? null,
        fecha_fin: prorroga.fecha_fin,
        observacion: prorroga.observacion,
        created_at: prorroga.created_at,
      })),
      incrementos: contrato.incrementos.map((inc) => ({
        id: inc.id,
        horas_extra: inc.horas_extra,
        numero_expediente: inc.numero_expediente ?? null,
        observacion: inc.observacion,
        created_at: inc.created_at,
      })),
      accesorios_count: contrato.accesorios.length,
    };
  });

  return { data: serialized, total };
}
