import { getQueryClient } from "@/lib/queryClient";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import ProveedoresPage from "./proveedoresPage";
import { proveedoresKeys } from "@/lib/queryKeys";
import { getProveedoresPaginated } from "@/services/proveedores.service";
import { parseProveedoresFilters } from "@/lib/proveedoresFilters";

export default async function Page({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const queryClient = getQueryClient();
  const resolvedSearchParams = await searchParams;
  const filters = parseProveedoresFilters(resolvedSearchParams);

  await queryClient.prefetchQuery({
    queryKey: proveedoresKeys.list(filters),
    queryFn: () => getProveedoresPaginated(filters),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProveedoresPage filters={filters} />
    </HydrationBoundary>
  );
}
