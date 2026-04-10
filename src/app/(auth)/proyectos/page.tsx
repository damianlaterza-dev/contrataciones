import { getQueryClient } from "@/lib/queryClient";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getProyectosWithFilters } from "@/services/proyectos.service";
import { proyectosKeys } from "@/lib/queryKeys";
import ProyectosPage from "./proyectosPage";
import { parseProyectosFilters } from "@/lib/proyectosFilters";
import { Suspense } from "react";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const filters = parseProyectosFilters(resolvedSearchParams);
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: proyectosKeys.list(filters),
    queryFn: () => getProyectosWithFilters(filters),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <ProyectosPage filters={filters} />
      </Suspense>
    </HydrationBoundary>
  );
}
