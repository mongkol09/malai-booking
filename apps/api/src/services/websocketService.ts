import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

// 🔌 WebSocket Server สำหรับ Real-time Admin Notifications
export class WebSocketService {
  private io: SocketIOServer;
  private connectedAdmins: Map<string, string> = new Map(); // userId -> socketId

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true
      },
      path: '/socket.io/'
    });

    this.setupAuthentication();
    this.setupEventHandlers();
  }

  // 🔐 Authentication middleware สำหรับ WebSocket
  private setupAuthentication() {
    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
        // เฉพาะ ADMIN และ STAFF เท่านั้นที่เชื่อมต่อได้
        if (!['ADMIN', 'STAFF'].includes(decoded.role)) {
          return next(new Error('Authentication error: Insufficient permissions'));
        }

        socket.data.userId = decoded.userId;
        socket.data.role = decoded.role;
        socket.data.email = decoded.email;
        
        next();
      } catch (error) {
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  // 📡 Setup Event Handlers
  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const userId = socket.data.userId;
      const role = socket.data.role;
      
      console.log(`🔌 Admin connected: ${socket.data.email} (${role}) - Socket ID: ${socket.id}`);
      
      // เก็บ mapping ของ userId กับ socketId
      this.connectedAdmins.set(userId, socket.id);

      // เข้า room ตาม role
      socket.join(`admin_${role.toLowerCase()}`);
      socket.join('admin_all');

      // ส่งข้อความต้อนรับ
      socket.emit('admin_connected', {
        message: 'Connected to admin notifications',
        timestamp: new Date().toISOString(),
        connectedAdmins: this.connectedAdmins.size
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`❌ Admin disconnected: ${socket.data.email}`);
        this.connectedAdmins.delete(userId);
      });

      // Handle ping-pong for connection health
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: new Date().toISOString() });
      });
    });
  }

  // 🔔 ส่งการแจ้งเตือนไปยัง Admin Dashboard
  public notifyAdmins(eventType: string, data: any, targetRoles: string[] = ['ADMIN', 'STAFF']) {
    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: eventType,
      title: this.getNotificationTitle(eventType),
      message: this.getNotificationMessage(eventType, data),
      data: data,
      timestamp: new Date().toISOString(),
      read: false
    };

    // ส่งไปยัง role ที่กำหนด
    targetRoles.forEach(role => {
      this.io.to(`admin_${role.toLowerCase()}`).emit('admin_notification', notification);
    });

    console.log(`📢 Notification sent to ${targetRoles.join(', ')}: ${eventType}`);
    return notification;
  }

  // 💳 ส่งการแจ้งเตือนเมื่อมีการชำระเงินสำเร็จ
  public notifyPaymentSuccessful(paymentData: any) {
    return this.notifyAdmins('PaymentSuccessful', paymentData);
  }

  // 🏨 ส่งการแจ้งเตือนเมื่อมีการจองใหม่
  public notifyNewBookingCreated(bookingData: any) {
    return this.notifyAdmins('NewBookingCreated', bookingData);
  }

  // 🚪 ส่งการแจ้งเตือนเมื่อมี Check-in
  public notifyCheckIn(checkInData: any) {
    return this.notifyAdmins('GuestCheckIn', checkInData);
  }

  // 🛎️ ส่งการแจ้งเตือนเมื่อมี Check-out
  public notifyCheckOut(checkOutData: any) {
    return this.notifyAdmins('GuestCheckOut', checkOutData);
  }

  // 🏠 ส่งการแจ้งเตือนเมื่อสถานะห้องเปลี่ยน
  public notifyRoomStatusChange(roomData: any) {
    return this.notifyAdmins('RoomStatusChange', roomData);
  }

  // 📊 Get real-time stats
  public getConnectedAdminsCount(): number {
    return this.connectedAdmins.size;
  }

  public getConnectedAdmins(): Array<{userId: string, socketId: string}> {
    return Array.from(this.connectedAdmins.entries()).map(([userId, socketId]) => ({
      userId, socketId
    }));
  }

  // 🏷️ Helper methods สำหรับสร้าง notification content
  private getNotificationTitle(eventType: string): string {
    const titles: Record<string, string> = {
      'PaymentSuccessful': '💳 การชำระเงินสำเร็จ',
      'NewBookingCreated': '🏨 การจองใหม่',
      'GuestCheckIn': '🚪 ผู้เข้าพักเช็คอิน',
      'GuestCheckOut': '🛎️ ผู้เข้าพักเช็คเอาท์',
      'RoomStatusChange': '🏠 สถานะห้องเปลี่ยนแปลง'
    };
    return titles[eventType] || '🔔 การแจ้งเตือนใหม่';
  }

  private getNotificationMessage(eventType: string, data: any): string {
    switch (eventType) {
      case 'PaymentSuccessful':
        return `ได้รับการชำระเงิน ${data.amount?.toLocaleString()} บาท สำหรับการจอง ${data.bookingId}`;
      
      case 'NewBookingCreated':
        return `${data.guestName} ได้จองห้อง ${data.roomNumber} (${data.roomTypeName}) เช็คอิน: ${data.checkinDate}`;
      
      case 'GuestCheckIn':
        return `${data.guestName} เช็คอินห้อง ${data.roomNumber} สำเร็จ`;
      
      case 'GuestCheckOut':
        return `${data.guestName} เช็คเอาท์จากห้อง ${data.roomNumber} สำเร็จ`;
      
      case 'RoomStatusChange':
        return `ห้อง ${data.roomNumber} เปลี่ยนสถานะเป็น ${data.newStatus}`;
      
      default:
        return 'มีเหตุการณ์ใหม่เกิดขึ้น';
    }
  }
}

// Export singleton instance
let webSocketService: WebSocketService | null = null;

export const initializeWebSocket = (httpServer: HTTPServer): WebSocketService => {
  if (!webSocketService) {
    webSocketService = new WebSocketService(httpServer);
  }
  return webSocketService;
};

export const getWebSocketService = (): WebSocketService | null => {
  return webSocketService;
};
