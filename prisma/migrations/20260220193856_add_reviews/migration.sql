/*
  Warnings:

  - You are about to drop the column `whatsappUrl` on the `site_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "site_settings" DROP COLUMN "whatsappUrl";

-- CreateTable
CREATE TABLE "reviews" (
    "id" SERIAL NOT NULL,
    "author" TEXT NOT NULL,
    "role" TEXT,
    "text" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);
