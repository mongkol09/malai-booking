/**
 * Payment Receipt Email Template
 * พร้อมข้อมูลหัวบิลที่ถูกต้อง
 */

import { getLogoUrl } from './logoAssets';

export const paymentReceiptTemplate = `
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ใบเสร็จรับเงิน - มาลัย เวลเนส</title>
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
            max-width: 650px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #1a5490 0%, #2d7dd2 100%);
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
        
        .receipt-title {
            font-size: 32px;
            font-weight: 600;
            margin: 10px 0;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }
        
        .receipt-subtitle {
            font-size: 18px;
            opacity: 0.9;
            margin: 0;
        }
        
        /* Company Information Section */
        .company-info {
            background-color: #f8f9fa;
            padding: 25px;
            border-bottom: 3px solid #1a5490;
        }
        
        .company-header {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .company-name {
            font-size: 24px;
            font-weight: 600;
            color: #1a5490;
            margin: 0 0 8px 0;
        }
        
        .company-name-en {
            font-size: 16px;
            color: #666;
            margin: 0 0 15px 0;
            font-style: italic;
        }
        
        .company-details {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #1a5490;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        .detail-label {
            font-weight: 500;
            color: #333;
            width: 40%;
        }
        
        .detail-value {
            color: #666;
            width: 58%;
            text-align: right;
        }
        
        /* Receipt Information */
        .receipt-info {
            padding: 25px;
            background-color: #ffffff;
        }
        
        .receipt-meta {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 25px;
        }
        
        .meta-box {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #28a745;
        }
        
        .meta-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        
        .meta-value {
            font-size: 16px;
            font-weight: 600;
            color: #333;
        }
        
        /* Customer Information */
        .customer-section {
            margin-bottom: 25px;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #1a5490;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e9ecef;
        }
        
        .customer-details {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
        }
        
        /* Payment Details Table */
        .payment-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
            background-color: white;
        }
        
        .payment-table th,
        .payment-table td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #e9ecef;
        }
        
        .payment-table th {
            background-color: #1a5490;
            color: white;
            font-weight: 600;
            font-size: 14px;
        }
        
        .payment-table tr:hover {
            background-color: #f8f9fa;
        }
        
        .amount-cell {
            text-align: right;
            font-weight: 600;
        }
        
        /* Total Summary */
        .total-summary {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border: 2px solid #1a5490;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 16px;
        }
        
        .total-row.final {
            font-size: 20px;
            font-weight: 600;
            color: #1a5490;
            border-top: 2px solid #1a5490;
            padding-top: 12px;
            margin-top: 12px;
        }
        
        /* Footer */
        .footer {
            background-color: #1a5490;
            color: white;
            text-align: center;
            padding: 25px 20px;
        }
        
        .footer p {
            margin: 5px 0;
            font-size: 14px;
        }
        
        .download-link {
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
        
        .download-link:hover {
            background-color: #218838;
        }
        
        /* Mobile Responsive */
        @media (max-width: 600px) {
            .container {
                margin: 10px;
            }
            
            .receipt-meta {
                grid-template-columns: 1fr;
            }
            
            .payment-table th,
            .payment-table td {
                padding: 8px 10px;
                font-size: 14px;
            }
            
            .company-details {
                padding: 15px;
            }
            
            .detail-row {
                flex-direction: column;
                margin-bottom: 12px;
            }
            
            .detail-label,
            .detail-value {
                width: 100%;
                text-align: left;
            }
            
            .detail-value {
                font-weight: 600;
                margin-top: 2px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <img src="{{logo_url}}" alt="Malai Wellness Logo" class="logo">
            <h1 class="receipt-title">ใบเสร็จรับเงิน</h1>
            <p class="receipt-subtitle">PAYMENT RECEIPT</p>
        </div>

        <!-- Company Information -->
        <div class="company-info">
            <div class="company-header">
                <h2 class="company-name">บริษัท มาลัย เวลเนส จำกัด</h2>
                <p class="company-name-en">Malai Wellness Co., Ltd.</p>
            </div>
            
            <div class="company-details">
                <div class="detail-row">
                    <span class="detail-label">ที่อยู่:</span>
                    <span class="detail-value">17/88 หมู่ที่ 1 ต.บางรักน้อย</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label"></span>
                    <span class="detail-value">อ.เมืองนนทบุรี จ.นนทบุรี 11000</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">เลขประจำตัวผู้เสียภาษี:</span>
                    <span class="detail-value">0125566017508 (สำนักงานใหญ่)</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">โทรศัพท์:</span>
                    <span class="detail-value">-</span>
                </div>
            </div>
        </div>

        <!-- Receipt Information -->
        <div class="receipt-info">
            <!-- Receipt Meta Data -->
            <div class="receipt-meta">
                <div class="meta-box">
                    <div class="meta-label">เลขที่ใบเสร็จ</div>
                    <div class="meta-value">{{receipt_number}}</div>
                </div>
                <div class="meta-box">
                    <div class="meta-label">วันที่ออกใบเสร็จ</div>
                    <div class="meta-value">{{payment_date}}</div>
                </div>
            </div>

            <!-- Customer Information -->
            <div class="customer-section">
                <h3 class="section-title">ข้อมูลลูกค้า</h3>
                <div class="customer-details">
                    <div class="detail-row">
                        <span class="detail-label">ชื่อ-นามสกุล:</span>
                        <span class="detail-value">{{guest_name}}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">อีเมล:</span>
                        <span class="detail-value">{{guest_email}}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">เบอร์โทรศัพท์:</span>
                        <span class="detail-value">{{guest_phone}}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">หมายเลขการจอง:</span>
                        <span class="detail-value">{{booking_reference}}</span>
                    </div>
                </div>
            </div>

            <!-- Payment Details -->
            <h3 class="section-title">รายละเอียดการชำระเงิน</h3>
            <table class="payment-table">
                <thead>
                    <tr>
                        <th>รายการ</th>
                        <th>ระยะเวลา</th>
                        <th>จำนวนเงิน</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <strong>{{room_type}}</strong><br>
                            <small>{{checkin_date}} - {{checkout_date}}</small><br>
                            <small>จำนวน {{nights}} คืน</small>
                        </td>
                        <td>{{checkin_date}} ถึง {{checkout_date}}</td>
                        <td class="amount-cell">{{payment_amount}} บาท</td>
                    </tr>
                </tbody>
            </table>

            <!-- Total Summary -->
            <div class="total-summary">
                <div class="total-row">
                    <span>ยอดเงินก่อนภาษี:</span>
                    <span>{{payment_amount}} บาท</span>
                </div>
                <div class="total-row">
                    <span>ภาษีมูลค่าเพิ่ม (0%):</span>
                    <span>{{tax_amount}} บาท</span>
                </div>
                <div class="total-row">
                    <span>ค่าบริการ:</span>
                    <span>{{service_charge}} บาท</span>
                </div>
                <div class="total-row final">
                    <span>ยอดเงินสุทธิ:</span>
                    <span>{{payment_amount}} บาท</span>
                </div>
            </div>

            <!-- Payment Method Info -->
            <div class="customer-section">
                <h3 class="section-title">วิธีการชำระเงิน</h3>
                <div class="customer-details">
                    <div class="detail-row">
                        <span class="detail-label">ประเภทการชำระ:</span>
                        <span class="detail-value">{{payment_method}}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">รหัสอ้างอิง:</span>
                        <span class="detail-value">{{payment_reference}}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">สถานะ:</span>
                        <span class="detail-value">{{payment_status}}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <a href="{{receipt_download_url}}" class="download-link">ดาวน์โหลดใบเสร็จ PDF</a>
            <p><strong>ขอบคุณที่ใช้บริการ มาลัย เวลเนส</strong></p>
            <p>หากมีข้อสงสัยเกี่ยวกับใบเสร็จนี้ กรุณาติดต่อเราที่ {{hotel_email}}</p>
            <p><small>ใบเสร็จนี้ออกโดยระบบอัตโนมัติ ไม่จำเป็นต้องมีลายเซ็น</small></p>
        </div>
    </div>
</body>
</html>
`;

export default paymentReceiptTemplate;
