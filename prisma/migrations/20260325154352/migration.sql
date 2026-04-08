-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "color" TEXT NOT NULL DEFAULT '#8243e5';

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "color" TEXT NOT NULL DEFAULT '#8243e5';

-- AlterTable
ALTER TABLE "PaymentMethod" ADD COLUMN     "field_1" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "showByDefault" BOOLEAN NOT NULL DEFAULT true;
