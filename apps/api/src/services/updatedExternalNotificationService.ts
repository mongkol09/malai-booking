// ============================================
// UPDATED EXTERNAL NOTIFICATION SERVICE 
// ============================================
// Removed: LINE Notify (discontinued service)
// Added: Discord, Slack, Email notifications
// Kept: Telegram Bot

import axios from 'axios';
import TelegramBot from 'node-telegram-bot-api';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// TELEGRAM BOT SERVICE
// ============================================

class TelegramNotificationService {
  private bot: TelegramBot | null = null;
  private chatId: string | null = null;

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    this.chatId = process.env.TELEGRAM_CHAT_ID || null;

    if (token) {
      this.bot = new TelegramBot(token, { polling: false });
    }
  }

  async sendNotification(message: string, eventType: string): Promise<boolean> {
    if (!this.bot || !this.chatId) {
      console.log('⚠️ Telegram not configured, skipping...');
      return false;
    }

    try {
      const emoji = this.getEventEmoji(eventType);
      const formattedMessage = `${emoji} *Hotel Admin Alert*\n\n${message}\n\n_${new Date().toLocaleString('th-TH')}_`;
      
      await this.bot.sendMessage(this.chatId, formattedMessage, { 
        parse_mode: 'Markdown',
        disable_web_page_preview: true 
      });
      
      console.log('✅ Telegram notification sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Telegram notification failed:', error);
      return false;
    }
  }

  private getEventEmoji(eventType: string): string {
    const emojiMap: { [key: string]: string } = {
      'PaymentSuccessful': '💰',
      'NewBookingCreated': '🏨',
      'GuestCheckIn': '🚪',
      'GuestCheckOut': '👋',
      'BookingCancelled': '❌',
      'RoomStatusChange': '🛏️',
      'MaintenanceRequired': '🔧',
      'SystemAlert': '🚨',
      'DailyReport': '📊'
    };
    return emojiMap[eventType] || '🔔';
  }
}

// ============================================
// DISCORD WEBHOOK SERVICE
// ============================================

class DiscordNotificationService {
  private webhookUrl: string | null = null;

  constructor() {
    this.webhookUrl = process.env.DISCORD_WEBHOOK_URL || null;
  }

  async sendNotification(message: string, eventType: string): Promise<boolean> {
    if (!this.webhookUrl) {
      console.log('⚠️ Discord webhook not configured, skipping...');
      return false;
    }

    try {
      const embed = {
        title: `🏨 Hotel Admin Alert - ${eventType}`,
        description: message,
        color: this.getEventColor(eventType),
        timestamp: new Date().toISOString(),
        footer: {
          text: 'Hotel Booking System'
        }
      };

      await axios.post(this.webhookUrl, {
        embeds: [embed]
      });

      console.log('✅ Discord notification sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Discord notification failed:', error);
      return false;
    }
  }

  private getEventColor(eventType: string): number {
    const colorMap: { [key: string]: number } = {
      'PaymentSuccessful': 0x00ff00,    // Green
      'NewBookingCreated': 0x0099ff,    // Blue
      'GuestCheckIn': 0x9966ff,         // Purple
      'GuestCheckOut': 0xff9900,        // Orange
      'BookingCancelled': 0xff0000,     // Red
      'RoomStatusChange': 0xffff00,     // Yellow
      'MaintenanceRequired': 0xff6600,  // Dark Orange
      'SystemAlert': 0xff0000,          // Red
      'DailyReport': 0x00ffff           // Cyan
    };
    return colorMap[eventType] || 0x808080; // Default gray
  }
}

// ============================================
// SLACK WEBHOOK SERVICE
// ============================================

class SlackNotificationService {
  private webhookUrl: string | null = null;

  constructor() {
    this.webhookUrl = process.env.SLACK_WEBHOOK_URL || null;
  }

  async sendNotification(message: string, eventType: string): Promise<boolean> {
    if (!this.webhookUrl) {
      console.log('⚠️ Slack webhook not configured, skipping...');
      return false;
    }

    try {
      const emoji = this.getEventEmoji(eventType);
      const payload = {
        text: `${emoji} *Hotel Admin Alert*`,
        attachments: [{
          color: this.getEventColor(eventType),
          fields: [{
            title: eventType,
            value: message,
            short: false
          }],
          footer: 'Hotel Booking System',
          ts: Math.floor(Date.now() / 1000)
        }]
      };

      await axios.post(this.webhookUrl, payload);

      console.log('✅ Slack notification sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Slack notification failed:', error);
      return false;
    }
  }

  private getEventEmoji(eventType: string): string {
    const emojiMap: { [key: string]: string } = {
      'PaymentSuccessful': ':money_with_wings:',
      'NewBookingCreated': ':hotel:',
      'GuestCheckIn': ':door:',
      'GuestCheckOut': ':wave:',
      'BookingCancelled': ':x:',
      'RoomStatusChange': ':bed:',
      'MaintenanceRequired': ':wrench:',
      'SystemAlert': ':rotating_light:',
      'DailyReport': ':bar_chart:'
    };
    return emojiMap[eventType] || ':bell:';
  }

  private getEventColor(eventType: string): string {
    const colorMap: { [key: string]: string } = {
      'PaymentSuccessful': 'good',
      'NewBookingCreated': '#0099ff',
      'GuestCheckIn': '#9966ff',
      'GuestCheckOut': '#ff9900',
      'BookingCancelled': 'danger',
      'RoomStatusChange': 'warning',
      'MaintenanceRequired': '#ff6600',
      'SystemAlert': 'danger',
      'DailyReport': '#00ffff'
    };
    return colorMap[eventType] || '#808080';
  }
}

// ============================================
// MICROSOFT TEAMS WEBHOOK SERVICE
// ============================================

class TeamsNotificationService {
  private webhookUrl: string | null = null;

  constructor() {
    this.webhookUrl = process.env.TEAMS_WEBHOOK_URL || null;
  }

  async sendNotification(message: string, eventType: string): Promise<boolean> {
    if (!this.webhookUrl) {
      console.log('⚠️ Microsoft Teams webhook not configured, skipping...');
      return false;
    }

    try {
      const payload = {
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "themeColor": this.getEventColor(eventType),
        "summary": `Hotel Alert - ${eventType}`,
        "sections": [{
          "activityTitle": `🏨 Hotel Admin Alert - ${eventType}`,
          "activitySubtitle": new Date().toLocaleString('th-TH'),
          "text": message,
          "markdown": true
        }]
      };

      await axios.post(this.webhookUrl, payload);

      console.log('✅ Teams notification sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Teams notification failed:', error);
      return false;
    }
  }

  private getEventColor(eventType: string): string {
    const colorMap: { [key: string]: string } = {
      'PaymentSuccessful': '00ff00',
      'NewBookingCreated': '0099ff',
      'GuestCheckIn': '9966ff',
      'GuestCheckOut': 'ff9900',
      'BookingCancelled': 'ff0000',
      'RoomStatusChange': 'ffff00',
      'MaintenanceRequired': 'ff6600',
      'SystemAlert': 'ff0000',
      'DailyReport': '00ffff'
    };
    return colorMap[eventType] || '808080';
  }
}

// ============================================
// MAIN EXTERNAL NOTIFICATION SERVICE
// ============================================

export class UpdatedExternalNotificationService {
  private telegram: TelegramNotificationService;
  private discord: DiscordNotificationService;
  private slack: SlackNotificationService;
  private teams: TeamsNotificationService;

  constructor() {
    this.telegram = new TelegramNotificationService();
    this.discord = new DiscordNotificationService();
    this.slack = new SlackNotificationService();
    this.teams = new TeamsNotificationService();
  }

  async sendToAllChannels(message: string, eventType: string): Promise<{
    telegram: boolean;
    discord: boolean;
    slack: boolean;
    teams: boolean;
  }> {
    const results = {
      telegram: false,
      discord: false,
      slack: false,
      teams: false
    };

    // Send in parallel for better performance
    const [telegramResult, discordResult, slackResult, teamsResult] = await Promise.allSettled([
      this.telegram.sendNotification(message, eventType),
      this.discord.sendNotification(message, eventType),
      this.slack.sendNotification(message, eventType),
      this.teams.sendNotification(message, eventType)
    ]);

    results.telegram = telegramResult.status === 'fulfilled' ? telegramResult.value : false;
    results.discord = discordResult.status === 'fulfilled' ? discordResult.value : false;
    results.slack = slackResult.status === 'fulfilled' ? slackResult.value : false;
    results.teams = teamsResult.status === 'fulfilled' ? teamsResult.value : false;

    // Log the notification to database
    await this.logNotification(message, eventType, results);

    return results;
  }

  private async logNotification(message: string, eventType: string, results: any): Promise<void> {
    try {
      await prisma.notificationLog.create({
        data: {
          eventType,
          message,
          channels: results,
          success: Object.values(results).some(result => result === true),
          error: Object.values(results).every(result => result === false) ? 'All channels failed' : null,
          metadata: {
            timestamp: new Date().toISOString(),
            channels_attempted: Object.keys(results).length,
            line_notify_status: 'discontinued'
          }
        }
      });
    } catch (error) {
      console.error('❌ Failed to log notification:', error);
    }
  }

  // Test all notification channels
  async testAllChannels(): Promise<any> {
    const testMessage = `🧪 Test notification from Hotel Booking System\n\n✅ All systems operational!\n🔄 LINE Notify replaced with multi-platform support\n⏰ Time: ${new Date().toLocaleString('th-TH')}`;
    
    return await this.sendToAllChannels(testMessage, 'SystemTest');
  }

  // Get status of all configured channels
  getChannelStatus(): { [key: string]: boolean } {
    return {
      telegram: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
      discord: !!process.env.DISCORD_WEBHOOK_URL,
      slack: !!process.env.SLACK_WEBHOOK_URL,
      teams: !!process.env.TEAMS_WEBHOOK_URL,
      line_notify: false // Discontinued
    };
  }
}

export default UpdatedExternalNotificationService;
