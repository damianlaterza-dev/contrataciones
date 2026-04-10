import { getQueryClient } from "@/lib/queryClient";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getDashboardStats } from "@/services/dashboard.service";
import { dashboardKeys } from "@/lib/queryKeys";
import DashboardPage from "./dashboardPage";

export default async function Page() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => getDashboardStats(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardPage />
    </HydrationBoundary>
  );
}
