ALTER TABLE "issues"
ADD COLUMN "reporterName" TEXT;

UPDATE "issues"
SET "reporterName" = 'Legacy Reporter'
WHERE "reporterName" IS NULL;

UPDATE "issues"
SET "reporterContact" = 'legacy-contact@example.com'
WHERE "reporterContact" IS NULL;

ALTER TABLE "issues"
ALTER COLUMN "reporterName" SET NOT NULL;

ALTER TABLE "issues"
ALTER COLUMN "reporterContact" SET NOT NULL;
