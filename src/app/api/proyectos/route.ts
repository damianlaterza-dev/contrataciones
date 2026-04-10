import { getProyectosWithFilters } from "@/services/proyectos.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filters = {
      page: Math.max(1, Number(searchParams.get("page")) || 1),
      limit: Math.max(1, Number(searchParams.get("limit")) || 5),
      nombre: searchParams.get("nombre") || undefined,
      estado_id: searchParams.get("estado_id") || undefined,
      area_id: searchParams.get("area_id") || undefined,
    };

    const result = await getProyectosWithFilters(filters);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching proyectos:", error);
    return NextResponse.json(
      { error: "Failed to fetch proyectos" },
      { status: 500 },
    );
  }
}
