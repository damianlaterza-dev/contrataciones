import { UsuariosFilters } from "@/@types/filters";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function getUsers(filters: UsuariosFilters, currentUserId?: number) {
  const { page, limit, search, role_id } = filters;

  const skip = (page - 1) * limit;
  const where: Prisma.usersWhereInput = {
    AND: [
      // Lógica de búsqueda (Nombre O Email)
      search
        ? {
            OR: [
              { full_name: { contains: search.toLowerCase().trim() } },
              { email: { contains: search.toLowerCase().trim() } },
            ],
          }
        : {},
      role_id ? { role_id: Number(role_id) } : {},
      currentUserId ? { NOT: { id: currentUserId } } : {},
    ],
  };
  const [data, total] = await Promise.all([
    prisma.users.findMany({
      skip,
      take: limit,
      where,
      orderBy: { created_at: "desc" },
    }),
    prisma.users.count({ where }),
  ]);

  return { data, total };
}
