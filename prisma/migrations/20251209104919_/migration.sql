-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "carrierCountry" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "carrierName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "carrierRegNum" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "destinationAddress" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "driver" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "originAddress" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "paymentMethodType" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "vehicle" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "vehicleNum" TEXT NOT NULL DEFAULT '';
