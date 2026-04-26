/*
  Warnings:

  - You are about to drop the column `author_id` on the `ratings` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ratings` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ratings` table. All the data in the column will be lost.
  - The `role` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "ratings" DROP CONSTRAINT "ratings_author_id_fkey";

-- DropIndex
DROP INDEX "ratings_author_id_title_id_key";

-- AlterTable
ALTER TABLE "ratings" DROP COLUMN "author_id",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "authorId" INTEGER;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "display_name" TEXT,
DROP COLUMN "role",
ADD COLUMN     "role" INTEGER NOT NULL DEFAULT 2;

-- CreateTable
CREATE TABLE "reviews" (
    "id" SERIAL NOT NULL,
    "authorId" INTEGER,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "header" TEXT,
    "title_id" INTEGER NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reviews_title_id_key" ON "reviews"("title_id");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
