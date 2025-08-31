# 🔔 Updated Hotel Admin Notification System

## ⚠️ Important Update: LINE Notify Discontinued

LINE Notify service has been discontinued. We've updated the notification system to support multiple modern platforms:

## 🆕 New Supported Channels

### 1. **Telegram Bot** (Recommended - Primary Channel)
- ✅ Free and reliable
- ✅ Rich message formatting  
- ✅ Group notifications
- ✅ Bot API support

### 2. **Discord Webhook**
- ✅ Rich embeds with colors
- ✅ Perfect for tech teams
- ✅ Channel-based notifications

### 3. **Slack Webhook**
- ✅ Professional workspace integration
- ✅ Attachments and formatting
- ✅ Channel notifications

### 4. **Microsoft Teams Webhook**
- ✅ Enterprise integration
- ✅ Office 365 ecosystem
- ✅ Card-based messages

### 5. **WebSocket** (Real-time Dashboard)
- ✅ Real-time admin dashboard
- ✅ Instant notifications
- ✅ No external dependencies

## 🚀 Quick Setup

### Step 1: Choose Your Notification Channels

Edit your `.env` file:

```env
# Primary Channel (Recommended)
TELEGRAM_BOT_TOKEN="your_bot_token"
TELEGRAM_CHAT_ID="your_chat_id"

# Optional Additional Channels
DISCORD_WEBHOOK_URL="your_discord_webhook"
SLACK_WEBHOOK_URL="your_slack_webhook" 
TEAMS_WEBHOOK_URL="your_teams_webhook"

# WebSocket (Always enabled)
WEBSOCKET_CORS_ORIGINS="http://localhost:3000,https://yourdomain.com"
```

### Step 2: Set Up Telegram Bot (Primary)

1. **Create Bot:**
   ```
   - Chat with @BotFather on Telegram
   - Send: /newbot
   - Follow instructions
   - Copy your bot token
   ```

2. **Get Chat ID:**
   ```
   - Add your bot to admin group/channel
   - Send a message to the group
   - Visit: https://api.telegram.org/bot<TOKEN>/getUpdates
   - Find your chat_id in the response
   ```

### Step 3: Set Up Discord (Optional)

1. **Create Webhook:**
   ```
   - Go to your Discord server
   - Server Settings > Integrations > Webhooks
   - Create New Webhook
   - Copy webhook URL
   ```

### Step 4: Set Up Slack (Optional)

1. **Create Incoming Webhook:**
   ```
   - Go to https://api.slack.com/apps
   - Create New App > From scratch
   - Add Incoming Webhooks feature
   - Create webhook for your channel
   ```

### Step 5: Set Up Teams (Optional)

1. **Create Incoming Webhook:**
   ```
   - Go to your Teams channel
   - Click "..." > Connectors > Configure
   - Add "Incoming Webhook"
   - Create and copy URL
   ```

## 🧪 Testing

Test your setup:

```bash
# Test all channels
curl -X POST http://localhost:3001/api/v1/notifications/test

# Test specific event
curl -X POST http://localhost:3001/api/v1/notifications/simulate/PaymentSuccessful

# Check stats
curl -X GET http://localhost:3001/api/v1/notifications/stats
```

## 📊 Supported Events

- ✅ `PaymentSuccessful` - Payment completed
- ✅ `NewBookingCreated` - New reservation
- ✅ `GuestCheckIn` - Guest check-in
- ✅ `GuestCheckOut` - Guest check-out  
- ✅ `BookingCancelled` - Booking cancelled
- ✅ `RoomStatusChange` - Room status update
- ✅ `MaintenanceRequired` - Maintenance needed
- ✅ `SystemAlert` - System notifications
- ✅ `DailyReport` - Daily statistics

## 🔄 Migration from LINE Notify

**Old Code:**
```typescript
// ❌ This no longer works
await lineNotify.send(message);
```

**New Code:**
```typescript
// ✅ Updated approach
await notificationService.notifyAll('EventType', data);
```

## 🛠️ Integration Examples

### In Booking Controller:
```typescript
import { getUpdatedNotificationService } from '../services/updatedNotificationService';

const notificationService = getUpdatedNotificationService();

// When new booking is created
await notificationService.notifyAll('NewBookingCreated', {
  bookingId: booking.id,
  guestName: `${guest.firstName} ${guest.lastName}`,
  roomNumber: room.roomNumber,
  totalPrice: booking.totalPrice
});
```

### In Payment Controller:
```typescript
// When payment is successful
await notificationService.notifyAll('PaymentSuccessful', {
  paymentId: payment.id,
  bookingId: booking.id,
  amount: payment.amount,
  paymentMethod: payment.method
});
```

## 🔧 Troubleshooting

### Common Issues:

1. **No Notifications Received:**
   - Check environment variables
   - Verify webhook URLs
   - Test individual channels

2. **Telegram Bot Not Working:**
   - Ensure bot is added to group
   - Check chat_id format (-100xxx for groups)
   - Verify bot token

3. **Discord/Slack Webhooks Failing:**
   - Check webhook URL validity
   - Verify channel permissions
   - Test with curl directly

### Debug Mode:

```typescript
// Check service status
const stats = notificationService.getNotificationStats();
console.log(stats);

// Test all channels
const results = await notificationService.testNotificationSystem();
console.log(results);
```

## 📈 Advantages of New System

- ✅ **Multi-platform** - Not dependent on single service
- ✅ **Redundancy** - If one fails, others continue
- ✅ **Rich formatting** - Better message presentation
- ✅ **Scalable** - Easy to add more channels
- ✅ **Future-proof** - No dependency on discontinued services

## 🔒 Security Notes

- 🔐 Keep webhook URLs secret
- 🔐 Use environment variables only
- 🔐 Don't commit tokens to git
- 🔐 Rotate tokens periodically
- 🔐 Monitor for unauthorized access

---

**The new system is more robust and future-proof! 🚀**
