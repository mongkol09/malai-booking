import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Update guest data for a booking
 */
export const updateGuestData = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const guestData = req.body;
    
    console.log('👤 Updating guest data for booking:', bookingId);
    console.log('📝 Guest data:', guestData);
    
    // Find the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { guest: true }
    });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Booking not found',
          details: `No booking found with ID: ${bookingId}`
        }
      });
    }
    
    // Update guest information
    const updatedGuest = await prisma.guest.update({
      where: { id: booking.guestId },
      data: {
        firstName: guestData.firstName || booking.guest.firstName,
        lastName: guestData.lastName || booking.guest.lastName,
        email: guestData.email || booking.guest.email,
        phoneNumber: guestData.phone || booking.guest.phoneNumber,
        country: guestData.nationality || booking.guest.country,
        
        // Additional fields (optional)
        dateOfBirth: guestData.dateOfBirth ? new Date(guestData.dateOfBirth) : booking.guest.dateOfBirth,
        gender: guestData.gender || booking.guest.gender,
        address: guestData.address || booking.guest.address,
        city: guestData.city || booking.guest.city,
        state: guestData.state || booking.guest.state,
        zipCode: guestData.zipCode || booking.guest.zipCode,
        
        // ID Documents
        idType: guestData.idType || booking.guest.idType,
        idNumber: guestData.idNumber || booking.guest.idNumber,
        passportNumber: guestData.passportNumber || booking.guest.passportNumber,
        
        // Emergency Contact
        emergencyContactName: guestData.emergencyContact || booking.guest.emergencyContactName,
        emergencyContactPhone: guestData.emergencyPhone || booking.guest.emergencyContactPhone,
        
        // Preferences
        dietaryRestrictions: guestData.dietaryRestrictions || booking.guest.dietaryRestrictions,
        accessibilityNeeds: guestData.accessibilityNeeds || booking.guest.accessibilityNeeds,
        
        // Marketing
        marketingConsent: guestData.marketingConsent !== undefined ? guestData.marketingConsent : booking.guest.marketingConsent,
        newsletterSubscription: guestData.newsletterSubscription !== undefined ? guestData.newsletterSubscription : booking.guest.newsletterSubscription,
        
        // Metadata
        updatedAt: new Date()
      }
    });
    
    // Update booking special requests if provided
    if (guestData.specialRequests) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          specialRequests: guestData.specialRequests
        }
      });
    }
    
    // Log the update for ML data collection
    await logGuestDataUpdate(bookingId, guestData, (req as any).user?.id);
    
    res.json({
      success: true,
      message: 'Guest data updated successfully',
      data: {
        guestId: updatedGuest.id,
        bookingId: bookingId,
        updatedFields: Object.keys(guestData),
        updatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error updating guest data:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update guest data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
};

/**
 * Get guest data completion status
 */
export const getGuestDataStatus = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { guest: true }
    });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: { message: 'Booking not found' }
      });
    }
    
    const guest = booking.guest;
    
    // Calculate completion percentage
    const requiredFields = ['firstName', 'lastName', 'email', 'phoneNumber'];
    const optionalFields = [
      'dateOfBirth', 'gender', 'address', 'city', 'country', 'zipCode',
      'idType', 'idNumber', 'emergencyContactName', 'emergencyContactPhone'
    ];
    
    const completedRequired = requiredFields.filter(field => guest[field as keyof typeof guest]);
    const completedOptional = optionalFields.filter(field => guest[field as keyof typeof guest]);
    
    const completionPercentage = Math.round(
      ((completedRequired.length / requiredFields.length) * 60) + // 60% for required fields
      ((completedOptional.length / optionalFields.length) * 40)   // 40% for optional fields
    );
    
    res.json({
      success: true,
      data: {
        bookingId,
        completionPercentage,
        requiredFieldsComplete: completedRequired.length === requiredFields.length,
        missingRequiredFields: requiredFields.filter(field => !guest[field as keyof typeof guest]),
        missingOptionalFields: optionalFields.filter(field => !guest[field as keyof typeof guest]),
        lastUpdated: guest.updatedAt
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting guest data status:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get guest data status' }
    });
  }
};

/**
 * Log guest data updates for ML analysis
 */
async function logGuestDataUpdate(bookingId: string, guestData: any, staffId?: string) {
  try {
    // Create ML data collection entry
    await prisma.mlDataCollection.create({
      data: {
        eventType: 'guest_data_update',
        bookingId: bookingId,
        staffId: staffId || null,
        eventData: {
          updatedFields: Object.keys(guestData),
          updateTime: new Date().toISOString(),
          dataCompleteness: calculateDataCompleteness(guestData)
        },
        createdAt: new Date()
      }
    });
    
    console.log('📊 ML data logged for guest data update');
  } catch (error) {
    console.error('⚠️ Failed to log ML data:', error);
    // Don't throw error - this is optional logging
  }
}

/**
 * Calculate data completeness score
 */
function calculateDataCompleteness(guestData: any): number {
  const allPossibleFields = [
    'firstName', 'lastName', 'email', 'phone', 'nationality',
    'dateOfBirth', 'gender', 'address', 'city', 'state', 'country', 'zipCode',
    'idType', 'idNumber', 'passportNumber',
    'emergencyContact', 'emergencyPhone',
    'specialRequests', 'dietaryRestrictions', 'accessibilityNeeds'
  ];
  
  const filledFields = allPossibleFields.filter(field => 
    guestData[field] && guestData[field].toString().trim() !== ''
  );
  
  return Math.round((filledFields.length / allPossibleFields.length) * 100);
}
