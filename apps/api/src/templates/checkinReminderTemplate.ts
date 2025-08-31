/**
 * Check-in Reminder Email Template
 * สำหรับแจ้งเตือนการเช็คอิน
 */

import { getLogoUrl } from './logoAssets';

export const checkinReminderTemplate = `
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>แจ้งเตือนการเช็คอิน - มาลัย เวลเนส</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600&display=swap');
        
        body {
            font-family: 'Sarabun', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f7f5f3;
            color: #2c1810;
            line-height: 1.6;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            text-align: center;
            padding: 30px 20px;
        }
        
        .logo {
            max-width: 280px;
            width: 70%;
            height: auto;
            margin-bottom: 15px;
        }
        
        .reminder-title {
            font-size: 28px;
            font-weight: 600;
            margin: 10px 0;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }
        
        .reminder-subtitle {
            font-size: 16px;
            opacity: 0.9;
            margin: 0;
        }
        
        /* Countdown Section */
        .countdown-section {
            background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%);
            color: white;
            text-align: center;
            padding: 25px 20px;
        }
        
        .countdown-box {
            background-color: rgba(255,255,255,0.2);
            border-radius: 15px;
            padding: 20px;
            margin: 0 auto;
            max-width: 300px;
        }
        
        .countdown-number {
            font-size: 48px;
            font-weight: 600;
            margin: 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .countdown-text {
            font-size: 18px;
            margin: 5px 0;
            font-weight: 500;
        }
        
        .countdown-subtext {
            font-size: 14px;
            opacity: 0.9;
            margin: 0;
        }
        
        /* Content Section */
        .content {
            padding: 30px 25px;
        }
        
        .welcome-message {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .welcome-text {
            font-size: 20px;
            color: #28a745;
            font-weight: 500;
            margin-bottom: 10px;
        }
        
        .guest-name {
            font-size: 24px;
            color: #2c1810;
            font-weight: 600;
            margin: 0;
        }
        
        /* Booking Details */
        .booking-details {
            background-color: #f8f9fa;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 25px;
            border-left: 5px solid #28a745;
        }
        
        .detail-title {
            font-size: 18px;
            font-weight: 600;
            color: #28a745;
            margin-bottom: 15px;
        }
        
        .detail-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        
        .detail-item {
            background-color: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .detail-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        
        .detail-value {
            font-size: 16px;
            font-weight: 600;
            color: #333;
        }
        
        .detail-value.highlight {
            color: #28a745;
        }
        
        /* QR Code Section */
        .qr-section {
            background-color: #e8f5e8;
            border-radius: 12px;
            padding: 25px;
            text-align: center;
            margin-bottom: 25px;
            border: 2px dashed #28a745;
        }
        
        .qr-title {
            font-size: 18px;
            font-weight: 600;
            color: #28a745;
            margin-bottom: 15px;
        }
        
        .qr-code {
            max-width: 200px;
            width: 100%;
            height: auto;
            border-radius: 8px;
            background-color: white;
            padding: 15px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .qr-instructions {
            font-size: 14px;
            color: #666;
            margin-top: 15px;
            line-height: 1.5;
        }
        
        /* Checkin Information */
        .checkin-info {
            background-color: #fff3cd;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 25px;
            border-left: 5px solid #ffc107;
        }
        
        .info-title {
            font-size: 16px;
            font-weight: 600;
            color: #856404;
            margin-bottom: 10px;
        }
        
        .info-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .info-item {
            padding: 8px 0;
            border-bottom: 1px solid #f0e68c;
        }
        
        .info-item:last-child {
            border-bottom: none;
        }
        
        .info-item strong {
            color: #856404;
        }
        
        /* Contact Section */
        .contact-section {
            background-color: #d1ecf1;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 25px;
            border-left: 5px solid #17a2b8;
        }
        
        .contact-title {
            font-size: 16px;
            font-weight: 600;
            color: #0c5460;
            margin-bottom: 15px;
        }
        
        .contact-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        
        .contact-item {
            font-size: 14px;
            color: #0c5460;
        }
        
        /* Footer */
        .footer {
            background-color: #28a745;
            color: white;
            text-align: center;
            padding: 25px 20px;
        }
        
        .footer-message {
            font-size: 18px;
            font-weight: 500;
            margin-bottom: 10px;
        }
        
        .footer-subtitle {
            font-size: 14px;
            opacity: 0.9;
        }
        
        /* Mobile Responsive */
        @media (max-width: 600px) {
            .container {
                margin: 10px;
            }
            
            .detail-grid,
            .contact-info {
                grid-template-columns: 1fr;
            }
            
            .countdown-number {
                font-size: 36px;
            }
            
            .content {
                padding: 20px 15px;
            }
            
            .booking-details,
            .qr-section,
            .checkin-info,
            .contact-section {
                padding: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <img src="{{logo_url}}" alt="Malai Wellness Logo" class="logo">
            <h1 class="reminder-title">แจ้งเตือนการเช็คอิน</h1>
            <p class="reminder-subtitle">Check-in Reminder</p>
        </div>

        <!-- Countdown Section -->
        <div class="countdown-section">
            <div class="countdown-box">
                <div class="countdown-number">{{days_until_checkin}}</div>
                <div class="countdown-text">วันอีก</div>
                <div class="countdown-subtext">ถึงวันเช็คอิน</div>
            </div>
        </div>

        <!-- Content -->
        <div class="content">
            <!-- Welcome Message -->
            <div class="welcome-message">
                <div class="welcome-text">สวัสดีคุณ</div>
                <div class="guest-name">{{guest_name}}</div>
            </div>

            <!-- Booking Details -->
            <div class="booking-details">
                <div class="detail-title">รายละเอียดการจอง</div>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">หมายเลขการจอง</div>
                        <div class="detail-value highlight">{{booking_reference}}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">ประเภทห้อง</div>
                        <div class="detail-value">{{room_type}}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">วันเช็คอิน</div>
                        <div class="detail-value highlight">{{checkin_date}}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">วันเช็คเอาท์</div>
                        <div class="detail-value">{{checkout_date}}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">จำนวนคืน</div>
                        <div class="detail-value">{{nights}} คืน</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">จำนวนแขก</div>
                        <div class="detail-value">{{guest_count}} ท่าน</div>
                    </div>
                </div>
            </div>

            <!-- QR Code Section -->
            <div class="qr-section">
                <div class="qr-title">🔗 QR Code สำหรับเช็คอิน</div>
                <img src="{{qr_code_url}}" alt="Check-in QR Code" class="qr-code">
                <div class="qr-instructions">
                    แสดง QR Code นี้ที่เคาน์เตอร์เช็คอิน<br>
                    เพื่อความสะดวกและรวดเร็วในการเช็คอิน
                </div>
            </div>

            <!-- Check-in Information -->
            <div class="checkin-info">
                <div class="info-title">📋 ข้อมูลการเช็คอิน</div>
                <ul class="info-list">
                    <li class="info-item">
                        <strong>เวลาเช็คอิน:</strong> 15:00 น. เป็นต้นไป
                    </li>
                    <li class="info-item">
                        <strong>เวลาเช็คเอาท์:</strong> 11:00 น.
                    </li>
                    <li class="info-item">
                        <strong>เอกสารที่ต้องนำมา:</strong> บัตรประชาชน หรือ หนังสือเดินทาง
                    </li>
                    <li class="info-item">
                        <strong>ที่จอดรถ:</strong> ฟรีสำหรับผู้เข้าพัก
                    </li>
                    <li class="info-item">
                        <strong>Wi-Fi:</strong> ฟรีทุกพื้นที่ในรีสอร์ท
                    </li>
                </ul>
            </div>

            <!-- Contact Information -->
            <div class="contact-section">
                <div class="contact-title">📞 ติดต่อเรา</div>
                <div class="contact-info">
                    <div class="contact-item"><strong>อีเมล:</strong> {{hotel_email}}</div>
                    <div class="contact-item"><strong>เว็บไซต์:</strong> {{hotel_website}}</div>
                    <div class="contact-item"><strong>ที่อยู่:</strong> {{hotel_address}}</div>
                    <div class="contact-item"><strong>โทรศัพท์:</strong> {{hotel_phone}}</div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-message">🏨 รอคอยต้อนรับคุณ!</div>
            <div class="footer-subtitle">มาลัย เวลเนส - ประสบการณ์พักผ่อนที่น่าจดจำ</div>
        </div>
    </div>
</body>
</html>
`;

export default checkinReminderTemplate;
