import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Roles — requeridos por FK con users. role_id=4 es el default para nuevos usuarios.
  const roles = [
    { id: 1, name: "Developer", label: "Developer", value: "developer" },
    { id: 2, name: "SuperAdmin", label: "Super Admin", value: "superadmin" },
    { id: 3, name: "Admin", label: "Admin", value: "admin" },
    { id: 4, name: "Usuario", label: "Usuario", value: "usuario" },
    { id: 5, name: "Invitado", label: "Invitado", value: "invitado" },
  ];
  for (const r of roles) {
    await prisma.roles.upsert({
      where: { id: r.id },
      update: { name: r.name, label: r.label, value: r.value },
      create: r,
    });
  }

  // Usuario mínimo para poder ingresar
  await prisma.users.upsert({
    where: { email: "damian.laterza@bue.edu.ar" },
    update: {},
    create: {
      email: "damian.laterza@bue.edu.ar",
      full_name: "Damián Laterza",
      role_id: 1,
    },
  });

  console.log("Seed completado.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
