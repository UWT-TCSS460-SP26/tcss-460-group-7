/*
  Warnings:

  - A unique constraint covering the columns `[authorId,title_id]` on the table `ratings` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ratings_authorId_rating_title_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "ratings_authorId_title_id_key" ON "ratings"("authorId", "title_id");
