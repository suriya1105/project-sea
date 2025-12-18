# Render Deployment - Step by Step

## Quick Start Guide for Backend Deployment

### 1. Create Render Account
- Go to https://render.com
- Sign up with GitHub (recommended)

### 2. Create New Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select your repository

### 3. Configure Service

**Basic Settings**:
- **Name**: `seatrace-backend`
- **Region**: Choose closest to users (e.g., `Oregon (US West)`)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python start.py`

**Plan**: 
- Start with **Free** (750 hours/month)
- Upgrade to **Starter** ($7/month) for always-on service

### 4. Set Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**:

| Key | Value | Notes |
|-----|-------|-------|
| `FLASK_ENV` | `production` | Production mode |
| `SECRET_KEY` | `<generate>` | See below |
| `PORT` | `10000` | Render sets this automatically |
| `CORS_ORIGINS` | `https://your-frontend.vercel.app` | Your Vercel URL |

**Generate SECRET_KEY**:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### 5. Deploy

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for first deployment
3. Your backend will be available at: `https://seatrace-backend.onrender.com`

### 6. Test Deployment

```bash
# Health check
curl https://your-backend.onrender.com/api/health

# Should return:
# {"status": "ok", "service": "SeaTrace Backend"}
```

### 7. Important Notes

**Free Tier Limitations**:
- ⚠️ Service spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- Consider upgrading to Starter plan for always-on

**WebSocket Support**:
- Free tier may have WebSocket limitations
- Upgrade to paid plan for reliable WebSocket support

**Auto-Deploy**:
- Render auto-deploys on every push to `main` branch
- Check "Auto-Deploy" in service settings

---

## Troubleshooting Render

### Service Won't Start

**Check Logs**:
1. Go to your service in Render dashboard
2. Click "Logs" tab
3. Look for error messages

**Common Issues**:
- Missing dependencies → Check `requirements.txt`
- Wrong start command → Verify `start.py` exists
- Port issues → Ensure using `PORT` environment variable

### Slow Response Times

**Free Tier**:
- First request after spin-down is slow
- Upgrade to Starter plan for better performance

**Database**:
- SQLite files are ephemeral on free tier
- Consider using Render PostgreSQL (paid)

### CORS Errors

**Solution**:
1. Add your frontend URL to `CORS_ORIGINS`
2. Format: `https://your-frontend.vercel.app` (no trailing slash)
3. Redeploy service

---

## Upgrading to Paid Plan

**Benefits**:
- ✅ Always-on service (no spin-down)
- ✅ Better performance
- ✅ More reliable WebSocket support
- ✅ Better database support

**Cost**: $7/month for Starter plan

---

## Next Steps

After backend is deployed:
1. Note your Render URL
2. Update Vercel configuration with backend URL
3. Deploy frontend to Vercel
4. Update CORS_ORIGINS with frontend URL

See `DEPLOYMENT_GUIDE.md` for complete instructions.

