import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Roles — role_id=4 ("usuario") es el default para nuevos usuarios
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

  // Agregar áreas
  const ssgda = await prisma.areas.upsert({
    where: { acronimo: "SSGDA" },
    update: {},
    create: { acronimo: "SSGDA", nombre: "SSGDA" },
  });

  const sstedu = await prisma.areas.upsert({
    where: { acronimo: "SSTEDU" },
    update: {},
    create: { acronimo: "SSTEDU", nombre: "SSTEDU" },
  });

  const sspie = await prisma.areas.upsert({
    where: { acronimo: "SSPIE" },
    update: {},
    create: { acronimo: "SSPIE", nombre: "SSPIE" },
  });

  const ssgad = await prisma.areas.upsert({
    where: { acronimo: "SSGAD" },
    update: {},
    create: { acronimo: "SSGAD", nombre: "SSGAD" },
  });

  const um = await prisma.areas.upsert({
    where: { acronimo: "UM" },
    update: {},
    create: { acronimo: "UM", nombre: "UM" },
  });

  const dghpef = await prisma.areas.upsert({
    where: { acronimo: "DGHPEF" },
    update: {},
    create: { acronimo: "DGHPEF", nombre: "DGHPEF" },
  });

  const dgajur = await prisma.areas.upsert({
    where: { acronimo: "DGAJUR" },
    update: {},
    create: { acronimo: "DGAJUR", nombre: "DGAJUR" },
  });

  // Agregar Usuarios
  await prisma.users.upsert({
    where: { email: "damian.laterza@bue.edu.ar" },
    update: {},
    create: {
      email: "damian.laterza@bue.edu.ar",
      full_name: "Damián Laterza",
      role_id: 1,
    },
  });

  // Agregar proyectos
  await prisma.proyectos.createMany({
    skipDuplicates: true,
    data: [
      {
        nombre: "Mejoras Secundaria Aprende",
        estado_id: 2,
        estado_contratacion_id: 1,
        area_id: ssgda.id,
        fecha_inicio: new Date("2025-01-01"),
        fecha_fin: new Date("2025-12-31"),
      },
      {
        nombre: "Proyecto Beta",
        estado_id: 2,
        estado_contratacion_id: 1,
        area_id: sstedu.id,
        fecha_inicio: new Date("2025-01-01"),
        fecha_fin: new Date("2025-12-31"),
      },
    ],
  });

  const proyectoUx = await prisma.proyectos.findFirstOrThrow({
    where: { nombre: "Mejoras Secundaria Aprende" },
  });
  const proyectoBeta = await prisma.proyectos.findFirstOrThrow({
    where: { nombre: "Proyecto Beta" },
  });

  // Agregar proveedores
  const smartDC = await prisma.proveedores.upsert({
    where: { value: "smart_dc" },
    update: {},
    create: {
      value: "smart_dc",
      label: "SMART DC",
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    },
  });

  const novatech = await prisma.proveedores.upsert({
    where: { value: "novatech" },
    update: {},
    create: {
      value: "novatech",
      label: "Novatech",
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    },
  });

  await prisma.proveedores.upsert({
    where: { value: "ticmas" },
    update: {},
    create: { value: "ticmas", label: "Ticmas" },
  });

  const espinlabs = await prisma.proveedores.upsert({
    where: { value: "espinlabs" },
    update: {},
    create: {
      value: "espinlabs",
      label: "Espinlabs",
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    },
  });

  // Agregar contratos + prórrogas
  const contrato1 = await prisma.contratos.upsert({
    where: { numero_expediente: "EXP-2025-920" },
    update: {},
    create: {
      nombre: "Contrato de infraestructura 2025",
      numero_expediente: "EXP-2025-920",
      proveedor_id: smartDC.id,
      fecha_inicio: new Date("2025-01-01"),
      fecha_fin: new Date("2025-06-30"),
      cantidad_horas: 1200,
      valor_hora: 1500.0,
      es_accesoridad: false,
    },
  });

  // Prórroga 1: extendieron fecha y subieron el valor de hora
  const prorroga1Exists = await prisma.contrato_prorrogas.findFirst({
    where: { contrato_id: contrato1.id, fecha_fin: new Date("2025-12-31") },
  });
  if (!prorroga1Exists) {
    await prisma.contrato_prorrogas.create({
      data: {
        contrato_id: contrato1.id,
        fecha_fin: new Date("2025-12-31"),
        observacion: "Prórroga por demora en entrega de requerimientos",
      },
    });
  }

  // Prórroga 2: extendieron fecha + nuevo valor hora
  const prorroga2Exists = await prisma.contrato_prorrogas.findFirst({
    where: { contrato_id: contrato1.id, fecha_fin: new Date("2026-06-30") },
  });
  if (!prorroga2Exists) {
    await prisma.contrato_prorrogas.create({
      data: {
        contrato_id: contrato1.id,
        fecha_fin: new Date("2026-06-30"),
        observacion: "Ampliación de alcance del proyecto",
      },
    });
  }

  // Incremento 1: 300 horas adicionales por ampliación de alcance
  const incremento1Exists = await prisma.contrato_incrementos.findFirst({
    where: { contrato_id: contrato1.id, horas_extra: 300 },
  });
  if (!incremento1Exists) {
    await prisma.contrato_incrementos.create({
      data: {
        contrato_id: contrato1.id,
        horas_extra: 300,
        observacion: "Ampliación de alcance del proyecto",
      },
    });
  }

  const contrato2 = await prisma.contratos.upsert({
    where: { numero_expediente: "EXP-2026-001" },
    update: {},
    create: {
      nombre: "Contrato de desarrollo 2026",
      numero_expediente: "EXP-2026-001",
      proveedor_id: novatech.id,
      fecha_inicio: new Date("2026-01-01"),
      fecha_fin: new Date("2026-12-31"),
      cantidad_horas: 800,
      valor_hora: 2000.0,
      es_accesoridad: false,
    },
  });

  const contrato1Proyecto = await prisma.contrato_proyectos.upsert({
    where: {
      contrato_id_proyecto_id: {
        contrato_id: contrato1.id,
        proyecto_id: proyectoUx.id,
      },
    },
    update: {
      horas_proyectadas: 900,
    },
    create: {
      contrato_id: contrato1.id,
      proyecto_id: proyectoUx.id,
      horas_proyectadas: 900,
    },
  });

  const contrato2Proyecto = await prisma.contrato_proyectos.upsert({
    where: {
      contrato_id_proyecto_id: {
        contrato_id: contrato2.id,
        proyecto_id: proyectoBeta.id,
      },
    },
    update: {
      horas_proyectadas: 600,
    },
    create: {
      contrato_id: contrato2.id,
      proyecto_id: proyectoBeta.id,
      horas_proyectadas: 600,
    },
  });

  const usosMensuales = [
    {
      contrato_proyecto_id: contrato1Proyecto.id,
      anio: 2025,
      mes: 1,
      horas_estimadas: 120,
      horas_reales: 110,
    },
    {
      contrato_proyecto_id: contrato1Proyecto.id,
      anio: 2025,
      mes: 2,
      horas_estimadas: 140,
      horas_reales: 135,
    },
    {
      contrato_proyecto_id: contrato1Proyecto.id,
      anio: 2025,
      mes: 3,
      horas_estimadas: 160,
      horas_reales: 172,
    },
    {
      contrato_proyecto_id: contrato2Proyecto.id,
      anio: 2026,
      mes: 1,
      horas_estimadas: 80,
      horas_reales: 76,
    },
    {
      contrato_proyecto_id: contrato2Proyecto.id,
      anio: 2026,
      mes: 2,
      horas_estimadas: 100,
      horas_reales: 92,
    },
    {
      contrato_proyecto_id: contrato2Proyecto.id,
      anio: 2026,
      mes: 3,
      horas_estimadas: 120,
      horas_reales: null,
    },
  ];

  for (const uso of usosMensuales) {
    await prisma.uso_mensual.upsert({
      where: {
        contrato_proyecto_id_anio_mes: {
          contrato_proyecto_id: uso.contrato_proyecto_id,
          anio: uso.anio,
          mes: uso.mes,
        },
      },
      update: {
        horas_estimadas: uso.horas_estimadas,
        horas_reales: uso.horas_reales,
      },
      create: uso,
    });
  }

  console.log("Seed completado.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
