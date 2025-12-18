# 🎯 Exact Commands to Push & Deploy

Copy and paste these commands in order:

---

## Step 1: Generate Secret Key

```bash
python generate-secret-key.py
```

**Copy the output** - you'll need it for Render!

---

## Step 2: Add All Files to Git

```bash
git add .
```

---

## Step 3: Commit Changes

```bash
git commit -m "Deploy SeaTrace - Real-time Maritime Monitoring System"
```

---

## Step 4: Check Your Remote

```bash
git remote -v
```

**If you see your GitHub URL**, proceed to Step 5.

**If you see "fatal: No remote configured"**, add your remote:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

Replace:
- `YOUR_USERNAME` with your GitHub username
- `YOUR_REPO_NAME` with your repository name

---

## Step 5: Push to GitHub

```bash
git push -u origin main
```

**If this is your first push**, you might need to authenticate:
- Use your GitHub username
- Use a Personal Access Token as password (not your GitHub password)
- Get token from: GitHub Settings → Developer settings → Personal access tokens

---

## Step 6: Deploy to Render (Backend)

1. **Go to**: https://dashboard.render.com
2. **Click**: "New +" → "Web Service"
3. **Connect**: Your GitHub account
4. **Select**: Your repository
5. **Configure**:
   - Name: `seatrace-backend`
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python start.py`
6. **Add Environment Variables**:
   - `FLASK_ENV` = `production`
   - `SECRET_KEY` = `<paste from Step 1>`
   - `CORS_ORIGINS` = `https://your-frontend.vercel.app` (update after Vercel)
7. **Click**: "Create Web Service"
8. **Wait**: 5-10 minutes
9. **Copy**: Your Render URL (e.g., `https://seatrace-backend.onrender.com`)

---

## Step 7: Deploy to Vercel (Frontend)

1. **Go to**: https://vercel.com/dashboard
2. **Click**: "Add New..." → "Project"
3. **Import**: Your GitHub repository
4. **Configure**:
   - Root Directory: `seatrace-frontend`
   - Framework: Create React App (auto)
5. **Add Environment Variables**:
   - `REACT_APP_API_BASE_URL` = `https://your-backend.onrender.com/api`
   - `REACT_APP_SOCKET_URL` = `https://your-backend.onrender.com`
   
   ⚠️ **Replace `your-backend.onrender.com` with your actual Render URL from Step 6!**
6. **Click**: "Deploy"
7. **Wait**: 2-3 minutes
8. **Copy**: Your Vercel URL (e.g., `https://seatrace-frontend.vercel.app`)

---

## Step 8: Connect Backend & Frontend

1. **Go back to**: Render dashboard
2. **Edit**: Your web service
3. **Update**: `CORS_ORIGINS` environment variable
   - Value: `https://your-frontend.vercel.app`
   - Replace with your actual Vercel URL from Step 7
4. **Save**: Render will auto-redeploy

---

## Step 9: Test Your Live App

1. **Visit**: Your Vercel URL
2. **Open**: Browser DevTools (F12)
3. **Check**: Console for errors
4. **Test**: Login functionality
5. **Verify**: API calls work
6. **Check**: WebSocket connection

---

## ✅ Done!

Your real-time maritime monitoring system is now live!

- **Backend**: `https://your-backend.onrender.com`
- **Frontend**: `https://your-frontend.vercel.app`

---

## 🆘 Troubleshooting

### Git Push Fails

**Authentication Error:**
1. Go to: https://github.com/settings/tokens
2. Generate new token (classic)
3. Select: `repo` scope
4. Copy token
5. Use token as password when pushing

**Remote Not Found:**
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

### Render Deployment Issues

**Check Logs:**
- Go to Render dashboard → Your service → Logs tab

**Common Issues:**
- Build fails → Check `requirements.txt`
- Service won't start → Check `start.py` exists
- Port error → Ensure `PORT` env var is set

### Vercel Deployment Issues

**Check Build Logs:**
- Go to Vercel dashboard → Your deployment → Build logs

**Common Issues:**
- Build fails → Check `package.json`
- Environment variables not working → Must start with `REACT_APP_`
- API calls fail → Verify backend URL is correct

---

## 🎉 Success Checklist

- [ ] Code pushed to GitHub
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] CORS configured correctly
- [ ] Health endpoint works
- [ ] Frontend loads
- [ ] Login works
- [ ] API calls succeed
- [ ] WebSocket connects
- [ ] Real-time updates work

---

**Your live monitoring system is ready!** 🌊⚓

