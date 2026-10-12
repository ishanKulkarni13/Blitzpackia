import { GameMode } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";

const MAX_SCORE = 9999;
type ScorePayload = {
  playerName?: unknown; phoneNumber?: unknown; score?: unknown; mode?: unknown; branchCode?: unknown;
};

function publicEntry(entry: {
  id: string; playerName: string; score: number; mode: GameMode; createdAt: Date;
  branch: { code: string; name: string } | null;
}) {
  return {
    id: entry.id, playerName: entry.playerName, score: entry.score, mode: entry.mode,
    createdAt: entry.createdAt.toISOString(),
    branchCode: entry.branch?.code ?? null, branchName: entry.branch?.name ?? "Unassigned",
  };
}

export async function POST(request: Request) {
  let body: ScorePayload;
  try {
    body = (await request.json()) as ScorePayload;
  } catch {
    return NextResponse.json({ error: "Invalid score submission." }, { status: 400 });
  }
  const playerName = typeof body.playerName === "string"
    ? body.playerName.trim().slice(0, 14) || "Player" : "Player";
  const phoneNumber = typeof body.phoneNumber === "string"
    ? normalizePhone(body.phoneNumber) : null;
  if (typeof body.phoneNumber === "string" && body.phoneNumber.trim() && !phoneNumber) {
    return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
  }
  const score = typeof body.score === "number" ? Math.round(body.score) : NaN;
  const mode = body.mode;
  const branchCode = typeof body.branchCode === "string" ? body.branchCode : "";
  if (!Number.isFinite(score) || score < 0 || score > MAX_SCORE) {
    return NextResponse.json({ error: "Invalid score." }, { status: 400 });
  }
  if (mode !== "easy" && mode !== "normal" && mode !== "hard") {
    return NextResponse.json({ error: "Invalid difficulty." }, { status: 400 });
  }
  if (!branchCode) return NextResponse.json({ error: "A branch is required." }, { status: 400 });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const branch = await tx.branch.findUnique({ where: { code: branchCode } });
      if (!branch) throw new Error("BRANCH_NOT_FOUND");
      if (!phoneNumber) {
        const entry = await tx.scoreEntry.create({
          data: { playerName, score, mode, branchId: branch.id },
          include: { branch: { select: { code: true, name: true } } },
        });
        return { entry, updated: false };
      }
      const existing = await tx.scoreEntry.findUnique({ where: { phoneNumber } });
      if (existing && existing.score >= score) {
        const entry = await tx.scoreEntry.findUniqueOrThrow({
          where: { id: existing.id },
          include: { branch: { select: { code: true, name: true } } },
        });
        return { entry, updated: false };
      }
      const entry = existing
        ? await tx.scoreEntry.update({
            where: { id: existing.id },
            data: { playerName, score, mode, branchId: branch.id },
            include: { branch: { select: { code: true, name: true } } },
          })
        : await tx.scoreEntry.create({
            data: { playerName, phoneNumber, score, mode, branchId: branch.id },
            include: { branch: { select: { code: true, name: true } } },
          });
      return { entry, updated: true };
    }, { isolationLevel: "Serializable" });
    return NextResponse.json({ entry: publicEntry(result.entry), updated: result.updated });
  } catch (error) {
    if (error instanceof Error && error.message === "BRANCH_NOT_FOUND") {
      return NextResponse.json({ error: "Unknown branch." }, { status: 400 });
    }
    console.error("Failed to save score", error);
    return NextResponse.json({ error: "Score could not be saved." }, { status: 503 });
  }
}
