# SeaTrace Live Deployment Guide
## Deploy to Render (Backend) + Vercel (Frontend)

This guide will help you deploy SeaTrace to production with:
- **Backend**: Render.com (Python/Flask)
- **Frontend**: Vercel (React)

---

## 📋 Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Render Account** - Sign up at [render.com](https://render.com)
3. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
4. **Git Repository** - Push your code to GitHub

---

## 🚀 Part 1: Deploy Backend to Render

### Step 1: Prepare Your Repository

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Verify files exist**:
   - `backend/render.yaml` ✅
   - `backend/requirements.txt` ✅
   - `backend/start.py` ✅
   - `backend/app.py` ✅

### Step 2: Create Render Web Service

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** → **"Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service**:
   - **Name**: `seatrace-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python start.py`
   - **Plan**: `Free` (or upgrade for better performance)

5. **Environment Variables** (Click "Advanced" → "Add Environment Variable"):
   ```
   FLASK_ENV=production
   SECRET_KEY=<generate-a-random-secret-key>
   PORT=10000
   ```
   
   **Generate SECRET_KEY**:
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```

6. **Click "Create Web Service"**

### Step 3: Wait for Deployment

- Render will:
  1. Clone your repository
  2. Install dependencies
  3. Start your application
  4. Provide a URL like: `https://seatrace-backend.onrender.com`

### Step 4: Test Backend

1. **Health Check**: 
   ```
   https://your-backend.onrender.com/api/health
   ```
   Should return: `{"status": "ok", "service": "SeaTrace Backend"}`

2. **Note your backend URL** - You'll need it for frontend configuration

---

## 🎨 Part 2: Deploy Frontend to Vercel

### Step 1: Prepare Frontend

1. **Update `seatrace-frontend/vercel.json`** with your Render backend URL:
   ```json
   {
     "env": {
       "REACT_APP_API_BASE_URL": "https://your-backend.onrender.com/api",
       "REACT_APP_SOCKET_URL": "https://your-backend.onrender.com"
     }
   }
   ```

2. **Commit and push**:
   ```bash
   git add seatrace-frontend/vercel.json
   git commit -m "Update Vercel config with backend URL"
   git push origin main
   ```

### Step 2: Create Vercel Project

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click "Add New..."** → **"Project"**
3. **Import your GitHub repository**
4. **Configure the project**:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `seatrace-frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `build` (auto-detected)

5. **Environment Variables** (Click "Environment Variables"):
   ```
   REACT_APP_API_BASE_URL=https://your-backend.onrender.com/api
   REACT_APP_SOCKET_URL=https://your-backend.onrender.com
   ```
   ⚠️ **Replace `your-backend.onrender.com` with your actual Render URL**

6. **Click "Deploy"**

### Step 3: Wait for Deployment

- Vercel will:
  1. Install dependencies
  2. Build your React app
  3. Deploy to CDN
  4. Provide a URL like: `https://seatrace-frontend.vercel.app`

### Step 4: Update Backend CORS

1. **Go back to Render Dashboard**
2. **Edit your web service**
3. **Add Environment Variable**:
   ```
   CORS_ORIGINS=https://your-frontend.vercel.app,https://your-frontend.vercel.app
   ```
   ⚠️ **Replace with your actual Vercel URL**

4. **Redeploy** (Render will auto-redeploy)

---

## 🔧 Part 3: Update Backend CORS Configuration

Edit `backend/app.py` to use environment variable for CORS:

```python
from flask_cors import CORS
import os

# Get allowed origins from environment
cors_origins = os.environ.get('CORS_ORIGINS', '*').split(',')
CORS(app, origins=cors_origins)
```

Then update your Render environment variables with your Vercel URL.

---

## ✅ Part 4: Verify Deployment

### Test Backend
```bash
curl https://your-backend.onrender.com/api/health
```

### Test Frontend
1. Visit: `https://your-frontend.vercel.app`
2. Try logging in
3. Check browser console for errors
4. Verify API calls work

### Test WebSocket
1. Open browser DevTools → Network → WS
2. Check if WebSocket connection is established
3. Verify real-time updates work

---

## 🔄 Part 5: Continuous Deployment

Both Render and Vercel support auto-deployment:

- **Render**: Auto-deploys on push to `main` branch
- **Vercel**: Auto-deploys on push to `main` branch

Just push to GitHub and both will redeploy automatically!

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Backend won't start
- **Solution**: Check Render logs, verify `start.py` is correct
- **Check**: Ensure `PORT` environment variable is set

**Problem**: CORS errors
- **Solution**: Add your Vercel URL to `CORS_ORIGINS` in Render
- **Check**: Verify CORS configuration in `app.py`

**Problem**: WebSocket not working
- **Solution**: Ensure `eventlet` is installed and used in `start.py`
- **Check**: Render free tier may have WebSocket limitations

### Frontend Issues

**Problem**: API calls fail
- **Solution**: Verify `REACT_APP_API_BASE_URL` in Vercel environment variables
- **Check**: Ensure backend URL is correct (no trailing slash)

**Problem**: Build fails
- **Solution**: Check Vercel build logs
- **Check**: Ensure `package.json` has correct build script

**Problem**: Environment variables not working
- **Solution**: Variables must start with `REACT_APP_` prefix
- **Check**: Redeploy after adding environment variables

---

## 📊 Monitoring

### Render Monitoring
- **Logs**: Available in Render dashboard
- **Metrics**: CPU, Memory usage
- **Alerts**: Set up in Render dashboard

### Vercel Monitoring
- **Analytics**: Available in Vercel dashboard
- **Logs**: Function logs available
- **Performance**: Built-in analytics

---

## 🔐 Security Checklist

- [ ] Change `SECRET_KEY` to a strong random value
- [ ] Set `FLASK_ENV=production`
- [ ] Configure CORS to only allow your frontend domain
- [ ] Use HTTPS (automatic on Render/Vercel)
- [ ] Review and secure API endpoints
- [ ] Set up proper authentication

---

## 💰 Cost Considerations

### Free Tier Limits

**Render Free Tier**:
- 750 hours/month
- Spins down after 15 minutes of inactivity
- WebSocket support may be limited

**Vercel Free Tier**:
- Unlimited deployments
- 100GB bandwidth/month
- Perfect for most projects

### Upgrading

- **Render Standard**: $7/month - Always on, better performance
- **Vercel Pro**: $20/month - More features, better analytics

---

## 📝 Quick Reference

### Backend URL (Render)
```
https://your-backend.onrender.com
```

### Frontend URL (Vercel)
```
https://your-frontend.vercel.app
```

### Environment Variables

**Render (Backend)**:
```
FLASK_ENV=production
SECRET_KEY=<your-secret-key>
PORT=10000
CORS_ORIGINS=https://your-frontend.vercel.app
```

**Vercel (Frontend)**:
```
REACT_APP_API_BASE_URL=https://your-backend.onrender.com/api
REACT_APP_SOCKET_URL=https://your-backend.onrender.com
```

---

## 🎉 Success!

Your SeaTrace application is now live! 

- **Backend**: https://your-backend.onrender.com
- **Frontend**: https://your-frontend.vercel.app

Share your live monitoring system with the world! 🌊⚓

---

## 📞 Support

If you encounter issues:
1. Check deployment logs in Render/Vercel dashboards
2. Review this guide's troubleshooting section
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly
