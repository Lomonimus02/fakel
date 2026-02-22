-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "height" TEXT,
ADD COLUMN     "taskType" TEXT,
ADD COLUMN     "weight" TEXT;

-- AlterTable
ALTER TABLE "machines" ADD COLUMN     "badges" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "loadChartUrl" TEXT;
