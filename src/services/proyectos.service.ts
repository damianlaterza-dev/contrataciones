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
              proveedores: { select: { id: true, label: true } },
            },
          },
        },
      },
    },
  });

  const total = await prisma.proyectos.count({ where });

  const data = rawData.map((proyecto) => ({
    ...proyecto,
    contrato_proyectos: proyecto.contrato_proyectos.map((cp) => ({
      ...cp,
      contratos: {
        ...cp.contratos,
        valor_hora: cp.contratos.valor_hora?.toNumber() ?? null,
      },
    })),
  }));

  return { data, total };
}
