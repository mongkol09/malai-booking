# Railway Deployment Guide for Malai Booking System

## 🚀 Quick Fix for Auto-Deploy

### 1. Check Railway Dashboard Settings
Go to your Railway project dashboard and verify:

- **Repository**: `https://github.com/mongkol09/malai-booking.git`
- **Branch**: `main` 
- **Root Directory**: Leave empty (uses repository root)
- **Build Command**: Uses Dockerfile (automatic)
- **Start Command**: `node dist/app.js` (defined in Dockerfile)

### 2. Environment Variables Setup
In Railway dashboard, go to **Variables** tab and add:

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secure-jwt-secret
SESSION_SECRET=your-super-secure-session-secret
API_VERSION=v1
CORS_ORIGIN=https://your-frontend-domain.com
```

### 3. Force Manual Deploy
If auto-deploy isn't working:

1. Go to **Deployments** tab
2. Click **Deploy** button manually
3. Select **Deploy main branch**

### 4. Check Build Logs
Monitor the **Build Logs** for any errors:
- Dockerfile build process
- NPM dependencies installation
- TypeScript compilation
- Prisma client generation

### 5. Verify Health Check
Once deployed, test: `https://your-railway-domain.railway.app/health`

## 🔧 Troubleshooting Common Issues

### Issue 1: Branch Not Deploying
**Solution**: Ensure Railway is watching the correct branch:
- Settings → GitHub → Branch: `main`

### Issue 2: Build Failures
**Solution**: Check environment variables are set correctly

### Issue 3: Health Check Fails
**Solution**: Database connection issues - verify DATABASE_URL

## 📋 Required Railway Configuration

### Build Settings
- **Framework**: Node.js
- **Build Command**: Uses Dockerfile
- **Start Command**: `node dist/app.js`
- **Health Check Path**: `/health`

### Domain & Networking
- **Port**: 3001 (configured automatically)
- **Public Networking**: Enabled

## 🔄 Manual Deploy Steps

If automatic deployment isn't working, try these steps:

1. **Trigger Build Manually**:
   ```bash
   # In Railway dashboard
   Deployments → Deploy → main branch
   ```

2. **Check Repository Connection**:
   - Settings → GitHub
   - Ensure repository is connected
   - Check branch configuration

3. **Verify Webhook**:
   - GitHub repository → Settings → Webhooks
   - Should see Railway webhook

## ✅ Success Indicators

Your deployment is successful when:
- ✅ Build completes without errors
- ✅ Health check returns 200 OK
- ✅ API endpoints respond correctly
- ✅ Database connections work

## 🆘 Need Help?

If you're still having issues:
1. Check Railway build logs
2. Verify all environment variables
3. Test health endpoint manually
4. Contact Railway support if needed