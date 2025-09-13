-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "base_amount" DECIMAL(12,2),
ADD COLUMN     "commission_amount" DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN     "commission_type" TEXT,
ADD COLUMN     "discount_type" TEXT,
ADD COLUMN     "extra_charges_amount" DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN     "extra_charges_type" TEXT,
ADD COLUMN     "service_charge_amount" DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN     "service_charge_type" TEXT;
