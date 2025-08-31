# 🔗 Webhook Setup Guide for Omise

## 🌐 Production Setup

### 1. Domain & SSL
- ✅ ต้องมี HTTPS (SSL certificate)
- ✅ Public domain ที่ Omise เข้าถึงได้

### 2. Omise Dashboard Configuration
1. Login to Omise Dashboard
2. Go to: **Account Settings** → **Webhooks**
3. Click **"Add Webhook Endpoint"**
4. Enter URL: `https://your-domain.com/api/v1/payments/webhooks/omise`
5. Select Events:
   - ✅ charge.complete
   - ✅ charge.failed  
   - ✅ refund.create
6. **Save and copy the Webhook Secret**

### 3. Update Environment Variables
```env
OMISE_WEBHOOK_SECRET="wbhook_secret_from_omise_dashboard"
```

---

## 🧪 Development Setup (localhost)

### Option 1: ngrok (Recommended)
```bash
# Install ngrok
npm install -g ngrok

# Start your API server
npm run dev

# In another terminal, expose localhost:3001
ngrok http 3001

# Use the HTTPS URL from ngrok in Omise dashboard
# Example: https://abc123.ngrok.io/api/v1/payments/webhooks/omise
```

### Option 2: LocalTunnel
```bash
# Install localtunnel
npm install -g localtunnel

# Start your API server
npm run dev

# In another terminal
lt --port 3001 --subdomain your-hotel-booking

# Use: https://your-hotel-booking.loca.lt/api/v1/payments/webhooks/omise
```

---

## ✅ Verification Steps

### 1. Test Webhook Endpoint
```bash
curl -X GET https://your-domain.com/api/v1/payments/health
```

### 2. Check Webhook Delivery in Omise Dashboard
- Go to **Webhooks** → **Recent Deliveries**
- Look for successful deliveries (200 status)

### 3. Monitor Webhook Events
```bash
# Check our API logs
tail -f logs/app.log

# Or check database
node check-current-data.js
```

---

## 🔒 Security Checklist

- ✅ HTTPS required (not HTTP)
- ✅ Webhook secret configured
- ✅ Signature verification enabled
- ✅ Rate limiting active
- ✅ IP whitelist (optional)
- ✅ Audit logging enabled

---

## 🚨 Important Notes

1. **Production URL must be HTTPS**
2. **Webhook secret must match exactly**
3. **Test webhook delivery in Omise dashboard**
4. **Monitor webhook events in our audit system**

---

## 📞 Support

If webhook delivery fails:
1. Check Omise dashboard for delivery errors
2. Verify URL is accessible publicly
3. Check webhook secret matches
4. Review API logs for errors

**Endpoint ready:** `/api/v1/payments/webhooks/omise` ✅
