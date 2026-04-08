-- AlterTable
ALTER TABLE "DocumentSettings" ALTER COLUMN "lastRefresh" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "EmailSettings" ALTER COLUMN "updatedAt" DROP DEFAULT;
