# 🚀 How to Run SeaTrace Project Locally

## Quick Start

### Option 1: Run Both Servers (Easiest)

**Windows:**
```bash
START_PROJECT.bat
```

This will:
- ✅ Start backend on port 5000
- ✅ Start frontend on port 3000
- ✅ Open in separate windows

---

### Option 2: Run Separately

#### Backend Only:
```bash
cd backend
python run_dev.py
```

Backend will run on: **http://localhost:5000**

#### Frontend Only:
```bash
cd seatrace-frontend
npm start
```

Frontend will run on: **http://localhost:3000**

---

## Prerequisites

### Backend Requirements:
- Python 3.9+ installed
- Dependencies installed: `pip install -r requirements.txt`

### Frontend Requirements:
- Node.js 14+ installed
- Dependencies installed: `npm install` (in seatrace-frontend folder)

---

## First Time Setup

### 1. Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Install Frontend Dependencies
```bash
cd seatrace-frontend
npm install
```

### 3. Run the Project
```bash
# From project root
START_PROJECT.bat
```

---

## Access the Application

After starting both servers:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

---

## Troubleshooting

### Backend Won't Start

**Problem**: Port 5000 already in use
```bash
# Solution: Use different port
set PORT=5001
python run_dev.py
```

**Problem**: Missing dependencies
```bash
# Solution: Install requirements
pip install -r requirements.txt
```

**Problem**: Import errors
```bash
# Solution: Check Python path
python -c "import sys; print(sys.path)"
```

### Frontend Won't Start

**Problem**: Port 3000 already in use
```bash
# Solution: Use different port
set PORT=3001
npm start
```

**Problem**: Missing node_modules
```bash
# Solution: Install dependencies
npm install
```

**Problem**: Build errors
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### API Connection Issues

**Problem**: Frontend can't connect to backend
- Check backend is running on port 5000
- Check `App.js` has correct API_BASE_URL
- Check CORS is enabled in backend

**Problem**: CORS errors
- Backend should allow `http://localhost:3000`
- Check `app.py` CORS configuration

---

## Development Tips

### Backend Development
- Backend runs with debug mode enabled
- Changes auto-reload (if eventlet installed)
- Check logs in backend window

### Frontend Development
- Frontend runs with hot-reload
- Changes auto-refresh in browser
- Check browser console for errors

### Testing API
```bash
# Health check
curl http://localhost:5000/api/health

# Should return:
# {"status": "ok", "service": "SeaTrace Backend"}
```

---

## Stop Servers

### To Stop:
- **Backend**: Press `Ctrl+C` in backend window
- **Frontend**: Press `Ctrl+C` in frontend window
- Or simply close the terminal windows

---

## Default Login

Check your `backend/data/users.json` for default users:
- Email: (check the file)
- Password: (check the file)

Or create a new user through the admin panel.

---

## Next Steps

After running locally:
1. Test all features
2. Verify API connections
3. Check WebSocket connections
4. Test real-time updates

Then deploy to production:
- See `DEPLOYMENT_GUIDE.md` for deployment instructions

---

**Happy coding!** 🌊⚓

