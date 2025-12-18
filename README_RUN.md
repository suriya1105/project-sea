# 🚀 Run SeaTrace Project - Quick Guide

## ⚡ Fastest Way to Run

### Windows:
Double-click: **`RUN_NOW.bat`**

Or in terminal:
```bash
RUN_NOW.bat
```

This will automatically:
- ✅ Start backend server on port 5000
- ✅ Start frontend server on port 3000
- ✅ Open in separate windows

---

## 📋 Manual Method

### Step 1: Start Backend

Open a terminal and run:
```bash
cd backend
python run_dev.py
```

Backend will start on: **http://localhost:5000**

### Step 2: Start Frontend

Open another terminal and run:
```bash
cd seatrace-frontend
npm start
```

Frontend will start on: **http://localhost:3000**

---

## 🌐 Access the Application

Once both servers are running:

1. **Open your browser**
2. **Go to**: http://localhost:3000
3. **Login** with your credentials

---

## ✅ Verify It's Working

### Test Backend:
Open: http://localhost:5000/api/health

Should see:
```json
{"status": "ok", "service": "SeaTrace Backend"}
```

### Test Frontend:
Open: http://localhost:3000

Should see the SeaTrace login page.

---

## 🐛 Troubleshooting

### Backend Issues

**Port 5000 already in use:**
```bash
# Use different port
set PORT=5001
python run_dev.py
```

**Missing dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

### Frontend Issues

**Port 3000 already in use:**
```bash
# Use different port
set PORT=3001
npm start
```

**Missing dependencies:**
```bash
cd seatrace-frontend
npm install
```

### Can't Connect to Backend

- Make sure backend is running
- Check backend window for errors
- Verify port 5000 is accessible

---

## 🛑 Stop Servers

Press `Ctrl+C` in each server window, or close the windows.

---

## 📚 More Information

See `HOW_TO_RUN.md` for detailed instructions.

---

**Ready to monitor the seas!** 🌊⚓

