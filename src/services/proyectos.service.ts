import { prisma } from "@/lib/prisma";

export type ProyectosFilters = {
  page: number;
  limit: number;
  nombre?: string;
  estado_id?: string;
  area_id?: string;
};

export async function getProyectosWithFilters(filters: ProyectosFilters) {
  const { page, limit, nombre, estado_id, area_id } = filters;

  const skip = (page - 1) * limit;

  const where = {
    ...(nombre && { nombre: { contains: nombre } }),
    ...(estado_id && { estado_id: parseInt(estado_id) }),
    ...(area_id && { area_id: parseInt(area_id) }),
  };

  const rawData = await prisma.proyectos.findMany({
    skip,
    take: limit,
    where,
    orderBy: { id: "desc" },
    include: {
      areas: true,
      proyecto_prorrogas: { orderBy: { created_at: "asc" } },
      contrato_proyectos: {
        include: {
          contratos: {
            select: {
              id: true,
              nombre: true,
              numero_expediente: true,
              fecha_inicio: true,
              fecha_fin: true,
              cantidad_horas: true,
              valor_hora: true,
              es_accesoridad: true,
              contrato_principal_id: true,
              observaciones: true,
              prorrogas: { select: { fecha_fin: true }, orderBy: { created_at: "asc" } },
              proveedores: { select: { id: true, label: true } },
            },
          },
          uso_mensual: true,
        },
      },
    },
  });

  const total = await prisma.proyectos.count({ where });

  const data = rawData.map((proyecto) => {
    const ultimaProrroga = proyecto.proyecto_prorrogas.at(-1);
    const fecha_fin_vigente = ultimaProrroga?.fecha_fin ?? proyecto.fecha_fin;

    const horasDistribuidas = proyecto.contrato_proyectos.reduce((sum, cp) => {
      return (
        sum +
        cp.uso_mensual.reduce((s, u) => s + (u.horas_estimadas ?? 0), 0)
      );
    }, 0);

    return {
      ...proyecto,
      fecha_fin_vigente,
      horas_distribuidas: horasDistribuidas,
      contrato_proyectos: proyecto.contrato_proyectos.map((cp) => ({
        ...cp,
        contratos: {
          ...cp.contratos,
          valor_hora: cp.contratos.valor_hora?.toNumber() ?? null,
          fecha_fin_vigente:
            cp.contratos.prorrogas.at(-1)?.fecha_fin ?? cp.contratos.fecha_fin,
        },
      })),
    };
  });

  return { data, total };
}
