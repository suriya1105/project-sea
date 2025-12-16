# SeaTrace Deployment Guide

This guide will help you deploy the SeaTrace application to Vercel (frontend) and Render (backend).

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **GitHub Repository**: Push your code to a GitHub repository

## Backend Deployment (Render)

### Step 1: Prepare Backend for Render

1. **Update CORS Origins**: In `backend/app.py`, update the CORS configuration:
   ```python
   CORS(app, origins=["https://your-vercel-app.vercel.app", "http://localhost:3000"])
   ```

2. **Environment Variables**: The following environment variables will be set in Render:
   - `SECRET_KEY`: Auto-generated secure key
   - `PORT`: Provided by Render
   - `FLASK_ENV`: Set to "production"

### Step 2: Deploy to Render

1. Go to [render.com](https://render.com) and sign in
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `seatrace-backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python start.py`
5. Add environment variables:
   - `FLASK_ENV`: `production`
   - `SECRET_KEY`: Generate a secure random key
6. Click "Create Web Service"

### Step 3: Note Your Backend URL

After deployment, note the URL provided by Render (e.g., `https://seatrace-backend.onrender.com`)

## Frontend Deployment (Vercel)

### Step 1: Update Frontend Configuration

1. **Update vercel.json**: Replace `your-render-backend-url.onrender.com` with your actual Render URL:
   ```json
   {
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "https://your-actual-render-url.onrender.com/api/$1"
       },
       {
         "src": "/socket.io/(.*)",
         "dest": "https://your-actual-render-url.onrender.com/socket.io/$1"
       }
     ],
     "env": {
       "REACT_APP_API_BASE_URL": "https://your-actual-render-url.onrender.com",
       "REACT_APP_SOCKET_URL": "https://your-actual-render-url.onrender.com"
     }
   }
   ```

2. **Update .env**: The environment variables will be set automatically by Vercel.

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `seatrace-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. Add environment variables:
   - `REACT_APP_API_BASE_URL`: Your Render backend URL
   - `REACT_APP_SOCKET_URL`: Your Render backend URL
6. Click "Deploy"

## Post-Deployment Configuration

### Step 1: Update CORS in Backend

After both deployments are complete, update the CORS origins in your Render backend:

1. Go to your Render dashboard
2. Select your backend service
3. Go to Environment
4. Add or update the CORS_ORIGINS environment variable with your Vercel URL

### Step 2: Test the Application

1. **Frontend**: Visit your Vercel URL
2. **Backend Health Check**: Visit `https://your-render-url.onrender.com/api/health`
3. **API Test**: Try logging in with the default credentials

## Default Login Credentials

- **Admin**: `admin@seatrace.com` / `admin123`
- **Operator**: `operator@seatrace.com` / `operator123`
- **Viewer**: `viewer@seatrace.com` / `viewer123`

## Troubleshooting

### Backend Issues
- Check Render logs for Python errors
- Ensure all dependencies are in `requirements.txt`
- Verify environment variables are set correctly

### Frontend Issues
- Check Vercel build logs for React errors
- Verify API URLs in `vercel.json` are correct
- Check browser console for CORS errors

### CORS Issues
- Ensure backend CORS origins include your Vercel URL
- Check that API calls use the correct base URL

## Data Persistence

The application uses JSON file storage in the `backend/data/` directory:
- `vessels.json`: Vessel tracking data
- `oil_spills.json`: Oil spill incident data
- `users.json`: User authentication data
- `audit_logs.json`: Security audit logs
- `company_users.json`: Company user mappings

Data persists across deployments on Render's persistent disk.

## Security Notes

- Change default passwords after deployment
- Use HTTPS (automatically provided by Vercel and Render)
- Regularly update dependencies
- Monitor audit logs for security events

## Support

If you encounter issues:
1. Check deployment logs on both platforms
2. Verify environment variables
3. Test API endpoints individually
4. Check browser developer tools for frontend errors