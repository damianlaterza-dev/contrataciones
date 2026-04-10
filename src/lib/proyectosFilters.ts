import { ProyectosFilters } from "@/@types/filters";

export function parseProyectosFilters(
  searchParams: Record<string, string | string[] | undefined>,
): ProyectosFilters {
  const limitFromQuery = Number(searchParams.limit);
  return {
    page: Math.max(1, Number(searchParams.page) || 1),
    limit:
      Number.isFinite(limitFromQuery) && limitFromQuery > 0
        ? limitFromQuery
        : 5,
    nombre:
      typeof searchParams.nombre === "string" ? searchParams.nombre : undefined,
    estado_id:
      typeof searchParams.estado_id === "string"
        ? searchParams.estado_id
        : undefined,
    area_id:
      typeof searchParams.area_id === "string"
        ? searchParams.area_id
        : undefined,
  };
}
