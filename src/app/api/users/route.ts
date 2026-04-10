import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUsers } from "@/services/usuarios.service";

export async function GET(req: Request) {
  const session = await auth();
  const { searchParams } = new URL(req.url);

  const filters = {
    page: Number(searchParams.get("page") ?? 1),
    limit: Number(searchParams.get("limit") ?? 5),
    search: searchParams.get("search") ?? undefined,
    role_id: searchParams.get("role_id") ?? undefined,
  };

  const currentUserId = Number(session?.user?.id);
  const data = await getUsers(
    filters,
    Number.isNaN(currentUserId) ? undefined : currentUserId,
  );
  return NextResponse.json(data);
}
