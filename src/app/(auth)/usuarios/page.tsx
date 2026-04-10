import { getQueryClient } from "@/lib/queryClient";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import UsuariosPage from "./usuariosPage";
import { rolesKeys, usuariosKeys } from "@/lib/queryKeys";
import { getUsers } from "@/services/usuarios.service";
import { getRoles } from "@/services/roles.service";
import { parseUsuariosFilters } from "@/lib/usersFilters";
import { auth } from "@/auth";

export default async function Page({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const session = await auth();
  const queryClient = getQueryClient();
  const resolvedSearchParams = await searchParams;
  const filters = parseUsuariosFilters(resolvedSearchParams);
  const currentUserId = Number(session?.user?.id);

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: usuariosKeys.list(filters),
      queryFn: () =>
        getUsers(filters, Number.isNaN(currentUserId) ? undefined : currentUserId),
    }),
    queryClient.prefetchQuery({
      queryKey: rolesKeys.all,
      queryFn: getRoles,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UsuariosPage filters={filters} />
    </HydrationBoundary>
  );
}
