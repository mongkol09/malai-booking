/**
 * Malai Khaoyai Resort - Booking Confirmation Email Template
 * Based on the official design provided
 */

export interface BookingTemplateData {
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  room_type: string;
  guest_count: string;
  checkin_date: string;
  checkout_date: string;
  payment_amount: string;
  tax_amount: string;
  booking_reference: string;
  hotel_name?: string;
  current_date?: string;
}

export const malaiBookingConfirmationTemplate = (data: BookingTemplateData): string => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmation - Malai Khaoyai</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
            padding: 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #8B7355, #A0896B);
            color: white;
            text-align: center;
            padding: 40px 20px;
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 20px;
            background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCA2MCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzAiIGN5PSI4IiByPSI2IiBmaWxsPSIjNzA1ODQyIi8+CjxjaXJjbGUgY3g9IjMwIiBjeT0iMTYiIHI9IjMiIGZpbGw9IiM3MDU4NDIiLz4KPC9zdmc+');
            background-repeat: no-repeat;
            background-position: center;
        }
        
        .logo {
            font-size: 48px;
            font-weight: 300;
            letter-spacing: 8px;
            margin: 20px 0 10px 0;
            text-transform: uppercase;
        }
        
        .tagline {
            font-size: 14px;
            font-weight: 400;
            letter-spacing: 2px;
            opacity: 0.9;
            margin-bottom: 10px;
        }
        
        .subtitle {
            font-size: 12px;
            font-weight: 300;
            opacity: 0.8;
            font-style: italic;
        }
        
        .content {
            padding: 0;
        }
        
        .confirmation-header {
            background: #f8f6f3;
            text-align: center;
            padding: 40px 20px;
        }
        
        .confirmation-title {
            font-size: 36px;
            font-weight: 600;
            color: #8B7355;
            margin-bottom: 10px;
        }
        
        .confirmation-subtitle {
            font-size: 20px;
            font-weight: 400;
            color: #8B7355;
            margin-bottom: 30px;
        }
        
        .greeting {
            font-size: 18px;
            color: #8B7355;
            margin-bottom: 20px;
        }
        
        .intro-text {
            font-size: 14px;
            color: #666;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        
        .section {
            margin: 0;
            background: white;
        }
        
        .section-header {
            background: linear-gradient(135deg, #8B7355, #A0896B);
            color: white;
            padding: 15px 20px;
            font-size: 24px;
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .section-icon {
            font-size: 20px;
            opacity: 0.8;
        }
        
        .section-content {
            padding: 30px;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 0;
            border-bottom: 1px solid #e9ecef;
            font-size: 16px;
        }
        
        .detail-row:last-child {
            border-bottom: none;
        }
        
        .detail-label {
            font-weight: 500;
            color: #8B7355;
            flex: 1;
        }
        
        .detail-value {
            font-weight: 600;
            color: #333;
            text-align: right;
            flex: 1;
        }
        
        .policy-section {
            background: #f8f6f3;
            padding: 30px;
            margin: 0;
        }
        
        .policy-header {
            background: linear-gradient(135deg, #8B7355, #A0896B);
            color: white;
            padding: 15px 20px;
            font-size: 24px;
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin: 0 -30px 20px -30px;
        }
        
        .policy-text {
            font-size: 14px;
            color: #666;
            margin-bottom: 30px;
        }
        
        .closing-message {
            font-size: 18px;
            font-weight: 500;
            color: #8B7355;
            text-align: center;
            margin: 20px 0;
        }
        
        .contact-section {
            background: linear-gradient(135deg, #8B7355, #A0896B);
            color: white;
            padding: 40px;
            display: flex;
            align-items: center;
            gap: 40px;
        }
        
        .contact-text {
            flex: 1;
        }
        
        .contact-title {
            font-size: 32px;
            font-weight: 300;
            font-style: italic;
            margin-bottom: 10px;
            line-height: 1.2;
        }
        
        .contact-subtitle {
            font-size: 18px;
            font-weight: 400;
            margin-bottom: 20px;
        }
        
        .contact-info {
            font-size: 14px;
            line-height: 1.8;
        }
        
        .contact-info div {
            margin-bottom: 5px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .contact-image {
            flex: 1;
            text-align: right;
        }
        
        .contact-image img {
            max-width: 200px;
            height: auto;
            border-radius: 8px;
            opacity: 0.9;
        }
        
        .footer {
            background: #2c2c2c;
            color: #ccc;
            text-align: center;
            padding: 20px;
            font-size: 12px;
        }
        
        @media (max-width: 600px) {
            .email-container {
                margin: 0;
                border-radius: 0;
            }
            
            .logo {
                font-size: 36px;
                letter-spacing: 4px;
            }
            
            .confirmation-title {
                font-size: 28px;
            }
            
            .contact-section {
                flex-direction: column;
                text-align: center;
                gap: 20px;
            }
            
            .contact-image {
                text-align: center;
            }
            
            .section-content {
                padding: 20px;
            }
            
            .detail-row {
                flex-direction: column;
                align-items: flex-start;
                gap: 5px;
            }
            
            .detail-value {
                text-align: left;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">MALAI</div>
            <div class="tagline">Khaoyai</div>
            <div class="subtitle">Your most memorable days await you</div>
        </div>
        
        <!-- Confirmation Header -->
        <div class="confirmation-header">
            <h1 class="confirmation-title">Booking Confirmation</h1>
            <h2 class="confirmation-subtitle">Your reservation is confirmed!</h2>
            
            <div class="greeting">Hi ${data.guest_name},</div>
            <div class="intro-text">
                Thank you for choosing to stay at <strong>Malai Khaoyai</strong>.<br><br>
                We're pleased to confirm your reservation for <strong>${data.room_type}</strong> At Malai Khaoyai,<br>
                Booked by ${data.guest_name}, Email : ${data.guest_email} Contact : ${data.guest_phone}
            </div>
        </div>
        
        <!-- Reservation Details -->
        <div class="section">
            <div class="section-header">
                <span>Reservation Details</span>
                <span class="section-icon">📋</span>
            </div>
            <div class="section-content">
                <div class="detail-row">
                    <span class="detail-label">Lead Guest Name:</span>
                    <span class="detail-value">${data.guest_name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Room Type:</span>
                    <span class="detail-value">${data.room_type}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Number of Guests:</span>
                    <span class="detail-value">${data.guest_count}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Check-In Date:</span>
                    <span class="detail-value">${data.checkin_date}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Check-Out Date:</span>
                    <span class="detail-value">${data.checkout_date}</span>
                </div>
            </div>
        </div>
        
        <!-- Payment Details -->
        <div class="section">
            <div class="section-header">
                <span>Payment Details</span>
                <span class="section-icon">💳</span>
            </div>
            <div class="section-content">
                <div class="detail-row">
                    <span class="detail-label">1 room x 3 nights</span>
                    <span class="detail-value">${data.payment_amount}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Other Charges</span>
                    <span class="detail-value">${data.tax_amount}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total Charge</span>
                    <span class="detail-value">${data.payment_amount}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Booking Number</span>
                    <span class="detail-value">${data.booking_reference}</span>
                </div>
            </div>
        </div>
        
        <!-- Cancellation Policy -->
        <div class="policy-section">
            <div class="policy-header">
                <span>Cancellation Policy</span>
                <span class="section-icon">🏨</span>
            </div>
            <div class="policy-text">
                This booking is non-refundable.
            </div>
            <div class="closing-message">
                We look forward to welcoming you to Malai Khaoyai.
            </div>
        </div>
        
        <!-- Contact Section -->
        <div class="contact-section">
            <div class="contact-text">
                <div class="contact-title">Got more questions?</div>
                <div class="contact-subtitle">Send them to us!</div>
                <div class="contact-info">
                    <div>📞 083-922-2929</div>
                    <div>✉️ center@malaikhaoyai.com</div>
                    <div>🌐 www.malairesort.com</div>
                </div>
            </div>
            <div class="contact-image">
                <!-- Placeholder for couple image -->
                <div style="width: 200px; height: 150px; background: rgba(255,255,255,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.7); font-size: 14px;">
                    Resort Image<br/>Placeholder
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p>&copy; 2025 Malai Khaoyai Resort. All rights reserved.</p>
            <p>This email was sent to ${data.guest_email}</p>
        </div>
    </div>
</body>
</html>
`;

// Text version for email clients that don't support HTML
export const malaiBookingConfirmationTextTemplate = (data: BookingTemplateData): string => `
MALAI KHAOYAI RESORT
Your most memorable days await you

BOOKING CONFIRMATION
Your reservation is confirmed!

Hi ${data.guest_name},

Thank you for choosing to stay at Malai Khaoyai.

We're pleased to confirm your reservation for ${data.room_type} At Malai Khaoyai,
Booked by ${data.guest_name}, Email: ${data.guest_email} Contact: ${data.guest_phone}

RESERVATION DETAILS
================================
Lead Guest Name: ${data.guest_name}
Room Type: ${data.room_type}
Number of Guests: ${data.guest_count}
Check-In Date: ${data.checkin_date}
Check-Out Date: ${data.checkout_date}

PAYMENT DETAILS
================================
1 room x 3 nights: ${data.payment_amount}
Other Charges: ${data.tax_amount}
Total Charge: ${data.payment_amount}
Booking Number: ${data.booking_reference}

CANCELLATION POLICY
================================
This booking is non-refundable.

We look forward to welcoming you to Malai Khaoyai.

GOT MORE QUESTIONS?
Send them to us!
📞 083-922-2929
✉️ center@malaikhaoyai.com
🌐 www.malairesort.com

---
© 2025 Malai Khaoyai Resort. All rights reserved.
This email was sent to ${data.guest_email}
`;
