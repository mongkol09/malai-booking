-- Drop existing booking history functions to avoid conflicts
DROP FUNCTION IF EXISTS get_archive_candidates(integer);
DROP FUNCTION IF EXISTS get_archive_statistics();
DROP FUNCTION IF EXISTS archive_single_booking(varchar, varchar);
DROP FUNCTION IF EXISTS archive_bulk_bookings(varchar[], varchar);

-- Drop existing tables if they exist (careful with data!)
-- DROP TABLE IF EXISTS booking_history_permissions;
-- DROP TABLE IF EXISTS booking_archive_logs;
-- DROP TABLE IF EXISTS booking_history;