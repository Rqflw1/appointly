-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "color" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Document" ALTER COLUMN "color" DROP DEFAULT;

-- AlterTable
ALTER TABLE "PaymentMethod" ALTER COLUMN "field_1" DROP DEFAULT,
ALTER COLUMN "showByDefault" DROP DEFAULT;
