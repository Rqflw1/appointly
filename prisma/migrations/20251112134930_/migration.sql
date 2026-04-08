-- AlterTable
ALTER TABLE "Document" ALTER COLUMN "currencyRate" DROP DEFAULT,
ALTER COLUMN "recipientSignatureHasLine" DROP DEFAULT,
ALTER COLUMN "recipientSignatureName" DROP DEFAULT,
ALTER COLUMN "showCurrencyRate" DROP DEFAULT,
ALTER COLUMN "signatureType" DROP DEFAULT,
ALTER COLUMN "supplierSignatureHasLine" DROP DEFAULT,
ALTER COLUMN "supplierSignatureName" DROP DEFAULT;
