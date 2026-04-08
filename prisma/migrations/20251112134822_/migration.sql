/*
  Warnings:

  - You are about to drop the column `validRule` on the `Document` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SignatureType" AS ENUM ('WITHOUT_SIGNATURE', 'ONLY_SUPPLIER_SIGNATURE', 'BOTH_SIGNATURES');

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "validRule",
ADD COLUMN     "currencyRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "recipientSignatureDate" TIMESTAMP(3),
ADD COLUMN     "recipientSignatureHasLine" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recipientSignatureName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "showCurrencyRate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "signatureType" "SignatureType" NOT NULL DEFAULT 'WITHOUT_SIGNATURE',
ADD COLUMN     "supplierSignatureDate" TIMESTAMP(3),
ADD COLUMN     "supplierSignatureHasLine" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "supplierSignatureName" TEXT NOT NULL DEFAULT '';

-- DropEnum
DROP TYPE "DocumentValidRule";

-- CreateTable
CREATE TABLE "CurrencyRate" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CurrencyRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CurrencyRate_code_key" ON "CurrencyRate"("code");
