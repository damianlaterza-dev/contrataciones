// app/api/auth/reset/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();

  for (const cookie of cookieStore.getAll()) {
    cookieStore.set(cookie.name, "", { maxAge: 0 });
  }

  return NextResponse.redirect(new URL("/login", "http://localhost:3000"));
}
