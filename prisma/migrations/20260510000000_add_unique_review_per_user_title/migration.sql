-- CreateIndex
CREATE UNIQUE INDEX "reviews_authorId_title_id_key" ON "reviews"("authorId", "title_id");
