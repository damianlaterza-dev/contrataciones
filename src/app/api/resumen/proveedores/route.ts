import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const proveedores = await prisma.proveedores.findMany({
      where: { deleted_at: null },
      select: {
        id: true,
        label: true,
        contratos: {
          select: { id: true },
        },
      },
      orderBy: { label: "asc" },
    });

    const data = proveedores.map((proveedor) => ({
      id: proveedor.id,
      label: proveedor.label,
      total_contratos: proveedor.contratos.length,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching resumen proveedores:", error);
    return NextResponse.json(
      { error: "Failed to fetch resumen proveedores" },
      { status: 500 },
    );
  }
}
