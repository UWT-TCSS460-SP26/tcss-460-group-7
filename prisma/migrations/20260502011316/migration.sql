-- AlterTable
ALTER TABLE "users" ALTER COLUMN "subjectId" SET NOT NULL;

-- CreateTable
CREATE TABLE "issues" (
    "id" SERIAL NOT NULL,
    "authorId" INTEGER,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "issues_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
