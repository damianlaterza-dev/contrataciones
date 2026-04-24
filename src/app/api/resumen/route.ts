import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const proveedorId = Number(searchParams.get("proveedor_id"));
  const anio = Number(searchParams.get("anio"));

  if (!Number.isInteger(proveedorId) || proveedorId <= 0) {
    return NextResponse.json(
      { error: "proveedor_id inválido" },
      { status: 400 },
    );
  }

  if (!Number.isInteger(anio) || anio <= 0) {
    return NextResponse.json({ error: "anio inválido" }, { status: 400 });
  }

  try {
    const contratos = await prisma.contratos.findMany({
      where: { proveedor_id: proveedorId },
      select: {
        id: true,
        numero_expediente: true,
        cantidad_horas: true,
        valor_hora: true,
        fecha_inicio: true,
        fecha_fin: true,
        prorrogas: {
          select: { fecha_fin: true },
          orderBy: { created_at: "asc" },
        },
        proyectos: {
          select: {
            id: true,
            horas_proyectadas: true,
            proyectos: {
              select: {
                id: true,
                nombre: true,
                fecha_inicio: true,
                fecha_fin: true,
                proyecto_prorrogas: {
                  select: { fecha_fin: true },
                  orderBy: { created_at: "asc" },
                },
              },
            },
            uso_mensual: {
              where: { anio },
              select: { mes: true, horas_estimadas: true, horas_reales: true },
            },
          },
        },
      },
      orderBy: { numero_expediente: "asc" },
    });

    const result = contratos.map((contrato) => {
      const horas_proyectadas_total = contrato.proyectos.reduce(
        (sum, cp) => sum + cp.horas_proyectadas,
        0,
      );

      const horas_reales_total = contrato.proyectos.reduce(
        (sum, cp) =>
          sum +
          cp.uso_mensual.reduce(
            (s, u) => s + (u.horas_reales ?? 0),
            0,
          ),
        0,
      );

      const porcentaje_proyectado =
        contrato.cantidad_horas > 0
          ? Math.round((horas_proyectadas_total / contrato.cantidad_horas) * 100)
          : 0;

      return {
        id: contrato.id,
        numero_expediente: contrato.numero_expediente,
        cantidad_horas: contrato.cantidad_horas,
        valor_hora:
          contrato.valor_hora == null ? null : Number(contrato.valor_hora),
        fecha_inicio: contrato.fecha_inicio.toISOString().slice(0, 10),
        fecha_fin: contrato.fecha_fin.toISOString().slice(0, 10),
        prorrogas: contrato.prorrogas.map((p) => ({
          fecha_fin: p.fecha_fin.toISOString().slice(0, 10),
        })),
        horas_proyectadas_total,
        horas_reales_total,
        porcentaje_proyectado,
        proyectos: contrato.proyectos.map((cp) => {
          const ultimaProrroga = cp.proyectos.proyecto_prorrogas.at(-1);
          const fecha_fin_vigente = ultimaProrroga?.fecha_fin ?? cp.proyectos.fecha_fin;
          return {
            contrato_proyecto_id: cp.id,
            proyecto_id: cp.proyectos.id,
            nombre: cp.proyectos.nombre,
            horas_proyectadas: cp.horas_proyectadas,
            fecha_inicio: cp.proyectos.fecha_inicio.toISOString().slice(0, 10),
            fecha_fin_vigente: fecha_fin_vigente.toISOString().slice(0, 10),
            meses: cp.uso_mensual.sort((a, b) => a.mes - b.mes),
          };
        }),
      };
    });

    return NextResponse.json({ contratos: result });
  } catch (error) {
    console.error("Error fetching resumen:", error);
    return NextResponse.json(
      { error: "Failed to fetch resumen" },
      { status: 500 },
    );
  }
}
