import { getProveedores, getProveedoresPaginated } from "@/services/proveedores.service";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // Si viene con parámetros de paginación, devolvemos paginado
  if (searchParams.has("page") || searchParams.has("limit")) {
    const filters = {
      page: Math.max(1, Number(searchParams.get("page") ?? 1)),
      limit: Number(searchParams.get("limit") ?? 10),
      search: searchParams.get("search") ?? undefined,
    };
    try {
      const data = await getProveedoresPaginated(filters);
      return NextResponse.json(data);
    } catch (error) {
      console.error("Error fetching proveedores:", error);
      return NextResponse.json({ error: "Failed to fetch proveedores" }, { status: 500 });
    }
  }

  // Sin parámetros: devolvemos lista completa (para dropdowns)
  try {
    const proveedores = await getProveedores();
    return NextResponse.json(proveedores);
  } catch (error) {
    console.error("Error fetching proveedores:", error);
    return NextResponse.json({ error: "Failed to fetch proveedores" }, { status: 500 });
  }
}
