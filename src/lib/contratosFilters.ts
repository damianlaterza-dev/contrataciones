import { ContratosFilters } from "@/@types/filters";

export function parseContratosFilters(
  searchParams: Record<string, string | string[] | undefined>,
): ContratosFilters {
  const limitFromQuery = Number(searchParams.limit);
  return {
    page: Math.max(1, Number(searchParams.page) || 1),
    limit:
      Number.isFinite(limitFromQuery) && limitFromQuery > 0
        ? limitFromQuery
        : 5,
  };
}
