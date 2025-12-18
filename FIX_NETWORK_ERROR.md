# 🔧 Fix Network Error - Login Failed

## Problem: "Login failed: Network Error"

This means the frontend can't connect to the backend server.

---

## ✅ Quick Fix

### Step 1: Start Backend Server

Open a terminal and run:
```bash
cd backend
python run_dev.py
```

**Wait for**: "Starting SeaTrace Backend - Development Server"

### Step 2: Verify Backend is Running

Open in browser: http://localhost:5000/api/health

Should see:
```json
{"status": "ok", "service": "SeaTrace Backend"}
```

### Step 3: Start Frontend (if not running)

Open another terminal:
```bash
cd seatrace-frontend
npm start
```

### Step 4: Try Login Again

Go to: http://localhost:3000
Login with: `admin@seatrace.com` / `admin123`

---

## 🚀 Easiest Way: Use the Script

**Windows:**
```bash
RUN_NOW.bat
```

This starts both servers automatically!

---

## 🔍 Troubleshooting

### Backend Won't Start

**Check Python:**
```bash
python --version
```
Should show Python 3.9+

**Install Dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

**Check for Errors:**
- Look at backend terminal window
- Check for import errors
- Verify all files exist

### Backend Starts But Can't Connect

**Check Port:**
- Backend should be on port 5000
- Check if port is already in use:
  ```bash
  netstat -ano | findstr :5000
  ```

**Use Different Port:**
```bash
set PORT=5001
python run_dev.py
```

Then update frontend `App.js`:
```javascript
const API_BASE_URL = 'http://localhost:5001/api';
```

### CORS Errors

If you see CORS errors in browser console:

**Check backend CORS config:**
- Should allow `http://localhost:3000`
- Check `app.py` CORS settings

**Fix:**
```python
CORS(app, origins=['http://localhost:3000'])
```

### Frontend Can't Find Backend

**Check API URL:**
- Open browser DevTools (F12)
- Go to Network tab
- Check failed requests
- Verify URL is `http://localhost:5000/api/auth/login`

**Update if needed:**
Edit `seatrace-frontend/src/App.js`:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';
```

---

## ✅ Verification Checklist

- [ ] Backend server is running
- [ ] Backend responds at http://localhost:5000/api/health
- [ ] Frontend server is running
- [ ] Frontend accessible at http://localhost:3000
- [ ] No errors in backend terminal
- [ ] No CORS errors in browser console
- [ ] Network tab shows API calls to correct URL

---

## 🎯 Common Issues

### Issue 1: Backend Not Started
**Symptom**: Network Error
**Solution**: Start backend with `python run_dev.py`

### Issue 2: Wrong Port
**Symptom**: Connection refused
**Solution**: Check backend is on port 5000

### Issue 3: CORS Error
**Symptom**: CORS policy error in console
**Solution**: Check CORS configuration in backend

### Issue 4: Dependencies Missing
**Symptom**: Import errors in backend
**Solution**: Run `pip install -r requirements.txt`

---

## 📞 Still Having Issues?

1. **Check Backend Logs:**
   - Look at backend terminal window
   - Check for error messages

2. **Check Browser Console:**
   - Press F12
   - Go to Console tab
   - Look for errors

3. **Check Network Tab:**
   - Press F12
   - Go to Network tab
   - Try login
   - See what requests fail

4. **Verify Both Servers Running:**
   ```bash
   # Check backend
   curl http://localhost:5000/api/health
   
   # Check frontend
   curl http://localhost:3000
   ```

---

**After fixing, try login again!** 🔐

