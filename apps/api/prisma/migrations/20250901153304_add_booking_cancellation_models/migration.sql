-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "requires_pin_setup" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "user_pins" (
    "pin_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "pin_hash" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "failed_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "last_used_at" TIMESTAMP(3),
    "last_failed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "user_pins_pkey" PRIMARY KEY ("pin_id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "activity_id" TEXT NOT NULL,
    "user_id" TEXT,
    "activity_type" TEXT NOT NULL,
    "data" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("activity_id")
);

-- CreateTable
CREATE TABLE "booking_cancellations" (
    "cancellation_id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "refund_amount" DECIMAL(12,2) NOT NULL,
    "refund_method" TEXT NOT NULL,
    "cancelled_by" TEXT NOT NULL,
    "internal_notes" TEXT,
    "cancellation_time" TIMESTAMP(3) NOT NULL,
    "policy_applied" TEXT,
    "original_amount" DECIMAL(12,2) NOT NULL,
    "penalty_amount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_cancellations_pkey" PRIMARY KEY ("cancellation_id")
);

-- CreateTable
CREATE TABLE "payment_refunds" (
    "refund_id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "cancellation_id" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "method" TEXT NOT NULL,
    "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "processed_by" TEXT NOT NULL,
    "refund_reason" TEXT NOT NULL,
    "processed_at" TIMESTAMP(3),
    "gateway_response" JSONB,
    "failure_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_refunds_pkey" PRIMARY KEY ("refund_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_pins_user_id_key" ON "user_pins"("user_id");

-- CreateIndex
CREATE INDEX "activity_logs_user_id_idx" ON "activity_logs"("user_id");

-- CreateIndex
CREATE INDEX "activity_logs_activity_type_idx" ON "activity_logs"("activity_type");

-- CreateIndex
CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs"("created_at");

-- CreateIndex
CREATE INDEX "booking_cancellations_booking_id_idx" ON "booking_cancellations"("booking_id");

-- CreateIndex
CREATE INDEX "booking_cancellations_cancelled_by_idx" ON "booking_cancellations"("cancelled_by");

-- CreateIndex
CREATE INDEX "booking_cancellations_cancellation_time_idx" ON "booking_cancellations"("cancellation_time");

-- CreateIndex
CREATE UNIQUE INDEX "payment_refunds_cancellation_id_key" ON "payment_refunds"("cancellation_id");

-- CreateIndex
CREATE INDEX "payment_refunds_booking_id_idx" ON "payment_refunds"("booking_id");

-- CreateIndex
CREATE INDEX "payment_refunds_cancellation_id_idx" ON "payment_refunds"("cancellation_id");

-- CreateIndex
CREATE INDEX "payment_refunds_status_idx" ON "payment_refunds"("status");

-- AddForeignKey
ALTER TABLE "user_pins" ADD CONSTRAINT "user_pins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_cancellations" ADD CONSTRAINT "booking_cancellations_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_cancellations" ADD CONSTRAINT "booking_cancellations_cancelled_by_fkey" FOREIGN KEY ("cancelled_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_refunds" ADD CONSTRAINT "payment_refunds_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_refunds" ADD CONSTRAINT "payment_refunds_cancellation_id_fkey" FOREIGN KEY ("cancellation_id") REFERENCES "booking_cancellations"("cancellation_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_refunds" ADD CONSTRAINT "payment_refunds_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
