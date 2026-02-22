-- CreateTable
CREATE TABLE "related_categories" (
    "id" SERIAL NOT NULL,
    "sourceCategoryId" INTEGER NOT NULL,
    "targetCategoryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "related_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "related_categories_sourceCategoryId_idx" ON "related_categories"("sourceCategoryId");

-- CreateIndex
CREATE INDEX "related_categories_targetCategoryId_idx" ON "related_categories"("targetCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "related_categories_sourceCategoryId_targetCategoryId_key" ON "related_categories"("sourceCategoryId", "targetCategoryId");

-- AddForeignKey
ALTER TABLE "related_categories" ADD CONSTRAINT "related_categories_sourceCategoryId_fkey" FOREIGN KEY ("sourceCategoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "related_categories" ADD CONSTRAINT "related_categories_targetCategoryId_fkey" FOREIGN KEY ("targetCategoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
