import {
  getAllContratosForSelect,
  getContratosPrincipalesForSelect,
  getContratos,
} from "@/services/contratos.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    if (searchParams.get("for_select") === "true") {
      const data = await getAllContratosForSelect();
      return NextResponse.json(data);
    }

    if (searchParams.get("for_principal_select") === "true") {
      const data = await getContratosPrincipalesForSelect();
      return NextResponse.json(data);
    }

    const filters = {
      page: Math.max(1, Number(searchParams.get("page")) || 1),
      limit: Math.max(1, Number(searchParams.get("limit")) || 5),
    };

    const result = await getContratos(filters);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching contratos:", error);
    return NextResponse.json(
      { error: "Failed to fetch contratos" },
      { status: 500 },
    );
  }
}
