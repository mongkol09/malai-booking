# 🚀 Webhook Setup - Alternative Solutions

## ❌ ngrok Version Issues
- Current ngrok v2.3.41 is too old
- Account requires v3.7.0+
- Need paid plan or newer version

## ✅ **SOLUTION 1: Use Cloudflare Tunnel (Recommended)**

### Install cloudflared
```bash
winget install Cloudflare.cloudflared
```

### Start tunnel (no signup needed)
```bash
cloudflared tunnel --url http://localhost:3001
```

### You'll get a URL like:
```
https://abc-def-123.trycloudflare.com
```

---

## ✅ **SOLUTION 2: Use serveo.net (Simple)**

### SSH tunnel (no install needed)
```bash
ssh -R 80:localhost:3001 serveo.net
```

### You'll get:
```
https://your-subdomain.serveo.net
```

---

## ✅ **SOLUTION 3: localtunnel (Already installed)**

### Simple command
```bash
npx localtunnel --port 3001
```

### Custom subdomain
```bash
npx localtunnel --port 3001 --subdomain hotel-booking-webhook
```

---

## 🎯 **For Omise Webhook Setup**

### Your webhook URL will be:
```
https://your-tunnel-url.com/api/v1/payments/webhooks/omise
```

### Test endpoint:
```bash
curl https://your-tunnel-url.com/api/v1/payments/health
```

### Expected response:
```json
{
  "service": "payment-verification",
  "status": "healthy",
  "timestamp": "2025-08-11T...",
  "version": "1.0.0"
}
```

---

## 🔧 **Which one to try first?**

1. **Cloudflare Tunnel** (most reliable)
2. **localtunnel** (simplest, already installed)
3. **serveo.net** (if others fail)

### Let's try cloudflared first!
