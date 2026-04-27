/*
  Warnings:

  - A unique constraint covering the columns `[rating,authorId]` on the table `ratings` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ratings_rating_authorId_key" ON "ratings"("rating", "authorId");
