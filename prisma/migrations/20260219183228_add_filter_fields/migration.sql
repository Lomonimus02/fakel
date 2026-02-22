-- AlterTable
ALTER TABLE "machines" ADD COLUMN     "boomLength" DOUBLE PRECISION,
ADD COLUMN     "isAllTerrain" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "liftingCapacity" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "machines_liftingCapacity_idx" ON "machines"("liftingCapacity");

-- CreateIndex
CREATE INDEX "machines_boomLength_idx" ON "machines"("boomLength");

-- CreateIndex
CREATE INDEX "machines_isAllTerrain_idx" ON "machines"("isAllTerrain");
