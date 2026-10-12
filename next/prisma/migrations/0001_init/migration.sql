CREATE TYPE "GameMode" AS ENUM ('easy', 'normal', 'hard');

CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ScoreEntry" (
    "id" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "score" INTEGER NOT NULL,
    "mode" "GameMode" NOT NULL,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ScoreEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Branch_code_key" ON "Branch"("code");
CREATE UNIQUE INDEX "ScoreEntry_phoneNumber_key" ON "ScoreEntry"("phoneNumber");
CREATE INDEX "ScoreEntry_score_createdAt_idx" ON "ScoreEntry"("score", "createdAt");
CREATE INDEX "ScoreEntry_branchId_score_idx" ON "ScoreEntry"("branchId", "score");

ALTER TABLE "ScoreEntry"
ADD CONSTRAINT "ScoreEntry_branchId_fkey"
FOREIGN KEY ("branchId") REFERENCES "Branch"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
