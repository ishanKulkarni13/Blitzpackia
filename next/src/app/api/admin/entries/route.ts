import { GameMode } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";
import { requireAdmin } from "@/lib/admin-auth";

function adminEntry(entry: {
  id: string; playerName: string; phoneNumber: string | null; score: number; mode: GameMode;
  createdAt: Date; branch: { code: string; name: string } | null;
}) {
  return {
    id: entry.id, playerName: entry.playerName, phoneNumber: entry.phoneNumber,
    score: entry.score, mode: entry.mode, createdAt: entry.createdAt.toISOString(),
    branchCode: entry.branch?.code ?? "", branchName: entry.branch?.name ?? "Unassigned",
  };
}
async function unauthorized() {
  return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}

export async function GET() {
  if (!(await requireAdmin())) return unauthorized();
  try {
    const [entries, branches] = await Promise.all([
      prisma.scoreEntry.findMany({
        orderBy: [{ score: "desc" }, { createdAt: "asc" }],
        include: { branch: { select: { code: true, name: true } } },
      }),
      prisma.branch.findMany({ orderBy: { code: "asc" }, select: { code: true, name: true } }),
    ]);
    return NextResponse.json({ entries: entries.map(adminEntry), branches });
  } catch (error) {
    console.error("Failed to load admin entries", error);
    return NextResponse.json({ error: "Admin data is temporarily unavailable." }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return unauthorized();
  try {
    const body = (await request.json()) as {
      id?: unknown; playerName?: unknown; phoneNumber?: unknown; score?: unknown;
      mode?: unknown; branchCode?: unknown;
    };
    if (typeof body.id !== "string") return NextResponse.json({ error: "Invalid entry." }, { status: 400 });
    const phoneNumber = typeof body.phoneNumber === "string" ? normalizePhone(body.phoneNumber) : null;
    if (typeof body.phoneNumber === "string" && body.phoneNumber.trim() && !phoneNumber) {
      return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
    }
    const score = typeof body.score === "number"
      ? Math.max(0, Math.min(9999, Math.round(body.score))) : NaN;
    if (!Number.isFinite(score) || !["easy", "normal", "hard"].includes(String(body.mode))) {
      return NextResponse.json({ error: "Invalid entry values." }, { status: 400 });
    }
    const branchCode = typeof body.branchCode === "string" ? body.branchCode : "";
    const branch = branchCode ? await prisma.branch.findUnique({ where: { code: branchCode } }) : null;
    const entry = await prisma.scoreEntry.update({
      where: { id: body.id },
      data: {
        playerName: typeof body.playerName === "string"
          ? body.playerName.trim().slice(0, 14) || "Player" : "Player",
        phoneNumber, score, mode: body.mode as GameMode, branchId: branch?.id ?? null,
      },
      include: { branch: { select: { code: true, name: true } } },
    });
    return NextResponse.json({ entry: adminEntry(entry) });
  } catch (error) {
    console.error("Failed to update admin entry", error);
    return NextResponse.json({ error: "Entry could not be updated." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return unauthorized();
  try {
    const body = (await request.json()) as { id?: unknown };
    if (typeof body.id !== "string") return NextResponse.json({ error: "Invalid entry." }, { status: 400 });
    await prisma.scoreEntry.delete({ where: { id: body.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete admin entry", error);
    return NextResponse.json({ error: "Entry could not be deleted." }, { status: 400 });
  }
}
