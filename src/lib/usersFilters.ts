import { UsuariosFilters } from "@/@types/filters";

export function parseUsuariosFilters(
  searchParams: Record<string, string | string[] | undefined>,
): UsuariosFilters {
  const limitFromQuery = Number(searchParams.limit);
  return {
    page: Math.max(1, Number(searchParams.page) || 1),
    limit:
      Number.isFinite(limitFromQuery) && limitFromQuery > 0
        ? limitFromQuery
        : 5,
    search:
      typeof searchParams.search === "string"
        ? searchParams.search.slice(0, 100)
        : undefined,
    role_id:
      typeof searchParams.role_id === "string" && searchParams.role_id !== ""
        ? searchParams.role_id
        : undefined,
  };
}
