/*
  Warnings:

  - You are about to drop the column `content` on the `issues` table. All the data in the column will be lost.
  - Added the required column `description` to the `issues` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `issues` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('UNSOLVED', 'IN_PROGRESS', 'FIXED');

-- AlterTable
ALTER TABLE "issues" DROP COLUMN "content",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "reporterContact" TEXT,
ADD COLUMN     "reproSteps" TEXT,
ADD COLUMN     "status" "IssueStatus" NOT NULL DEFAULT 'UNSOLVED',
ADD COLUMN     "title" TEXT NOT NULL;
