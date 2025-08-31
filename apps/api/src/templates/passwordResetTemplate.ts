// 📧 PASSWORD RESET EMAIL TEMPLATE
export const passwordResetTemplate = `
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>รีเซ็ตรหัสผ่าน - Hotel Management System</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
            padding: 30px 20px;
            text-align: center;
            color: white;
        }
        
        .header h1 {
            font-size: 24px;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #333;
        }
        
        .message {
            font-size: 16px;
            margin-bottom: 30px;
            color: #555;
            line-height: 1.8;
        }
        
        .reset-button {
            text-align: center;
            margin: 30px 0;
        }
        
        .reset-button a {
            display: inline-block;
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            text-decoration: none;
            padding: 15px 40px;
            border-radius: 50px;
            font-size: 16px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
        }
        
        .reset-button a:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
        }
        
        .security-info {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
        }
        
        .security-title {
            color: #856404;
            font-weight: 600;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
        }
        
        .security-title::before {
            content: "🔒";
            margin-right: 8px;
        }
        
        .security-list {
            color: #856404;
            font-size: 14px;
            margin: 0;
            padding-left: 20px;
        }
        
        .security-list li {
            margin-bottom: 8px;
        }
        
        .manual-link {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .manual-link h4 {
            color: #495057;
            margin-bottom: 10px;
        }
        
        .manual-link code {
            background-color: #e9ecef;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            word-break: break-all;
        }
        
        .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #dee2e6;
        }
        
        .footer p {
            color: #6c757d;
            font-size: 14px;
            margin-bottom: 10px;
        }
        
        .contact-info {
            color: #007bff;
            font-size: 14px;
        }
        
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #dee2e6, transparent);
            margin: 30px 0;
        }
        
        @media (max-width: 600px) {
            .content {
                padding: 30px 20px;
            }
            
            .header {
                padding: 20px 15px;
            }
            
            .header h1 {
                font-size: 20px;
            }
            
            .reset-button a {
                padding: 12px 30px;
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1>🔐 รีเซ็ตรหัสผ่าน</h1>
            <p>Hotel Management System</p>
        </div>
        
        <!-- Content -->
        <div class="content">
            <div class="greeting">
                สวัสดี {{user_name}},
            </div>
            
            <div class="message">
                เราได้รับคำขอให้รีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ หากคุณได้ขอรีเซ็ตรหัสผ่าน กรุณาคลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่
            </div>
            
            <!-- Reset Button -->
            <div class="reset-button">
                <a href="{{reset_url}}" target="_blank">
                    รีเซ็ตรหัสผ่าน
                </a>
            </div>
            
            <!-- Security Information -->
            <div class="security-info">
                <div class="security-title">
                    ข้อมูลด้านความปลอดภัย
                </div>
                <ul class="security-list">
                    <li><strong>ลิงก์นี้จะหมดอายุใน {{expiry_time}} นาที</strong></li>
                    <li>ลิงก์นี้ใช้ได้เพียงครั้งเดียวเท่านั้น</li>
                    <li>หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้</li>
                    <li>อย่าแชร์ลิงก์นี้กับผู้อื่น</li>
                </ul>
            </div>
            
            <div class="divider"></div>
            
            <!-- Manual Link -->
            <div class="manual-link">
                <h4>หากปุ่มด้านบนไม่ทำงาน</h4>
                <p>คุณสามารถคัดลอกลิงก์นี้และวางในเบราว์เซอร์:</p>
                <code>{{reset_url}}</code>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p>อีเมลนี้ส่งจากระบบอัตโนมัติ กรุณาอย่าตอบกลับ</p>
            <div class="contact-info">
                📧 support@hotel.com | 📞 02-xxx-xxxx<br>
                🌐 Hotel Management System
            </div>
            <p style="margin-top: 15px; font-size: 12px;">
                © {{current_year}} Hotel Management System. สงวนลิขสิทธิ์
            </p>
        </div>
    </div>
</body>
</html>
`;

export default passwordResetTemplate;
