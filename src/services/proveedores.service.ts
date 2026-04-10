import { prisma } from "@/lib/prisma";
import { ProveedoresFilters } from "@/@types/filters";

export async function getProveedores() {
  return await prisma.proveedores.findMany({
    select: {
      id: true,
      label: true,
      value: true,
    },
    where: { deleted_at: null },
    orderBy: {
      label: "asc",
    },
  });
}

export async function getProveedoresPaginated(filters: ProveedoresFilters) {
  const { page, limit, search } = filters;
  const skip = (page - 1) * limit;

  const where = {
    ...(search ? { label: { contains: search.toLowerCase().trim() } } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.proveedores.findMany({
      skip,
      take: limit,
      where,
      orderBy: { label: "asc" },
    }),
    prisma.proveedores.count({ where }),
  ]);

  return { data, total };
}
