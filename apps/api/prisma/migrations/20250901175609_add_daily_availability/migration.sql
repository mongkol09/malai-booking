-- CreateTable
CREATE TABLE "daily_availability" (
    "availability_id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Available',
    "booking_id" TEXT,
    "check_in_date" DATE,
    "check_out_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_availability_pkey" PRIMARY KEY ("availability_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_availability_room_id_date_key" ON "daily_availability"("room_id", "date");

-- AddForeignKey
ALTER TABLE "daily_availability" ADD CONSTRAINT "daily_availability_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("room_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_availability" ADD CONSTRAINT "daily_availability_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE SET NULL ON UPDATE CASCADE;
