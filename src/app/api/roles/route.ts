import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const roles = await prisma.roles.findMany({
      select: {
        id: true,
        value: true,
        label: true,
      },
      orderBy: {
        label: "asc",
      },
    });

    return NextResponse.json(roles);
  } catch (error) {
    return NextResponse.json(
      { message: "Error al obtener roles", error },
      { status: 500 },
    );
  }
}
