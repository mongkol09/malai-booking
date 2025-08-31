/**
 * Simple Email Template that matches our Database Structure
 * No complex nested objects - just flat variables from our booking data
 */

import { getLogoUrl } from './logoAssets';

export const bookingConfirmationTemplate = `
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>การยืนยันการจอง - Malai Khaoyai Resort</title>
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
            background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
            color: white;
            text-align: center;
            padding: 30px 20px;
        }
        
        .logo {
            max-width: 300px;
            width: 80%;
            height: auto;
            margin-bottom: 20px;
        }
        
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        
        .content {
            padding: 30px;
        }
        
        .booking-info {
            background-color: #faf8f6;
            border-left: 4px solid #8B4513;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 20px 0;
        }
        
        .info-item {
            padding: 15px;
            background-color: #f9f7f5;
            border-radius: 8px;
        }
        
        .info-label {
            font-weight: 600;
            color: #8B4513;
            font-size: 14px;
            margin-bottom: 5px;
        }
        
        .info-value {
            font-size: 16px;
            color: #2c1810;
        }
        
        .qr-section {
            text-align: center;
            padding: 25px;
            background-color: #f0f0f0;
            border-radius: 8px;
            margin: 25px 0;
        }
        
        .qr-code {
            max-width: 150px;
            height: auto;
            border: 3px solid #8B4513;
            border-radius: 8px;
            padding: 10px;
            background-color: white;
        }
        
        .footer {
            background-color: #2c1810;
            color: white;
            text-align: center;
            padding: 25px;
            font-size: 14px;
        }
        
        .contact-info {
            margin: 15px 0;
        }
        
        .total-price {
            font-size: 24px;
            font-weight: 600;
            color: #8B4513;
            text-align: center;
            padding: 15px;
            background-color: #fff8f0;
            border: 2px solid #8B4513;
            border-radius: 8px;
            margin: 20px 0;
        }
        
        @media (max-width: 600px) {
            .info-grid {
                grid-template-columns: 1fr;
            }
            
            .content {
                padding: 20px;
            }
            
            .header h1 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <!-- Logo -->
            <img src="{{logo_url}}" alt="Malai Khaoyai Resort" class="logo" style="display: block; margin: 0 auto 20px auto; max-width: 300px; width: 80%; height: auto;" />
            <h1>การยืนยันการจอง</h1>
            <p>Booking Confirmation</p>
        </div>
        
        <!-- Content -->
        <div class="content">
            <p>เรียน คุณ <strong>{{guest_name}}</strong>,</p>
            
            <p>ขอบคุณที่เลือกใช้บริการ <strong>Malai Khaoyai Resort</strong> เราได้รับการจองของท่านเรียบร้อยแล้ว</p>
            
            <!-- Booking Summary -->
            <div class="booking-info">
                <h3 style="margin-top: 0; color: #8B4513;">รายละเอียดการจอง</h3>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>หมายเลขการจอง:</strong> {{booking_reference}}
                    </div>
                    <div style="color: #28a745; font-weight: 600;">
                        {{booking_status}}
                    </div>
                </div>
            </div>
            
            <!-- Booking Details Grid -->
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">วันที่เช็คอิน</div>
                    <div class="info-value">{{checkin_date}}</div>
                    <div style="font-size: 14px; color: #666;">เวลา 15:00 น.</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">วันที่เช็คเอาท์</div>
                    <div class="info-value">{{checkout_date}}</div>
                    <div style="font-size: 14px; color: #666;">เวลา 11:00 น.</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">ประเภทห้องพัก</div>
                    <div class="info-value">{{room_type}}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">หมายเลขห้อง</div>
                    <div class="info-value">{{room_number}}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">จำนวนผู้เข้าพัก</div>
                    <div class="info-value">{{guest_count}} ท่าน</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">จำนวนคืน</div>
                    <div class="info-value">{{nights}} คืน</div>
                </div>
            </div>
            
            <!-- Total Price -->
            <div class="total-price">
                ราคารวมทั้งสิ้น: ฿{{total_amount}}
            </div>
            
            <!-- Guest Information -->
            <div class="booking-info">
                <h3 style="margin-top: 0; color: #8B4513;">ข้อมูลผู้เข้าพัก</h3>
                <p><strong>ชื่อ:</strong> {{guest_name}}</p>
                <p><strong>อีเมล:</strong> {{guest_email}}</p>
                <p><strong>เบอร์โทร:</strong> {{guest_phone}}</p>
                <p><strong>ประเทศ:</strong> {{guest_country}}</p>
            </div>
            
            <!-- QR Code Section -->
            <div class="qr-section">
                <h3 style="margin-top: 0; color: #8B4513;">QR Code สำหรับเช็คอิน</h3>
                <p>แสดง QR Code นี้เมื่อมาถึงรีสอร์ท</p>
                <img src="{{qr_code_url}}" alt="QR Code" class="qr-code">
                <p style="margin-bottom: 0; font-size: 12px; color: #666;">
                    หรือแจ้งหมายเลขการจอง: {{booking_reference}}
                </p>
            </div>
            
            <!-- Important Notes -->
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #856404;">ข้อมูลสำคัญ</h4>
                <ul style="margin-bottom: 0; color: #856404;">
                    <li>กรุณามาถึงก่อนเวลา 22:00 น. ในวันเช็คอิน</li>
                    <li>โปรดเตรียมเอกสารประจำตัวสำหรับการเช็คอิน</li>
                    <li>หากต้องการเปลี่ยนแปลงหรือยกเลิกการจอง กรุณาติดต่อล่วงหน้า 24 ชั่วโมง</li>
                </ul>
            </div>
            
            <p>หากท่านมีคำถามเพิ่มเติม สามารถติดต่อเราได้ตามช่องทางด้านล่าง</p>
            
            <p>ขอบคุณและหวังว่าจะได้ต้อนรับท่าน<br>
            <strong>ทีมงาน Malai Khaoyai Resort</strong></p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="contact-info">
                <strong>Malai Khaoyai Resort</strong><br>
                199 หมู่ 4 ตำบลโคกกรวด อำเภอปากช่อง<br>
                จังหวัดนครราชสีมา 30130<br><br>
                
                📞 โทร: +66 44 123 456<br>
                📧 อีเมล: center@malaikhaoyai.com<br>
                🌐 เว็บไซต์: www.malaikhaoyai.com
            </div>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #444; font-size: 12px;">
                © 2025 Malai Khaoyai Resort. สงวนลิขสิทธิ์ทุกประการ
            </div>
        </div>
    </div>
</body>
</html>
`;

// Export template variables for reference
export const templateVariables = [
    'guest_name',
    'booking_reference', 
    'booking_status',
    'checkin_date',
    'checkout_date', 
    'room_type',
    'room_number',
    'guest_count',
    'nights',
    'total_amount',
    'guest_email',
    'guest_phone', 
    'guest_country',
    'qr_code_url'
];

export default bookingConfirmationTemplate;
