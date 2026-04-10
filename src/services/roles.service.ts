import { prisma } from "@/lib/prisma";

export async function getRoles() {
  return prisma.roles.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      value: true,
      label: true,
    },
  });
}

export async function fetchRoles() {
  const res = await fetch("/api/roles");
  if (!res.ok) throw new Error("Error al cargar roles");
  return res.json();
}
