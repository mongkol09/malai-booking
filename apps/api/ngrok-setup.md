# 🔗 ngrok Setup Commands for Omise Webhook

## 📋 Step-by-step Instructions

### 1. Install ngrok (if not installed)
```bash
# Download from https://ngrok.com/download
# Or install via npm
npm install -g ngrok

# Or via chocolatey (Windows)
choco install ngrok
```

### 2. Start ngrok tunnel
```bash
# Your API is running on localhost:3001
ngrok http 3001

# Or with custom subdomain (if you have ngrok account)
ngrok http 3001 --subdomain=hotel-booking-api
```

### 3. Copy the HTTPS URL
```
Example output:
Session Status    online
Account           mongkol09ms@gmail.com (Plan: Free)
Version           3.x.x
Region            Asia Pacific (ap)
Latency           -
Web Interface     http://127.0.0.1:4040
Forwarding        https://abc123.ngrok.io -> http://localhost:3001
```

### 4. Use this URL in Omise Dashboard:
```
https://abc123.ngrok.io/api/v1/payments/webhooks/omise
```

### 5. Test the webhook endpoint
```bash
# Test if ngrok tunnel works
curl https://your-ngrok-url.ngrok.io/api/v1/payments/health

# Expected response:
{
  "service": "payment-verification",
  "status": "healthy",
  "timestamp": "2025-08-11T18:42:23.909Z",
  "version": "1.0.0"
}
```

## 🔍 Monitor Webhook Traffic

### ngrok Web Interface:
- Open: http://127.0.0.1:4040
- See all incoming requests in real-time
- Perfect for debugging webhooks

### API Logs:
- Watch your terminal for incoming webhook events
- Check database for webhook event records

## ⚠️ Important Notes

1. **Free ngrok URLs change every restart** - update Omise dashboard if needed
2. **Keep ngrok terminal open** - closing stops the tunnel
3. **Use Web Interface** http://127.0.0.1:4040 to monitor traffic
4. **Copy exact HTTPS URL** to Omise dashboard

## 🎯 Ready for Omise Configuration

Your webhook endpoint will be:
```
https://YOUR_NGROK_URL.ngrok.io/api/v1/payments/webhooks/omise
```

Replace YOUR_NGROK_URL with the actual URL from ngrok output.
