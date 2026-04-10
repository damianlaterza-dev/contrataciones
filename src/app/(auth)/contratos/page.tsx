import { getQueryClient } from "@/lib/queryClient";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getContratos } from "@/services/contratos.service";
import { contratosKeys } from "@/lib/queryKeys";
import ContratosPage from "./contratosPage";
import { parseContratosFilters } from "@/lib/contratosFilters";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const filters = parseContratosFilters(resolvedSearchParams);
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: contratosKeys.list(filters),
    queryFn: () => getContratos(filters),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ContratosPage filters={filters} />
    </HydrationBoundary>
  );
}
