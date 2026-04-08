-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "isIndividual" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "showCarrier" BOOLEAN NOT NULL DEFAULT true;
