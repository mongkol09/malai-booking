-- Test query to check if our tables and joins work
SELECT 
  b.booking_id::text as id,
  b.booking_reference_id,
  g.first_name,
  g.last_name
FROM bookings b
JOIN guests g ON b.guest_id = g.guest_id
LIMIT 5;