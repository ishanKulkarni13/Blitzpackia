import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Leaderboard is temporarily unavailable." }, { status: 503 });
  }
  try {
    const [branches, entries] = await Promise.all([
      prisma.branch.findMany({ orderBy: { code: "asc" }, select: { code: true, name: true } }),
      prisma.scoreEntry.findMany({
        orderBy: [{ score: "desc" }, { createdAt: "asc" }],
        take: 500,
        select: {
          id: true, playerName: true, score: true, mode: true, createdAt: true,
          branch: { select: { code: true, name: true } },
        },
      }),
    ]);
    return NextResponse.json({
      branches,
      entries: entries.map((entry) => ({
        id: entry.id, playerName: entry.playerName, score: entry.score, mode: entry.mode,
        createdAt: entry.createdAt.toISOString(),
        branchCode: entry.branch?.code ?? null,
        branchName: entry.branch?.name ?? "Unassigned",
      })),
    });
  } catch (error) {
    console.error("Failed to load leaderboard", error);
    return NextResponse.json({ error: "Leaderboard is temporarily unavailable." }, { status: 503 });
  }
}
