import QRCode from 'qrcode';
import { 
  EmailTemplate, 
  EmailType, 
  BookingEmailData, 
  PaymentEmailData, 
  CheckInReminderData,
  TemplateVariable 
} from '../types/emailTypes';
import { bookingConfirmationTemplate } from '../templates/bookingConfirmationTemplate';
import { paymentReceiptTemplate } from '../templates/paymentReceiptTemplate';
import { checkinReminderTemplate } from '../templates/checkinReminderTemplate';
import { getLogoUrl } from '../templates/logoAssets';

// ============================================
// EMAIL TEMPLATE SERVICE
// ============================================

export class EmailTemplateService {
  
  // ============================================
  // QR CODE GENERATION
  // ============================================

  /**
   * สร้าง QR Code สำหรับการเช็คอิน
   */
  async generateCheckInQRCode(bookingReference: string): Promise<string> {
    try {
      const qrData = {
        type: 'booking_checkin',
        reference: bookingReference,
        timestamp: Date.now(),
        hotel: 'malai_khaoyai'
      };
      
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      });
      
      return qrCodeDataUrl;
    } catch (error) {
      console.error('❌ Error generating QR code:', error);
      return ''; // Return empty string if QR generation fails
    }
  }

  // ============================================
  // BOOKING CONFIRMATION TEMPLATES
  // ============================================

  /**
   * เตรียมข้อมูลสำหรับ Booking Confirmation Email
   */
  async prepareBookingConfirmationData(data: BookingEmailData): Promise<any> {
    const { booking, guest, roomType } = data;
    
    const checkinDate = new Date(booking.checkinDate);
    const checkoutDate = new Date(booking.checkoutDate);
    const nights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Generate QR Code
    const qrCodeData = await this.generateCheckInQRCode(booking.bookingReferenceId || booking.id);
    
    return {
      // Basic guest information
      guest_name: `${guest.firstName} ${guest.lastName}`,
      guest_email: guest.email,
      guest_phone: guest.phone || guest.phoneNumber || 'ไม่ระบุ',
      guest_country: guest.country || 'Thailand',
      
      // Booking information
      booking_reference: booking.bookingReferenceId || booking.id,
      booking_status: 'ยืนยันแล้ว',
      
      // Dates (Thai format)
      checkin_date: checkinDate.toLocaleDateString('th-TH', {
        weekday: 'long',
        year: 'numeric', 
        month: 'long',
        day: 'numeric'
      }),
      checkin_time: '15:00 น.',
      checkout_date: checkoutDate.toLocaleDateString('th-TH', {
        weekday: 'long',
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      }),
      checkout_time: '11:00 น.',
      
      // Room information
      room_type: roomType.name,
      room_number: booking.room?.roomNumber || 'จะแจ้งให้ทราบในวันเช็คอิน',
      
      // Stay details
      guest_count: (booking.numAdults || 0) + (booking.numChildren || 0),
      adults: booking.numAdults || 0,
      children: booking.numChildren || 0,
      nights: nights,
      
      // Pricing - Enhanced with breakdown
      room_price_per_night: (Number(booking.totalPrice || 0) / nights).toLocaleString('th-TH'),
      base_price: Number(booking.totalPrice || 0).toLocaleString('th-TH'),
      discount_amount: Number(booking.discountAmount || 0).toLocaleString('th-TH'),
      
      // Tax & Service Charge (from database settings)
      tax_rate: '7%', // TODO: ดึงจาก SystemSettings
      tax_amount: (Number(booking.totalPrice || 0) * 0.07).toLocaleString('th-TH'),
      service_charge_rate: '10%', // TODO: ดึงจาก SystemSettings  
      service_charge_amount: (Number(booking.totalPrice || 0) * 0.10).toLocaleString('th-TH'),
      
      // Final amounts
      total_amount: Number(booking.finalAmount || booking.totalPrice || 0).toLocaleString('th-TH'),
      grand_total: (Number(booking.totalPrice || 0) * 1.17).toLocaleString('th-TH'), // รวมภาษี+ค่าบริการ
      currency: 'THB',
      
      // Hotel information
      hotel_name: process.env.FROM_NAME || 'Malai Khaoyai Resort',
      hotel_email: process.env.FROM_EMAIL || 'center@malaikhaoyai.com',
      hotel_phone: '+66 44 123 456',
      hotel_address: '199 หมู่ 4 ตำบลโคกกรวด อำเภอปากช่อง จังหวัดนครราชสีมา 30130',
      hotel_website: 'https://malaikhaoyai.com',
      
      // QR Code and links
      qr_code_url: qrCodeData,
      receipt_url: `${process.env.FRONTEND_URL || 'https://app.malaikhaoyai.com'}/receipt/${booking.id}`,
      manage_booking_url: `${process.env.FRONTEND_URL || 'https://app.malaikhaoyai.com'}/booking/${booking.bookingReferenceId || booking.id}`,
      
      // Current date
      current_date: new Date().toLocaleDateString('th-TH')
    };
  }

  // ============================================
  // PAYMENT RECEIPT TEMPLATES
  // ============================================

  /**
   * เตรียมข้อมูลสำหรับ Payment Receipt Email
   */
  async preparePaymentReceiptData(data: PaymentEmailData): Promise<any> {
    const { booking, payment, guest, roomType } = data;
    
    const paymentDate = new Date(payment.createdAt || payment.paidAt);
    const checkinDate = new Date(booking.checkinDate);
    const checkoutDate = new Date(booking.checkoutDate);
    const nights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      // Company & receipt info
      logo_url: getLogoUrl(),
      receipt_number: `RCP-${payment.id.slice(-8).toUpperCase()}`,
      payment_date: paymentDate.toLocaleDateString('th-TH', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      
      // Customer information
      guest_name: `${guest.firstName} ${guest.lastName}`,
      guest_email: guest.email,
      guest_phone: guest.phone || guest.phoneNumber || '-',
      guest_country: guest.country || 'Thailand',
      
      // Booking information
      booking_reference: booking.bookingReferenceId || booking.id,
      room_type: roomType.name,
      checkin_date: checkinDate.toLocaleDateString('th-TH', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      checkout_date: checkoutDate.toLocaleDateString('th-TH', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      nights: nights.toString(),
      
      // Payment information
      payment_id: payment.id,
      payment_reference: payment.omiseChargeId || payment.transactionId || payment.id,
      payment_method: payment.paymentMethodType || 'Credit Card',
      payment_amount: Number(payment.amount || 0).toLocaleString('th-TH'),
      payment_status: payment.status === 'PAID' ? 'ชำระเงินแล้ว' : payment.status || 'PAID',
      
      // Receipt details - Enhanced with calculations
      base_amount: Number(payment.amount || 0).toLocaleString('th-TH'),
      tax_rate: '7%', // TODO: ดึงจาก SystemSettings
      tax_amount: (Number(payment.amount || 0) * 0.07).toLocaleString('th-TH'),
      service_charge_rate: '10%', // TODO: ดึงจาก SystemSettings
      service_charge: (Number(payment.amount || 0) * 0.10).toLocaleString('th-TH'),
      grand_total: (Number(payment.amount || 0) * 1.17).toLocaleString('th-TH'),
      
      // Hotel information
      hotel_name: process.env.FROM_NAME || 'มาลัย เวลเนส',
      hotel_email: process.env.FROM_EMAIL || 'center@malaikhaoyai.com',
      hotel_phone: process.env.HOTEL_PHONE || '-',
      hotel_address: process.env.HOTEL_ADDRESS || '17/88 หมู่ที่ 1 ต.บางรักน้อย อ.เมืองนนทบุรี จ.นนทบุรี 11000',
      hotel_website: process.env.HOTEL_WEBSITE || 'https://malaikhaoyai.com',
      
      // Download links
      receipt_download_url: `${process.env.FRONTEND_URL || 'https://app.malaikhaoyai.com'}/receipt/${payment.id}/download`
    };
  }

  // ============================================
  // CHECK-IN REMINDER TEMPLATES
  // ============================================

  /**
   * เตรียมข้อมูลสำหรับ Check-in Reminder Email
   */
  async prepareCheckInReminderData(data: CheckInReminderData): Promise<any> {
    const { booking, guest, roomType, daysUntilCheckin } = data;
    
    const checkinDate = new Date(booking.checkinDate);
    const checkoutDate = new Date(booking.checkoutDate);
    const nights = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Generate QR Code for check-in
    const qrCodeData = await this.generateCheckInQRCode(booking.bookingReferenceId || booking.id);
    
    return {
      // Logo and branding
      logo_url: getLogoUrl(),
      
      // Guest information
      guest_name: `${guest.firstName} ${guest.lastName}`,
      guest_email: guest.email,
      guest_phone: guest.phone || guest.phoneNumber || '-',
      
      // Countdown information
      days_until_checkin: daysUntilCheckin.toString(),
      
      // Booking information
      booking_reference: booking.bookingReferenceId || booking.id,
      room_type: roomType.name,
      checkin_date: checkinDate.toLocaleDateString('th-TH', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      checkout_date: checkoutDate.toLocaleDateString('th-TH', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      nights: nights.toString(),
      guest_count: ((booking.numAdults || 0) + (booking.numChildren || 0)).toString(),
      
      // QR Code for check-in
      qr_code_url: qrCodeData,
      
      // Hotel information
      hotel_name: process.env.FROM_NAME || 'มาลัย เวลเนส',
      hotel_email: process.env.FROM_EMAIL || 'center@malaikhaoyai.com',
      hotel_phone: process.env.HOTEL_PHONE || '-',
      hotel_address: process.env.HOTEL_ADDRESS || '17/88 หมู่ที่ 1 ต.บางรักน้อย อ.เมืองนนทบุรี จ.นนทบุรี 11000',
      hotel_website: process.env.HOTEL_WEBSITE || 'https://malaikhaoyai.com',
      
      // Useful links
      manage_booking_url: `${process.env.FRONTEND_URL || 'https://app.malaikhaoyai.com'}/booking/${booking.bookingReferenceId || booking.id}`
    };
  }

  // ============================================
  // TEMPLATE MANAGEMENT
  // ============================================

  /**
   * ดูรายการ template variables ที่ใช้ได้
   */
  getTemplateVariables(emailType: EmailType): TemplateVariable[] {
    const commonVariables: TemplateVariable[] = [
      { key: 'guest_name', description: 'ชื่อแขก', type: 'string', required: true },
      { key: 'hotel_name', description: 'ชื่อโรงแรม', type: 'string', required: true },
      { key: 'current_date', description: 'วันที่ปัจจุบัน', type: 'date', required: false }
    ];

    switch (emailType) {
      case EmailType.BOOKING_CONFIRMATION:
        return [
          ...commonVariables,
          { key: 'booking_reference', description: 'หมายเลขการจอง', type: 'string', required: true },
          { key: 'checkin_date', description: 'วันที่เช็คอิน', type: 'date', required: true },
          { key: 'checkout_date', description: 'วันที่เช็คเอาท์', type: 'date', required: true },
          { key: 'room_type', description: 'ประเภทห้อง', type: 'string', required: true },
          { key: 'total_amount', description: 'ราคารวม', type: 'string', required: true },
          { key: 'qr_code_url', description: 'QR Code สำหรับเช็คอิน', type: 'url', required: false }
        ];
        
      case EmailType.PAYMENT_RECEIPT:
        return [
          ...commonVariables,
          { key: 'payment_id', description: 'หมายเลขการชำระเงิน', type: 'string', required: true },
          { key: 'payment_amount', description: 'จำนวนเงิน', type: 'string', required: true },
          { key: 'payment_date', description: 'วันที่ชำระเงิน', type: 'date', required: true },
          { key: 'payment_method', description: 'วิธีการชำระเงิน', type: 'string', required: true }
        ];
        
      case EmailType.CHECKIN_REMINDER:
        return [
          ...commonVariables,
          { key: 'days_until_checkin', description: 'จำนวนวันก่อนเช็คอิน', type: 'number', required: true },
          { key: 'reminder_type', description: 'ประเภทการแจ้งเตือน', type: 'string', required: true },
          { key: 'checkin_instructions', description: 'คำแนะนำการเช็คอิน', type: 'string', required: false }
        ];
        
      default:
        return commonVariables;
    }
  }

  /**
   * แทนที่ variables ใน template
   */
  renderTemplate(template: string, variables: any): string {
    let renderedTemplate = template;
    
    // Replace all {{variable}} patterns
    Object.keys(variables).forEach(key => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      const value = variables[key] || '';
      renderedTemplate = renderedTemplate.replace(placeholder, value);
    });
    
    // Handle conditional blocks {{#if variable}} ... {{/if}}
    renderedTemplate = this.processConditionals(renderedTemplate, variables);
    
    return renderedTemplate;
  }

  /**
   * ประมวลผล conditional blocks ใน template
   */
  private processConditionals(template: string, variables: any): string {
    // Simple conditional processing for {{#if variable}} ... {{/if}}
    const conditionalRegex = /{{#if\s+(\w+)}}(.*?){{\/if}}/gs;
    
    return template.replace(conditionalRegex, (match, variableName, content) => {
      const variableValue = variables[variableName];
      
      // Show content if variable exists and is truthy
      if (variableValue && variableValue !== '' && variableValue !== 0) {
        return content;
      }
      
      return ''; // Hide content if variable is falsy
    });
  }

  /**
   * ตรวจสอบความครบถ้วนของ variables
   */
  validateTemplateVariables(emailType: EmailType, variables: any): string[] {
    const requiredVariables = this.getTemplateVariables(emailType)
      .filter(v => v.required)
      .map(v => v.key);
    
    const missingVariables: string[] = [];
    
    requiredVariables.forEach(varName => {
      if (!variables[varName] || variables[varName] === '') {
        missingVariables.push(varName);
      }
    });
    
    return missingVariables;
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const emailTemplateService = new EmailTemplateService();
export default emailTemplateService;
