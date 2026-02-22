/*
  Warnings:

  - You are about to drop the column `category` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `isCustom` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `muscleGroups` on the `Exercise` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Exercise` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,createdBy]` on the table `Exercise` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Exercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Exercise` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Exercise_category_idx";

-- DropIndex
DROP INDEX "Exercise_name_idx";

-- DropIndex
DROP INDEX "Exercise_name_key";

-- AlterTable
ALTER TABLE "Exercise" DROP COLUMN "category",
DROP COLUMN "createdById",
DROP COLUMN "isCustom",
DROP COLUMN "muscleGroups",
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "defaultReps" INTEGER,
ADD COLUMN     "defaultUnit" TEXT,
ADD COLUMN     "defaultWeight" DECIMAL(6,2),
ADD COLUMN     "demoImageUrl" TEXT,
ADD COLUMN     "demoVideoUrl" TEXT,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSystemExercise" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "movementCategory" TEXT NOT NULL DEFAULT 'other',
ADD COLUMN     "primaryMuscle" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "secondaryMuscles" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'compound',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_slug_key" ON "Exercise"("slug");

-- CreateIndex
CREATE INDEX "Exercise_slug_idx" ON "Exercise"("slug");

-- CreateIndex
CREATE INDEX "Exercise_movementCategory_idx" ON "Exercise"("movementCategory");

-- CreateIndex
CREATE INDEX "Exercise_type_idx" ON "Exercise"("type");

-- CreateIndex
CREATE INDEX "Exercise_createdBy_idx" ON "Exercise"("createdBy");

-- CreateIndex
CREATE INDEX "Exercise_isSystemExercise_idx" ON "Exercise"("isSystemExercise");

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_name_createdBy_key" ON "Exercise"("name", "createdBy");

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
