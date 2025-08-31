/**
 * Check-out Reminder Email Template
 * แจ้งเตือนลูกค้าก่อนวันเช็คเอาท์ 2 ชั่วโมง
 */

import { getLogoUrl } from './logoAssets';

export const checkoutReminderTemplate = `
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>แจ้งเตือนการเช็คเอาท์ - Malai Khaoyai Resort</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600&display=swap');
        
        body {
            font-family: 'Sarabun', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
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
            background: linear-gradient(135deg, #fd7e14 0%, #ff6b35 100%);
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
        
        .header h1 {
            margin: 10px 0;
            font-size: 28px;
            font-weight: 600;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }
        
        .header p {
            margin: 0;
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 30px;
        }
        
        .checkout-notice {
            background: linear-gradient(135deg, #ffc107 0%, #ff8f00 100%);
            color: #000;
            text-align: center;
            padding: 20px;
            margin: -10px -30px 30px -30px;
            font-size: 18px;
            font-weight: 600;
        }
        
        .time-remaining {
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
            color: white;
            text-align: center;
            padding: 25px;
            margin: 25px 0;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        
        .time-number {
            font-size: 48px;
            font-weight: 600;
            margin: 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .time-text {
            font-size: 18px;
            margin: 5px 0 0 0;
            opacity: 0.9;
        }
        
        .stay-summary {
            background-color: #f8f9fa;
            border-left: 4px solid #fd7e14;
            padding: 20px;
            margin: 25px 0;
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
            background-color: #ffffff;
            border-radius: 8px;
            border: 1px solid #e9ecef;
        }
        
        .info-label {
            font-weight: 600;
            color: #fd7e14;
            font-size: 14px;
            margin-bottom: 5px;
        }
        
        .info-value {
            font-size: 16px;
            color: #2c1810;
        }
        
        .checkout-process {
            background-color: #fff3cd;
            padding: 25px;
            border-radius: 8px;
            margin: 25px 0;
            border: 1px solid #ffeaa7;
        }
        
        .checkout-process h3 {
            margin-top: 0;
            color: #856404;
            font-size: 20px;
        }
        
        .process-step {
            display: flex;
            align-items: flex-start;
            margin: 15px 0;
            padding: 12px;
            background-color: #ffffff;
            border-radius: 8px;
            border-left: 4px solid #ffc107;
        }
        
        .step-number {
            width: 30px;
            height: 30px;
            background-color: #ffc107;
            border-radius: 50%;
            margin-right: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #000;
            font-weight: bold;
            font-size: 14px;
            flex-shrink: 0;
        }
        
        .step-content {
            flex: 1;
        }
        
        .step-title {
            font-weight: 600;
            color: #856404;
            margin-bottom: 5px;
        }
        
        .step-description {
            color: #6c757d;
            font-size: 14px;
        }
        
        .charges-info {
            background-color: #d1ecf1;
            border: 1px solid #bee5eb;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
        }
        
        .feedback-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            border-radius: 8px;
            margin: 25px 0;
            text-align: center;
        }
        
        .feedback-btn {
            display: inline-block;
            background-color: #28a745;
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 25px;
            margin: 15px 0;
            font-weight: 600;
            transition: background-color 0.3s;
        }
        
        .feedback-btn:hover {
            background-color: #218838;
        }
        
        .footer {
            background-color: #2c1810;
            color: white;
            text-align: center;
            padding: 25px;
            font-size: 14px;
        }
        
        .thank-you-box {
            background: linear-gradient(135deg, #48C9B0 0%, #17A2B8 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px;
            margin: 25px 0;
        }
        
        @media (max-width: 600px) {
            .info-grid {
                grid-template-columns: 1fr;
            }
            
            .content {
                padding: 20px;
            }
            
            .checkout-notice {
                margin: -10px -20px 20px -20px;
                font-size: 16px;
            }
            
            .time-number {
                font-size: 36px;
            }
            
            .process-step {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .step-number {
                margin-bottom: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <img src="{{logo_url}}" alt="Malai Khaoyai Resort" class="logo">
            <h1>แจ้งเตือนการเช็คเอาท์</h1>
            <p>Check-out Reminder</p>
        </div>
        
        <!-- Checkout Notice -->
        <div class="checkout-notice">
            ⏰ ขอแจ้งเตือนเวลาเช็คเอาท์ของท่าน
        </div>
        
        <!-- Content -->
        <div class="content">
            <p>เรียน คุณ <strong>{{guest_name}}</strong>,</p>
            
            <p>หวังว่าท่านจะมีความสุขกับการพักผ่อนที่ <strong>Malai Khaoyai Resort</strong> ของเรา</p>
            
            <!-- Time Remaining -->
            <div class="time-remaining">
                <div class="time-number">2</div>
                <div class="time-text">ชั่วโมงก่อนเวลาเช็คเอาท์</div>
            </div>
            
            <!-- Stay Summary -->
            <div class="stay-summary">
                <h3 style="margin-top: 0; color: #fd7e14;">สรุปการเข้าพัก</h3>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>หมายเลขการจอง:</strong> {{booking_reference}}
                    </div>
                    <div style="color: #28a745; font-weight: 600;">
                        เสร็จสิ้น ✓
                    </div>
                </div>
            </div>
            
            <!-- Checkout Details -->
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">📅 วันที่เช็คเอาท์</div>
                    <div class="info-value">{{checkout_date}}</div>
                    <div style="font-size: 14px; color: #666; margin-top: 5px;">
                        ⏰ ก่อนเวลา 11:00 น.
                    </div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">🏨 ห้องพัก</div>
                    <div class="info-value">{{room_type}}</div>
                    <div style="font-size: 14px; color: #666; margin-top: 5px;">
                        ห้อง {{room_number}}
                    </div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">📊 จำนวนคืนที่พัก</div>
                    <div class="info-value">{{nights}} คืน</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">👥 จำนวนผู้พัก</div>
                    <div class="info-value">{{guest_count}} ท่าน</div>
                </div>
            </div>
            
            <!-- Checkout Process -->
            <div class="checkout-process">
                <h3>📋 ขั้นตอนการเช็คเอาท์</h3>
                
                <div class="process-step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <div class="step-title">เก็บกระเป๋าและของใช้ส่วนตัว</div>
                        <div class="step-description">ตรวจสอบในห้องน้ำ ลิ้นชัก และตู้เสื้อผ้า</div>
                    </div>
                </div>
                
                <div class="process-step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <div class="step-title">ส่งคืนกุญแจห้อง และ Key Card</div>
                        <div class="step-description">ที่เคาน์เตอร์ Reception หรือฝากไว้ในห้อง</div>
                    </div>
                </div>
                
                <div class="process-step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <div class="step-title">ตรวจสอบค่าใช้จ่ายเพิ่มเติม (ถ้ามี)</div>
                        <div class="step-description">Mini bar, Room service, Late checkout</div>
                    </div>
                </div>
                
                <div class="process-step">
                    <div class="step-number">4</div>
                    <div class="step-content">
                        <div class="step-title">รับใบเสร็จและเอกสารการพัก</div>
                        <div class="step-description">สำหรับการเบิกค่าใช้จ่าย (ถ้าต้องการ)</div>
                    </div>
                </div>
            </div>
            
            <!-- Additional Charges Info -->
            <div class="charges-info">
                <h4 style="margin-top: 0; color: #0c5460;">💳 ค่าใช้จ่ายเพิ่มเติม</h4>
                <p style="margin-bottom: 0; color: #0c5460;">
                    <strong>Late Check-out:</strong> หากต้องการออกหลัง 11:00 น. จะมีค่าบริการเพิ่มเติม<br>
                    <strong>Mini Bar:</strong> ตรวจสอบการใช้งานและชำระที่เคาน์เตอร์<br>
                    <strong>Damage:</strong> หากมีความเสียหายในห้อง กรุณาแจ้ง Reception
                </p>
            </div>
            
            <!-- Thank You Section -->
            <div class="thank-you-box">
                <h3 style="margin-top: 0;">🙏 ขอบคุณที่เลือกพักกับเรา</h3>
                <p style="margin: 15px 0; font-size: 18px;">
                    หวังว่าท่านจะมีประสบการณ์ที่ดีและประทับใจ
                </p>
                <p style="margin-bottom: 0; opacity: 0.9;">
                    เราหวังว่าจะได้ต้อนรับท่านอีกครั้งในอนาคต
                </p>
            </div>
            
            <!-- Feedback Section -->
            <div class="feedback-section">
                <h3 style="margin-top: 0;">⭐ แบ่งปันประสบการณ์ของท่าน</h3>
                <p>ความคิดเห็นของท่านมีความสำคัญต่อเรามาก</p>
                <a href="{{feedback_url}}" class="feedback-btn">ให้คะแนนและรีวิว</a>
                <p style="margin-bottom: 0; font-size: 14px; opacity: 0.9;">
                    ใช้เวลาเพียง 2 นาที และได้รับส่วนลด 10% สำหรับการจองครั้งต่อไป
                </p>
            </div>
            
            <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #155724;">📱 เก็บความทรงจำ</h4>
                <ul style="margin-bottom: 0; color: #155724;">
                    <li>Tag เราใน Instagram, Facebook: @MalaiKhaoyaiResort</li>
                    <li>ใช้ hashtag #MalaiKhaoyai #เขาใหญ่ #พักผ่อน</li>
                    <li>แบ่งปันรูปภาพสวยๆ กับเพื่อนๆ</li>
                </ul>
            </div>
            
            <p>ขอบคุณอีกครั้งสำหรับการเลือกใช้บริการของเรา</p>
            
            <p>เดินทางกลับอย่างปลอดภัย!<br>
            <strong>ทีมงาน Malai Khaoyai Resort</strong></p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div>
                <strong>Malai Khaoyai Resort</strong><br>
                {{hotel_address}}<br><br>
                
                📞 โทร: {{hotel_phone}}<br>
                📧 อีเมล: {{hotel_email}}<br>
                🌐 เว็บไซต์: {{hotel_website}}
            </div>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #444; font-size: 12px;">
                <p>💝 <strong>Loyalty Program:</strong> สะสมคะแนนทุกการพัก รับสิทธิพิเศษ</p>
                <p>🎁 <strong>Next Stay Discount:</strong> รับส่วนลด 15% สำหรับการจองครั้งต่อไป</p>
                <p>📧 <strong>Newsletter:</strong> รับข้อเสนอพิเศษและกิจกรรมใหม่ๆ</p>
                <br>
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
    'checkout_date',
    'room_type',
    'room_number',
    'guest_count',
    'nights',
    'hotel_phone',
    'hotel_email',
    'hotel_address',
    'hotel_website',
    'feedback_url'
];

export default checkoutReminderTemplate;
