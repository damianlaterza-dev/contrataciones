import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  // Get all proyectos with their area and estado
  const proyectos = await prisma.proyectos.findMany({
    include: {
      areas: true,
    },
  });

  // Group by area
  const statsByArea = proyectos.reduce(
    (acc, proyecto) => {
      const areaName = proyecto.areas.nombre;

      if (!acc[areaName]) {
        acc[areaName] = {
          areaId: proyecto.area_id,
          areaName: areaName,
          total: 0,
          implementado: 0,
          enProceso: 0,
          pausado: 0,
          sinAsignar: 0,
        };
      }

      acc[areaName].total++;

      // Count by estado_id
      switch (proyecto.estado_id) {
        case 1: // Implementado
          acc[areaName].implementado++;
          break;
        case 2: // En Proceso
          acc[areaName].enProceso++;
          break;
        case 3: // Pausado
          acc[areaName].pausado++;
          break;
        case 4: // Sin asignar
          acc[areaName].sinAsignar++;
          break;
      }

      return acc;
    },
    {} as Record<
      string,
      {
        areaId: number;
        areaName: string;
        total: number;
        implementado: number;
        enProceso: number;
        pausado: number;
        sinAsignar: number;
      }
    >,
  );

  return Object.values(statsByArea);
}
