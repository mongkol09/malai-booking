SELECT 
  da.roomId,
  da.date,
  da.status,
  da.bookingId,
  r.roomNumber,
  r.status as roomStatus
FROM dailyAvailability da
LEFT JOIN room r ON da.roomId = r.id
WHERE da.date = '2025-09-12'
ORDER BY r.roomNumber;