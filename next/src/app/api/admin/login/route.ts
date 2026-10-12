import { NextResponse } from "next/server";
import { adminCookie, createAdminToken } from "@/lib/admin-auth";

export async function POST(request: Request) {
  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookie.name, createAdminToken(), {
    httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production",
    maxAge: adminCookie.maxAge, path: "/",
  });
  return response;
}
