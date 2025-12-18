# Vercel Deployment - Step by Step

## Quick Start Guide for Frontend Deployment

### 1. Create Vercel Account
- Go to https://vercel.com
- Sign up with GitHub (recommended)

### 2. Import Project

1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository
3. Select your repository

### 3. Configure Project

**Framework Settings**:
- **Framework Preset**: `Create React App` (auto-detected)
- **Root Directory**: `seatrace-frontend`
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `build` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### 4. Set Environment Variables

**Before deploying**, click **"Environment Variables"** and add:

| Key | Value | Notes |
|-----|-------|-------|
| `REACT_APP_API_BASE_URL` | `https://your-backend.onrender.com/api` | Your Render backend URL |
| `REACT_APP_SOCKET_URL` | `https://your-backend.onrender.com` | Your Render backend URL (no /api) |

⚠️ **Important**: 
- Replace `your-backend.onrender.com` with your actual Render URL
- No trailing slashes
- Must start with `REACT_APP_` prefix

### 5. Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. Your frontend will be available at: `https://seatrace-frontend.vercel.app`

### 6. Update vercel.json (Optional)

Your `vercel.json` should already be configured, but verify:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-backend.onrender.com/api/$1"
    },
    {
      "src": "/socket.io/(.*)",
      "dest": "https://your-backend.onrender.com/socket.io/$1"
    },
    {
      "src": "/static/(.*)",
      "dest": "/static/$1"
    },
    {
      "src": "/(.*\\.(js|css|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot))",
      "dest": "/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### 7. Test Deployment

1. Visit your Vercel URL
2. Open browser DevTools (F12)
3. Check Console for errors
4. Try logging in
5. Verify API calls work (Network tab)

---

## Environment Variables in Vercel

### Setting Variables

1. Go to your project in Vercel dashboard
2. Click **"Settings"** → **"Environment Variables"**
3. Add variables for:
   - **Production**
   - **Preview** (optional)
   - **Development** (optional)

### Required Variables

```
REACT_APP_API_BASE_URL=https://your-backend.onrender.com/api
REACT_APP_SOCKET_URL=https://your-backend.onrender.com
```

### After Adding Variables

⚠️ **Important**: After adding/changing environment variables:
1. Go to **"Deployments"** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**

Environment variables are only available at build time!

---

## Custom Domain (Optional)

### Add Custom Domain

1. Go to **"Settings"** → **"Domains"**
2. Add your domain
3. Follow DNS configuration instructions
4. Update CORS_ORIGINS in Render with your custom domain

---

## Troubleshooting Vercel

### Build Fails

**Check Build Logs**:
1. Go to deployment in Vercel dashboard
2. Click on failed deployment
3. Check build logs for errors

**Common Issues**:
- Missing dependencies → Check `package.json`
- Build errors → Check React code for errors
- Environment variables → Ensure `REACT_APP_` prefix

### API Calls Fail

**Check**:
1. Verify `REACT_APP_API_BASE_URL` is set correctly
2. Check browser console for CORS errors
3. Verify backend is running and accessible
4. Check Network tab for failed requests

### Environment Variables Not Working

**Solution**:
1. Variables must start with `REACT_APP_`
2. Redeploy after adding variables
3. Check variable names for typos
4. Verify values don't have trailing slashes

### Routing Issues (404 on refresh)

**Solution**:
- Your `vercel.json` should already handle this
- Verify rewrite rules are correct
- Check that `index.html` is in build output

---

## Auto-Deployment

Vercel automatically deploys:
- ✅ Every push to `main` branch → Production
- ✅ Pull requests → Preview deployments
- ✅ Other branches → Preview deployments

### Disable Auto-Deploy

1. Go to **"Settings"** → **"Git"**
2. Uncheck **"Automatically deploy"**

---

## Performance Optimization

### Vercel Analytics

1. Go to **"Analytics"** tab
2. Enable analytics (may require Pro plan)
3. Monitor performance metrics

### Image Optimization

Vercel automatically optimizes images through CDN.

### Caching

Vercel automatically caches static assets.

---

## Free Tier Limits

**Vercel Free Tier**:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Preview deployments

**Upgrade to Pro** ($20/month):
- More bandwidth
- Team collaboration
- Advanced analytics
- More features

---

## Next Steps

After frontend is deployed:
1. Update Render CORS_ORIGINS with your Vercel URL
2. Test the complete application
3. Share your live monitoring system!

See `DEPLOYMENT_GUIDE.md` for complete instructions.

