# Deployment Connection Guide

## 🔗 How to Connect Backend (Render) to Frontend (Vercel)

This is the final step to make your app work live. You need to tell your **Frontend** where your **Backend** lives.

### Step 1: Get your Backend URL
1.  Go to your **Render Dashboard**.
2.  Click on your `project-sea` Web Service.
3.  Copy the URL near the top left (it looks like `https://project-sea.onrender.com`).

### Step 2: Configure Vercel
1.  Go to your **Vercel Dashboard**.
2.  Click on your **SeaTrace** project.
3.  Click on the **Settings** tab (top menu).
4.  Click on **Environment Variables** (left menu).

### Step 3: Add Variables
You need to add these **TWO** variables exactly as written below:

#### Variable 1: API URL
-   **Key**: `REACT_APP_API_BASE_URL`
-   **Value**: `https://project-sea.onrender.com/api`
    -   *Note*: Ensure you add `/api` at the end.
-   Click **Save**.

#### Variable 2: Socket URL
-   **Key**: `REACT_APP_SOCKET_URL`
-   **Value**: `https://project-sea.onrender.com`
    -   *Note*: **NO** `/api` at the end.
-   Click **Save**.

### Step 4: Redeploy
1.  Go to the **Deployments** tab.
2.  Click the **three dots (...)** next to your latest deployment.
3.  Select **Redeploy**.
4.  Click **Redeploy** again.

### ❓ Troubleshooting

#### ❌ Authentication Error
If you see "Network Error" on login:
-   Check your `REACT_APP_API_BASE_URL`.
-   It **MUST** have `/api` at the end.

#### ❌ Build Error ("exited with 1")
If Vercel fails with `Command "npm run build" exited with 1`:
1.  Go to **Environment Variables** in Vercel.
2.  Add a new variable:
    -   **Key**: `CI`
    -   **Value**: `false`
3.  **Redeploy**.
    -   *Reason*: This tells Vercel to ignore minor warnings (like unused variables) and finish the build.

**Success!** 🎉
Once the redeployment finishes, your SeaTrace app on Vercel will effectively "talk" to your Backend on Render. You can test it by trying to **Login**.
