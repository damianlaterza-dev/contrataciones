import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AreaStatsCardProps = {
  areaName: string;
  total: number;
  implementado: number;
  enProceso: number;
  pausado: number;
  sinAsignar: number;
};

export function AreaStatsCard({
  areaName,
  total,
  implementado,
  enProceso,
  pausado,
  sinAsignar,
}: AreaStatsCardProps) {
  const activeProjects = implementado + enProceso;
  const activePercentage =
    total > 0 ? Math.round((activeProjects / total) * 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">{areaName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-3xl font-bold">{total}</p>
            <p className="text-sm text-muted-foreground">proyectos totales</p>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-medium">{activePercentage}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full bg-primary transition-all")}
                style={{ width: `${activePercentage}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-muted-foreground">
                Implementado:{" "}
                <span className="font-medium text-foreground">
                  {implementado}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">
                En Proceso:{" "}
                <span className="font-medium text-foreground">{enProceso}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-orange-500" />
              <span className="text-muted-foreground">
                Pausado:{" "}
                <span className="font-medium text-foreground">{pausado}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gray-500" />
              <span className="text-muted-foreground">
                Sin asignar:{" "}
                <span className="font-medium text-foreground">
                  {sinAsignar}
                </span>
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
