# 🚀 START HERE - Deploy SeaTrace to Live!

## Quick Start (Choose Your Path)

### 🎯 Path 1: Automated Script (Recommended)

**Windows:**
```bash
deploy-to-live.bat
```

**Linux/Mac:**
```bash
chmod +x deploy-to-live.sh
./deploy-to-live.sh
```

The script will guide you through:
- ✅ Git setup
- ✅ Generating secret key
- ✅ Committing and pushing to GitHub
- ✅ Next steps for deployment

---

### 🎯 Path 2: Step-by-Step Manual

Follow: **`PUSH_AND_DEPLOY.md`**

Complete guide with:
- Git setup
- Render deployment
- Vercel deployment
- Troubleshooting

---

## 📋 What You Need

Before starting:
- [ ] GitHub account
- [ ] GitHub repository created
- [ ] Render account (https://render.com)
- [ ] Vercel account (https://vercel.com)

---

## 🎬 Quick Deployment Steps

### 1. Push to GitHub
```bash
# Generate secret key
python generate-secret-key.py

# Push to GitHub
git add .
git commit -m "Deploy SeaTrace to production"
git push origin main
```

### 2. Deploy Backend (Render)
- Go to: https://dashboard.render.com
- New → Web Service
- Connect GitHub repo
- Root Directory: `backend`
- Add SECRET_KEY from step 1
- Deploy!

### 3. Deploy Frontend (Vercel)
- Go to: https://vercel.com/dashboard
- Add New → Project
- Connect GitHub repo
- Root Directory: `seatrace-frontend`
- Add environment variables with Render URL
- Deploy!

### 4. Connect Them
- Update CORS_ORIGINS in Render with Vercel URL

---

## 📚 Documentation

- **PUSH_AND_DEPLOY.md** - Complete step-by-step guide
- **DEPLOYMENT_GUIDE.md** - Detailed deployment info
- **QUICK_DEPLOY.md** - Quick checklist
- **RENDER_DEPLOYMENT.md** - Backend details
- **VERCEL_DEPLOYMENT.md** - Frontend details

---

## ⚡ Fastest Way

1. Run: `deploy-to-live.bat` (Windows) or `./deploy-to-live.sh` (Linux/Mac)
2. Follow the prompts
3. Deploy to Render (5 min)
4. Deploy to Vercel (3 min)
5. Done! 🎉

---

## 🆘 Need Help?

Check `PUSH_AND_DEPLOY.md` for detailed instructions and troubleshooting.

---

**Let's get your real-time maritime monitoring system live!** 🌊⚓

