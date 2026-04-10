"use client";

import { useQuery } from "@tanstack/react-query";
import { AreaStatsCard } from "@/components/dashboard/AreaStatsCard";
import { ProyectosPieChart } from "@/components/dashboard/ProyectosPieChart";
import { Spinner } from "@/components/spinner/Spinner";
import Title from "@/components/title/Title";
import { dashboardKeys } from "@/lib/queryKeys";

export type AreaStats = {
  areaId: number;
  areaName: string;
  total: number;
  implementado: number;
  enProceso: number;
  pausado: number;
  sinAsignar: number;
};

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<AreaStats[]>({
    queryKey: dashboardKeys.stats(),
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats");
      return res.json();
    },
  });

  if (isLoading || !stats) {
    return (
      <div className="grid place-items-center h-dvh">
        <Spinner color="text-cian-500" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-6 py-8">
      <Title
        title="Dashboard"
        subtitle="Visualización general de proyectos por área"
      />

      <section className="mt-8 space-y-8">
        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((area) => (
            <AreaStatsCard
              key={area.areaId}
              areaName={area.areaName}
              total={area.total}
              implementado={area.implementado}
              enProceso={area.enProceso}
              pausado={area.pausado}
              sinAsignar={area.sinAsignar}
            />
          ))}
        </div>

        {/* Pie Chart */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <ProyectosPieChart
              data={stats.map((area) => ({
                areaName: area.areaName,
                total: area.total,
              }))}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
