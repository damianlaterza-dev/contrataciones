import { getAreas } from "@/services/areas.service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const areas = await getAreas();
    return NextResponse.json(areas);
  } catch (error) {
    console.error("Error fetching areas:", error);
    return NextResponse.json(
      { error: "Failed to fetch areas" },
      { status: 500 },
    );
  }
}
