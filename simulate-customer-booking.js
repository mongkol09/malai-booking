// 🏨 Hotel Booking System - Real Customer Booking Test
// จำลองลูกค้าจองห้องพักผ่าน API แบบจริง ๆ

const http = require('http');
const https = require('https');
const { URL } = require('url');

class RealBookingTester {
    constructor() {
        this.apiBase = 'http://localhost:3001/api/v1';
        this.adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZG1pbi0wMDEiLCJlbWFpbCI6ImFkbWluQGhvdGVsLWJvb2tpbmcuY29tIiwicm9sZSI6ImFkbWluIiwicGVybWlzc2lvbnMiOlsidmlld19ib29raW5ncyIsIm1hbmFnZV9yb29tcyIsIm1hbmFnZV91c2VycyJdLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE3NTUyODQ5MzQsIm5hbWUiOiJTeXN0ZW0gQWRtaW5pc3RyYXRvciIsImV4cCI6MTc1NTM3MTMzNCwiYXVkIjoiYWRtaW4tcGFuZWwiLCJpc3MiOiJob3RlbC1ib29raW5nLXN5c3RlbSJ9.WKpZrakfaERuZu5gaH-vLEILhGj07H7ZZjMJS3Uy_TY';
    }

    // ฟังก์ชันสำหรับทำ HTTP Request
    async makeRequest(url, method = 'GET', data = null, headers = {}) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const isHttps = urlObj.protocol === 'https:';
            const httpModule = isHttps ? https : http;
            
            const options = {
                hostname: urlObj.hostname,
                port: urlObj.port || (isHttps ? 443 : 80),
                path: urlObj.pathname + urlObj.search,
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                }
            };

            if (data && method !== 'GET') {
                const postData = JSON.stringify(data);
                options.headers['Content-Length'] = Buffer.byteLength(postData);
            }

            const req = httpModule.request(options, (res) => {
                let responseData = '';
                
                res.on('data', (chunk) => {
                    responseData += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const parsedData = responseData ? JSON.parse(responseData) : {};
                        resolve({
                            status: res.statusCode,
                            data: parsedData,
                            ok: res.statusCode >= 200 && res.statusCode < 300
                        });
                    } catch (error) {
                        resolve({
                            status: res.statusCode,
                            data: responseData,
                            ok: res.statusCode >= 200 && res.statusCode < 300
                        });
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            if (data && method !== 'GET') {
                req.write(JSON.stringify(data));
            }
            
            req.end();
        });
    }

    // ===================================
    // สร้างการจองที่ถูกต้องตาม Schema
    // ===================================
    async createRealBooking(customerData = {}) {
        const bookingId = Date.now().toString().slice(-6);
        
        const defaultBooking = {
            // ข้อมูลลูกค้า
            customerName: customerData.name || 'คุณ สมชาย ใจดี',
            customerEmail: customerData.email || 'mongkol09ms@gmail.com',
            customerPhone: customerData.phone || '0891234567',
            
            // ข้อมูลห้องพัก
            roomId: customerData.roomId || `R10${bookingId.slice(-1)}`,
            roomType: customerData.roomType || 'deluxe',
            
            // วันที่เข้าพัก
            checkInDate: customerData.checkInDate || '2025-08-20',
            checkOutDate: customerData.checkOutDate || '2025-08-22',
            nights: customerData.nights || 2,
            
            // จำนวนผู้เข้าพัก
            guests: customerData.guests || 2,
            adults: customerData.adults || 2,
            children: customerData.children || 0,
            
            // ราคา
            totalAmount: customerData.totalAmount || 5500,
            roomRate: customerData.roomRate || 2500,
            taxes: customerData.taxes || 250,
            serviceFees: customerData.serviceFees || 100,
            
            // ข้อมูลเพิ่มเติม
            specialRequests: customerData.specialRequests || 'ขอห้องวิวทะเล',
            paymentStatus: 'confirmed',
            paymentMethod: 'credit_card',
            source: 'website',
            currency: 'THB',
            
            // ข้อมูลผู้ติดต่อ
            emergencyContact: {
                name: 'สมหญิง ใจดี',
                phone: '0871234567',
                relationship: 'spouse'
            }
        };

        return defaultBooking;
    }

    // ===================================
    // STEP 1: ลูกค้าจองห้องพัก
    // ===================================
    async bookRoom(customerData) {
        console.log(`🛎️  STEP: การจองของ ${customerData.name || 'ลูกค้า'}`);
        console.log('='.repeat(50));
        
        try {
            const bookingData = await this.createRealBooking(customerData);

            console.log('📋 ข้อมูลการจอง:');
            console.log(`👤 ลูกค้า: ${bookingData.customerName}`);
            console.log(`📧 อีเมล: ${bookingData.customerEmail}`);
            console.log(`📱 โทรศัพท์: ${bookingData.customerPhone}`);
            console.log(`🏠 ห้อง: ${bookingData.roomId} (${bookingData.roomType})`);
            console.log(`📅 วันที่: ${bookingData.checkInDate} - ${bookingData.checkOutDate}`);
            console.log(`👥 ผู้เข้าพัก: ${bookingData.guests} คน`);
            console.log(`💰 ราคารวม: ฿${bookingData.totalAmount}`);
            console.log(`📝 คำขอพิเศษ: ${bookingData.specialRequests}`);

            const response = await this.makeRequest(`${this.apiBase}/bookings`, 'POST', bookingData);

            console.log(`📡 Response Status: ${response.status}`);
            
            if (response.ok) {
                console.log('✅ การจองสำเร็จ!');
                console.log(`📄 Booking ID: ${response.data.data?.id || 'Unknown'}`);
                console.log(`🎫 Reference: ${response.data.data?.bookingReferenceId || 'Unknown'}`);
                console.log(`📱 QR Code: ${response.data.data?.qrCode || 'Unknown'}`);
                return response.data;
            } else {
                console.log('❌ การจองล้มเหลว:', response.data);
                return null;
            }
            
        } catch (error) {
            console.log('💥 เกิดข้อผิดพลาด:', error.message);
            return null;
        }
    }

    // ===================================
    // STEP 2: Admin ตรวจสอบรายการจอง
    // ===================================
    async checkAdminBookings() {
        console.log('\n👨‍💼 Admin Panel - ตรวจสอบรายการจอง');
        console.log('='.repeat(50));
        
        try {
            const response = await this.makeRequest(`${this.apiBase}/bookings/admin/all`, 'GET', null, {
                'Authorization': `Bearer ${this.adminToken}`
            });

            console.log(`📡 Response Status: ${response.status}`);
            
            if (response.ok) {
                const bookings = response.data.data?.bookings || [];
                console.log(`📊 จำนวนการจองทั้งหมด: ${bookings.length}`);
                
                if (bookings.length > 0) {
                    console.log('\n📋 รายการจองล่าสุด:');
                    bookings.slice(0, 5).forEach((booking, index) => {
                        console.log(`${index + 1}. ${booking.customerName || booking.guestName || 'Unknown'}`);
                        console.log(`   📧 ${booking.customerEmail || booking.email || 'No email'}`);
                        console.log(`   🏠 Room: ${booking.roomId} | Status: ${booking.status}`);
                        console.log(`   📅 ${booking.checkInDate} - ${booking.checkOutDate}`);
                        console.log(`   💰 ฿${booking.totalAmount || booking.amount || 0}`);
                        console.log(`   🆔 ${booking.bookingReferenceId || booking.id}`);
                        console.log('');
                    });
                } else {
                    console.log('⚠️  ไม่มีรายการจองในระบบ');
                }
                
                return response.data;
            } else {
                console.log('❌ ไม่สามารถดึงรายการจองได้:', response.data);
                return null;
            }
            
        } catch (error) {
            console.log('💥 เกิดข้อผิดพลาด:', error.message);
            return null;
        }
    }

    // ===================================
    // รันการทดสอบแบบครบวงจร
    // ===================================
    async runCompleteBookingTest() {
        console.log('🏨 HOTEL BOOKING SYSTEM - COMPLETE CUSTOMER BOOKING TEST');
        console.log('='.repeat(80));
        console.log('🎯 จำลองลูกค้าจองห้องพักจริง ๆ + ตรวจสอบใน Admin Panel');
        console.log('='.repeat(80));

        // ตรวจสอบสถานะ API
        try {
            const healthCheck = await this.makeRequest(`${this.apiBase}/bookings/admin/all`, 'GET', null, {
                'Authorization': `Bearer ${this.adminToken}`
            });
            
            if (healthCheck.ok) {
                console.log('✅ API Server พร้อมแล้ว\n');
            } else {
                console.log('❌ API Server ไม่พร้อม');
                return;
            }
        } catch (error) {
            console.log('❌ ไม่สามารถเชื่อมต่อ API Server ได้');
            return;
        }

        try {
            // ลูกค้าคนที่ 1
            const customer1 = {
                name: 'คุณ สมชาย ใจดี',
                email: 'somchai@email.com',
                phone: '0891234567',
                roomId: 'R201',
                roomType: 'deluxe',
                checkInDate: '2025-08-20',
                checkOutDate: '2025-08-22',
                guests: 2,
                totalAmount: 5500,
                specialRequests: 'ขอห้องวิวทะเล + เตียงคิงไซส์'
            };

            // ลูกค้าคนที่ 2
            const customer2 = {
                name: 'คุณ มานี สวยงาม',
                email: 'manee@email.com',
                phone: '0823456789',
                roomId: 'R301',
                roomType: 'suite',
                checkInDate: '2025-08-25',
                checkOutDate: '2025-08-27',
                guests: 1,
                totalAmount: 7800,
                specialRequests: 'ขอผ้าปูที่นอนสีขาว + breakfast ในห้อง'
            };

            // ลูกค้าคนที่ 3
            const customer3 = {
                name: 'คุณ ธนา เที่ยวเก่ง',
                email: 'thana@email.com',
                phone: '0834567890',
                roomId: 'R401',
                roomType: 'standard',
                checkInDate: '2025-08-28',
                checkOutDate: '2025-08-30',
                guests: 3,
                totalAmount: 4200,
                specialRequests: 'ขอเตียงเสริม + แก้วน้ำเพิ่ม'
            };

            // จองห้องพักสำหรับลูกค้าแต่ละคน
            const booking1 = await this.bookRoom(customer1);
            console.log('\n' + '─'.repeat(60) + '\n');
            
            const booking2 = await this.bookRoom(customer2);
            console.log('\n' + '─'.repeat(60) + '\n');
            
            const booking3 = await this.bookRoom(customer3);
            console.log('\n' + '─'.repeat(60) + '\n');

            // ตรวจสอบรายการจองใน Admin Panel
            await this.checkAdminBookings();

            // สรุปผล
            console.log('\n📊 สรุปผลการทดสอบ');
            console.log('='.repeat(50));
            console.log(`🛎️  ลูกค้าคนที่ 1 (${customer1.name}): ${booking1 ? '✅ สำเร็จ' : '❌ ล้มเหลว'}`);
            console.log(`🛎️  ลูกค้าคนที่ 2 (${customer2.name}): ${booking2 ? '✅ สำเร็จ' : '❌ ล้มเหลว'}`);
            console.log(`🛎️  ลูกค้าคนที่ 3 (${customer3.name}): ${booking3 ? '✅ สำเร็จ' : '❌ ล้มเหลว'}`);
            
            console.log('\n🎯 การทดสอบเสร็จสิ้น!');
            console.log('💡 ตรวจสอบ Admin Panel ที่: http://localhost:3000/admin/room-booking-list');
            console.log('💡 กดปุ่ม Refresh ใน Admin Panel เพื่อดูข้อมูลล่าสุด');
            
        } catch (error) {
            console.log('💥 เกิดข้อผิดพลาดในการทดสอบ:', error.message);
        }
    }
}

// รันการทดสอบ
const tester = new RealBookingTester();
tester.runCompleteBookingTest();
