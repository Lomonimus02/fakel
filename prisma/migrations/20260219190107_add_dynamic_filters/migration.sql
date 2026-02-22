-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "availableFilters" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "machines" ADD COLUMN     "bucketVolume" DOUBLE PRECISION,
ADD COLUMN     "diggingDepth" DOUBLE PRECISION,
ADD COLUMN     "operatingWeight" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "machines_bucketVolume_idx" ON "machines"("bucketVolume");

-- CreateIndex
CREATE INDEX "machines_diggingDepth_idx" ON "machines"("diggingDepth");

-- CreateIndex
CREATE INDEX "machines_operatingWeight_idx" ON "machines"("operatingWeight");
