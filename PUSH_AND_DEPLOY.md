# 🚀 Push to Git & Deploy to Live - Step by Step

This guide will help you push your code to GitHub and deploy to Render + Vercel.

---

## 📋 Prerequisites

Before starting, make sure you have:
- [ ] Git installed
- [ ] GitHub account created
- [ ] GitHub repository created (or we'll help you create one)
- [ ] Render account (sign up at https://render.com)
- [ ] Vercel account (sign up at https://vercel.com)

---

## 🔧 Step 1: Initialize Git (If Not Done)

### Option A: New Repository

```bash
# Initialize Git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - SeaTrace Maritime Monitoring System"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Option B: Existing Repository

```bash
# Check if remote exists
git remote -v

# If no remote, add it
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

---

## 🚀 Step 2: Use Deployment Script (Easiest Way)

### Windows:
```bash
deploy-to-live.bat
```

### Linux/Mac:
```bash
chmod +x deploy-to-live.sh
./deploy-to-live.sh
```

The script will:
1. ✅ Check Git setup
2. ✅ Generate secret key
3. ✅ Stage all changes
4. ✅ Commit with message
5. ✅ Push to GitHub
6. ✅ Show next steps

---

## 📝 Step 3: Manual Push (Alternative)

If you prefer to do it manually:

```bash
# 1. Generate secret key
python generate-secret-key.py

# 2. Stage all changes
git add .

# 3. Commit
git commit -m "Deploy SeaTrace to production"

# 4. Push to GitHub
git push origin main
```

---

## 🌐 Step 4: Deploy Backend to Render

### 4.1 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (recommended)

### 4.2 Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub account
3. Select your repository

### 4.3 Configure Service

**Settings**:
- **Name**: `seatrace-backend`
- **Region**: Choose closest (e.g., Oregon)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python start.py`
- **Plan**: `Free` (or upgrade later)

### 4.4 Add Environment Variables

Click **"Advanced"** → **"Environment Variables"**:

```
FLASK_ENV=production
SECRET_KEY=<paste-from-generate-secret-key.py-output>
CORS_ORIGINS=https://your-frontend.vercel.app
```

⚠️ **Note**: Update `CORS_ORIGINS` after you get your Vercel URL in Step 5.

### 4.5 Deploy
1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. **Copy your Render URL** (e.g., `https://seatrace-backend.onrender.com`)

### 4.6 Test Backend
```bash
curl https://your-backend.onrender.com/api/health
```

Should return: `{"status": "ok", "service": "SeaTrace Backend"}`

---

## 🎨 Step 5: Deploy Frontend to Vercel

### 5.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub (recommended)

### 5.2 Import Project
1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository
3. Select your repository

### 5.3 Configure Project

**Settings**:
- **Framework Preset**: `Create React App` (auto-detected)
- **Root Directory**: `seatrace-frontend`
- **Build Command**: `npm run build` (auto)
- **Output Directory**: `build` (auto)

### 5.4 Add Environment Variables

**Before deploying**, click **"Environment Variables"**:

```
REACT_APP_API_BASE_URL=https://your-backend.onrender.com/api
REACT_APP_SOCKET_URL=https://your-backend.onrender.com
```

⚠️ **Important**: 
- Replace `your-backend.onrender.com` with your **actual Render URL** from Step 4
- No trailing slashes
- Must start with `REACT_APP_`

### 5.5 Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. **Copy your Vercel URL** (e.g., `https://seatrace-frontend.vercel.app`)

---

## 🔗 Step 6: Connect Backend & Frontend

### 6.1 Update Render CORS
1. Go back to Render dashboard
2. Edit your web service
3. Go to **"Environment"** tab
4. Update `CORS_ORIGINS`:
   ```
   CORS_ORIGINS=https://your-frontend.vercel.app
   ```
   (Replace with your actual Vercel URL)
5. Click **"Save Changes"**
6. Render will auto-redeploy

### 6.2 Test Complete Application
1. Visit your Vercel URL
2. Open browser DevTools (F12)
3. Check Console for errors
4. Try logging in
5. Verify API calls work
6. Check WebSocket connection

---

## ✅ Step 7: Verify Everything Works

### Backend Tests
- [ ] Health endpoint: `/api/health`
- [ ] API responds correctly
- [ ] WebSocket endpoint accessible

### Frontend Tests
- [ ] Page loads without errors
- [ ] Login works
- [ ] API calls succeed
- [ ] WebSocket connects
- [ ] Real-time updates work
- [ ] Map displays vessels
- [ ] Dashboard shows data

---

## 🐛 Troubleshooting

### Git Push Fails

**Problem**: Authentication error
```bash
# Solution: Use GitHub Personal Access Token
# 1. Go to GitHub Settings → Developer settings → Personal access tokens
# 2. Generate new token with 'repo' permissions
# 3. Use token as password when pushing
```

**Problem**: Remote not found
```bash
# Solution: Add remote
git remote add origin https://github.com/USERNAME/REPO.git
```

### Render Deployment Fails

**Problem**: Build fails
- Check Render logs
- Verify `requirements.txt` is correct
- Ensure Python version is compatible

**Problem**: Service won't start
- Check `start.py` exists
- Verify `PORT` environment variable
- Check Render logs for errors

### Vercel Deployment Fails

**Problem**: Build fails
- Check Vercel build logs
- Verify `package.json` is correct
- Ensure all dependencies are listed

**Problem**: Environment variables not working
- Must start with `REACT_APP_`
- Redeploy after adding variables
- Check for typos in variable names

### CORS Errors

**Problem**: CORS errors in browser
- Verify `CORS_ORIGINS` in Render matches Vercel URL exactly
- Include `https://` protocol
- No trailing slashes
- Redeploy Render after updating

### WebSocket Not Working

**Problem**: WebSocket connection fails
- Render free tier may have limitations
- Check browser console for errors
- Verify WebSocket URL is correct
- Consider upgrading Render plan

---

## 📊 Deployment Status

After successful deployment:

- **Backend URL**: `https://your-backend.onrender.com`
- **Frontend URL**: `https://your-frontend.vercel.app`
- **Status**: ✅ Live and Running

---

## 🔄 Continuous Deployment

Both Render and Vercel support auto-deployment:

- **Render**: Auto-deploys on every push to `main` branch
- **Vercel**: Auto-deploys on every push to `main` branch

Just push to GitHub and both will redeploy automatically! 🎉

---

## 🎉 Success!

Your SeaTrace Maritime Monitoring System is now live!

**Share your live app**:
- Frontend: `https://your-frontend.vercel.app`
- Backend API: `https://your-backend.onrender.com/api`

---

## 📞 Need Help?

1. Check detailed guides:
   - `DEPLOYMENT_GUIDE.md` - Complete guide
   - `RENDER_DEPLOYMENT.md` - Backend details
   - `VERCEL_DEPLOYMENT.md` - Frontend details

2. Check deployment logs:
   - Render dashboard → Logs
   - Vercel dashboard → Deployment logs

3. Verify configuration:
   - Environment variables
   - URLs match between services
   - CORS configured correctly

---

## 🚀 Quick Command Reference

```bash
# Generate secret key
python generate-secret-key.py

# Push to GitHub
git add .
git commit -m "Deploy to production"
git push origin main

# Check deployment status
curl https://your-backend.onrender.com/api/health
```

---

**You're all set! Your real-time maritime monitoring system is ready to go live!** 🌊⚓

