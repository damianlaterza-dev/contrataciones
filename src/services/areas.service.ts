import { prisma } from "@/lib/prisma";

export async function getAreas() {
  return await prisma.areas.findMany({
    select: {
      id: true,
      nombre: true,
      acronimo: true,
    },
    orderBy: {
      nombre: "asc",
    },
  });
}
