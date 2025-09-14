-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "archived_at" TIMESTAMP(3),
ADD COLUMN     "archived_by" TEXT,
ADD COLUMN     "archived_reason" TEXT,
ADD COLUMN     "guest_email" TEXT,
ADD COLUMN     "guest_name" TEXT,
ADD COLUMN     "guest_phone" TEXT,
ADD COLUMN     "is_archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "room_number" TEXT,
ADD COLUMN     "room_type_name" TEXT,
ADD COLUMN     "stay_nights" INTEGER;

-- CreateTable
CREATE TABLE "archive_configs" (
    "archive_config_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "hide_from_active_list" BOOLEAN NOT NULL DEFAULT true,
    "archive_after_days" INTEGER NOT NULL DEFAULT 7,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "auto_archive_enabled" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,

    CONSTRAINT "archive_configs_pkey" PRIMARY KEY ("archive_config_id")
);

-- CreateTable
CREATE TABLE "archive_logs" (
    "archive_log_id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "performed_by" TEXT,
    "performed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "archive_logs_pkey" PRIMARY KEY ("archive_log_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "archive_configs_status_key" ON "archive_configs"("status");

-- CreateIndex
CREATE INDEX "bookings_is_archived_status_idx" ON "bookings"("is_archived", "status");

-- CreateIndex
CREATE INDEX "bookings_is_archived_checkin_date_idx" ON "bookings"("is_archived", "checkin_date");

-- CreateIndex
CREATE INDEX "bookings_is_archived_status_checkin_date_idx" ON "bookings"("is_archived", "status", "checkin_date");

-- CreateIndex
CREATE INDEX "bookings_guest_email_is_archived_idx" ON "bookings"("guest_email", "is_archived");

-- CreateIndex
CREATE INDEX "bookings_room_number_is_archived_idx" ON "bookings"("room_number", "is_archived");

-- CreateIndex
CREATE INDEX "bookings_booking_reference_id_is_archived_idx" ON "bookings"("booking_reference_id", "is_archived");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_archived_by_fkey" FOREIGN KEY ("archived_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archive_configs" ADD CONSTRAINT "archive_configs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archive_logs" ADD CONSTRAINT "archive_logs_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archive_logs" ADD CONSTRAINT "archive_logs_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
