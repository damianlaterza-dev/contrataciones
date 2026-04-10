import { ProveedoresFilters } from "@/@types/filters";

export function parseProveedoresFilters(
  searchParams: Record<string, string | string[] | undefined>,
): ProveedoresFilters {
  const limitFromQuery = Number(searchParams.limit);
  return {
    page: Math.max(1, Number(searchParams.page) || 1),
    limit:
      Number.isFinite(limitFromQuery) && limitFromQuery > 0
        ? limitFromQuery
        : 10,
    search:
      typeof searchParams.search === "string"
        ? searchParams.search.slice(0, 100)
        : undefined,
  };
}
