-- Query to check booking status of the problematic bookings
SELECT 
  id,
  bookingReferenceId,
  status,
  checkinTime,
  checkoutTime,
  createdAt,
  updatedAt
FROM booking 
WHERE bookingReferenceId IN ('BK12916955', 'BK12837206')
ORDER BY createdAt DESC;