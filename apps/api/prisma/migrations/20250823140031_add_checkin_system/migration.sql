-- CreateEnum
CREATE TYPE "CheckinStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "HousekeepingStatus" AS ENUM ('Clean', 'Dirty', 'InProgress', 'OutOfOrder', 'Maintenance');

-- CreateEnum
CREATE TYPE "WalkInStatus" AS ENUM ('QUOTED', 'CONFIRMED', 'CHECKED_IN', 'CANCELLED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BookingStatus" ADD VALUE 'Checked-In';
ALTER TYPE "BookingStatus" ADD VALUE 'Checked-Out';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RoomStatus" ADD VALUE 'Reserved';
ALTER TYPE "RoomStatus" ADD VALUE 'Checking-Out';
ALTER TYPE "RoomStatus" ADD VALUE 'Checking-In';

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "actual_room_id" TEXT,
ADD COLUMN     "assigned_by" TEXT,
ADD COLUMN     "checkin_by" TEXT,
ADD COLUMN     "checkin_time" TIMESTAMP(3),
ADD COLUMN     "checkout_by" TEXT,
ADD COLUMN     "checkout_time" TIMESTAMP(3),
ADD COLUMN     "early_checkin_time" TIMESTAMP(3),
ADD COLUMN     "late_checkout_time" TIMESTAMP(3),
ADD COLUMN     "room_assigned_at" TIMESTAMP(3),
ADD COLUMN     "special_requests_checkin" TEXT,
ADD COLUMN     "walk_in_guest" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "current_booking_id" TEXT,
ADD COLUMN     "housekeeping_status" "HousekeepingStatus" NOT NULL DEFAULT 'Clean',
ADD COLUMN     "last_assigned_at" TIMESTAMP(3),
ADD COLUMN     "last_cleaned_at" TIMESTAMP(3),
ADD COLUMN     "maintenance_notes" TEXT;

-- CreateTable
CREATE TABLE "checkin_sessions" (
    "checkin_session_id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "guest_id" TEXT NOT NULL,
    "checkin_start_time" TIMESTAMP(3) NOT NULL,
    "checkin_complete_time" TIMESTAMP(3),
    "assigned_by" TEXT NOT NULL,
    "outstanding_amount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "paid_amount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "payment_method" TEXT,
    "change_amount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "id_verified" BOOLEAN NOT NULL DEFAULT false,
    "id_number" TEXT,
    "id_type" TEXT,
    "special_requests" TEXT,
    "checkin_notes" TEXT,
    "key_card_issued" BOOLEAN NOT NULL DEFAULT false,
    "status" "CheckinStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checkin_sessions_pkey" PRIMARY KEY ("checkin_session_id")
);

-- CreateTable
CREATE TABLE "room_status_history" (
    "status_history_id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "previous_status" "RoomStatus" NOT NULL,
    "new_status" "RoomStatus" NOT NULL,
    "changed_by" TEXT NOT NULL,
    "reason" TEXT,
    "booking_id" TEXT,
    "notes" TEXT,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_status_history_pkey" PRIMARY KEY ("status_history_id")
);

-- CreateTable
CREATE TABLE "walkin_guests" (
    "walkin_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT,
    "phone_number" TEXT,
    "id_number" TEXT,
    "id_type" TEXT,
    "nationality" TEXT,
    "room_type_requested" TEXT NOT NULL,
    "number_of_nights" INTEGER NOT NULL,
    "number_of_adults" INTEGER NOT NULL DEFAULT 1,
    "number_of_children" INTEGER NOT NULL DEFAULT 0,
    "quoted_rate" DECIMAL(10,2) NOT NULL,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "status" "WalkInStatus" NOT NULL DEFAULT 'QUOTED',
    "converted_booking_id" TEXT,
    "handled_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "walkin_guests_pkey" PRIMARY KEY ("walkin_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "walkin_guests_converted_booking_id_key" ON "walkin_guests"("converted_booking_id");

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_current_booking_id_fkey" FOREIGN KEY ("current_booking_id") REFERENCES "bookings"("booking_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_actual_room_id_fkey" FOREIGN KEY ("actual_room_id") REFERENCES "rooms"("room_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_checkin_by_fkey" FOREIGN KEY ("checkin_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_checkout_by_fkey" FOREIGN KEY ("checkout_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkin_sessions" ADD CONSTRAINT "checkin_sessions_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkin_sessions" ADD CONSTRAINT "checkin_sessions_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("room_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkin_sessions" ADD CONSTRAINT "checkin_sessions_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("guest_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkin_sessions" ADD CONSTRAINT "checkin_sessions_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_status_history" ADD CONSTRAINT "room_status_history_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("room_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_status_history" ADD CONSTRAINT "room_status_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_status_history" ADD CONSTRAINT "room_status_history_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "walkin_guests" ADD CONSTRAINT "walkin_guests_handled_by_fkey" FOREIGN KEY ("handled_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "walkin_guests" ADD CONSTRAINT "walkin_guests_converted_booking_id_fkey" FOREIGN KEY ("converted_booking_id") REFERENCES "bookings"("booking_id") ON DELETE SET NULL ON UPDATE CASCADE;
