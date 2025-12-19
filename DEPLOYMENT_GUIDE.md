# 🚀 SeaTrace Deployment Master Guide

This guide covers everything you need to deploy your Full Stack application.

## 🟢 Part 1: Deploy Backend (Render)

We use **Render** for the Python Backend because it supports Docker and Background Tasks.

1.  **Push Code to GitHub**: Ensure your latest code is on GitHub (we did this!).
2.  **Go to Render Dashboard**: [dashboard.render.com](https://dashboard.render.com)
3.  Click **New +** -> **Web Service**.
4.  **Connect GitHub**: Select your `project-sea` repository.
5.  **Configure Service**:
    *   **Name**: `project-sea-backend`
    *   **Runtime**: **Docker** (Important! Do not select Python)
    *   **Region**: Singapore or nearest to you.
    *   **Branch**: `main`
6.  **Environment Variables** (Auto-configured):
    *   The `render.yaml` file automatically sets up:
        *   `SECRET_KEY`: Auto-generated secure key
        *   `CORS_ORIGINS`: `*` (Allows all origins)
        *   `PORT`: `5000`
        *   `FLASK_ENV`: `production`
        *   `PYTHONUNBUFFERED`: `1`
7.  **Click "Create Web Service"**.

> **Wait**: It will bake the Docker image. Once you see "Your service is live", copy the **URL** (e.g., `https://project-sea-backend.onrender.com`).

---

## ▲ Part 2: Deploy Frontend (Vercel)

We use **Vercel** for the React Frontend because it is fast and simple.

1.  **Go to Vercel Dashboard**: [vercel.com](https://vercel.com)
2.  Click **Add New...** -> **Project**.
3.  **Import GitHub Repo**: Select `project-sea`.
4.  **Framework Preset**: It should auto-detect **Create React App**.
5.  **Root Directory**: Click "Edit" and select `seatrace-frontend`.
6.  **Environment Variables** (Crucial Step):
    *   Add `REACT_APP_API_BASE_URL`: `https://YOUR-RENDER-URL.onrender.com/api` (Must end with `/api`)
    *   Add `REACT_APP_SOCKET_URL`: `https://YOUR-RENDER-URL.onrender.com`
    *   Add `REACT_APP_GOOGLE_CLIENT_ID`: `your_google_oauth_client_id` (Optional - for Google login)
    *   Add `CI`: `false` (Prevents build failing on warnings)
7.  **Click "Deploy"**.

---

## 🔐 Google OAuth Setup (Optional)

To enable Google login in production:

1. **Go to Google Cloud Console**: [console.cloud.google.com](https://console.cloud.google.com)
2. **Create/select project** and enable "Google Identity Services API"
3. **Create OAuth 2.0 Client ID** (Web application)
4. **Authorized redirect URIs**: Add your Vercel domain (e.g., `https://seatrace-frontend.vercel.app`)
5. **Copy Client ID** and add to Vercel environment variables as `REACT_APP_GOOGLE_CLIENT_ID`

---

## ❓ Troubleshooting

### ❌ Backend "Deploy Failed"
*   **Cause**: Dockerfile missing?
*   **Fix**: We verified `Dockerfile` is in the root. Check logs. If it says "File not found", double check GitHub repo has the file.

### ❌ Frontend "Network Error" on Login
*   **Cause**: Frontend is checking `localhost`.
*   **Fix**: You forgot the Environment Variables in Part 2, Step 6. Add them and **Redeploy**.

### ❌ Frontend "Build Exited with 1"
*   **Cause**: Warnings treated as errors.
*   **Fix**: Ensure `CI` variable is set to `false`.
