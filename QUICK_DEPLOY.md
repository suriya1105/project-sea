# 🚀 Quick Deployment Checklist

## Before You Start

- [ ] Code pushed to GitHub
- [ ] GitHub account connected to Render
- [ ] GitHub account connected to Vercel

---

## Backend (Render) - 10 minutes

1. **Go to**: https://dashboard.render.com
2. **Click**: "New +" → "Web Service"
3. **Connect**: Your GitHub repository
4. **Configure**:
   - Name: `seatrace-backend`
   - Root Directory: `backend`
   - Build: `pip install -r requirements.txt`
   - Start: `python start.py`
5. **Add Environment Variables**:
   ```
   FLASK_ENV=production
   SECRET_KEY=<generate-with-python>
   CORS_ORIGINS=https://your-frontend.vercel.app
   ```
6. **Deploy**: Click "Create Web Service"
7. **Wait**: 5-10 minutes
8. **Copy**: Your backend URL (e.g., `https://seatrace-backend.onrender.com`)

---

## Frontend (Vercel) - 5 minutes

1. **Go to**: https://vercel.com/dashboard
2. **Click**: "Add New..." → "Project"
3. **Import**: Your GitHub repository
4. **Configure**:
   - Root Directory: `seatrace-frontend`
   - Framework: Create React App (auto)
5. **Add Environment Variables**:
   ```
   REACT_APP_API_BASE_URL=https://your-backend.onrender.com/api
   REACT_APP_SOCKET_URL=https://your-backend.onrender.com
   ```
   ⚠️ Replace `your-backend.onrender.com` with your actual Render URL!
6. **Deploy**: Click "Deploy"
7. **Wait**: 2-3 minutes
8. **Copy**: Your frontend URL (e.g., `https://seatrace-frontend.vercel.app`)

---

## Final Steps - 2 minutes

1. **Update Render CORS**:
   - Go back to Render dashboard
   - Edit your service
   - Update `CORS_ORIGINS` with your Vercel URL
   - Redeploy

2. **Test**:
   - Visit your Vercel URL
   - Try logging in
   - Check browser console for errors

---

## ✅ Done!

Your app is live:
- **Backend**: https://your-backend.onrender.com
- **Frontend**: https://your-frontend.vercel.app

---

## 🆘 Quick Troubleshooting

**Backend won't start?**
→ Check Render logs

**CORS errors?**
→ Update CORS_ORIGINS in Render

**API calls fail?**
→ Verify environment variables in Vercel

**Build fails?**
→ Check Vercel build logs

---

## 📚 Full Guides

- **Complete Guide**: `DEPLOYMENT_GUIDE.md`
- **Render Details**: `RENDER_DEPLOYMENT.md`
- **Vercel Details**: `VERCEL_DEPLOYMENT.md`

