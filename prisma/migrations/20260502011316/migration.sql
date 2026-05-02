/*
  Warnings:

  - A unique constraint covering the columns `[subjectId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `subjectId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "subjectId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "issues" (
    "id" SERIAL NOT NULL,
    "authorId" INTEGER,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "issues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_subjectId_key" ON "users"("subjectId");

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
