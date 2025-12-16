# Quick Start Guide - SeaTrace

## Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn
- Git

## ⚡ Quick Start (5 minutes)

### Windows Users

1. **Double-click `setup.bat`** in the project root
2. Wait for setup to complete
3. Open two terminals:

**Terminal 1:**
```cmd
cd backend
venv\Scripts\activate.bat
python app.py
```

**Terminal 2:**
```cmd
cd seatrace-frontend
npm start
```

### Mac/Linux Users

1. **Run setup script:**
```bash
chmod +x setup.sh
./setup.sh
```

2. Open two terminals:

**Terminal 1:**
```bash
cd backend
source venv/bin/activate
python app.py
```

**Terminal 2:**
```bash
cd seatrace-frontend
npm start
```

## 🌐 Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api

## 📝 Test Credentials

```
Email:    test@seatrace.com
Password: password123
```

## 🐳 Docker Setup (Optional)

```bash
docker-compose up --build
```

Then access:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000

## 📋 Manual Setup

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate.bat
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your settings

# Initialize database
python
>>> from app import app, db
>>> with app.app_context():
>>>     db.create_all()
>>> exit()

# Run backend
python app.py
```

### Frontend Setup

```bash
# Navigate to frontend
cd seatrace-frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Run development server
npm start
```

## 📦 Project Structure

```
project-sea/
├── backend/
│   ├── app.py              # Main Flask app
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile          # Docker config
│   └── .env.example        # Environment template
├── seatrace-frontend/
│   ├── src/
│   │   ├── App.js          # Main component
│   │   ├── api.js          # API calls
│   │   └── index.js        # Entry point
│   ├── package.json        # Node dependencies
│   ├── Dockerfile          # Docker config
│   └── .env.example        # Environment template
├── setup.bat               # Windows setup
├── setup.sh                # Linux/Mac setup
├── docker-compose.yml      # Docker compose
└── README.md               # Full documentation
```

## 🔧 Troubleshooting

### Port Already in Use

**Backend (Port 5000 in use):**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

**Frontend (Port 3000 in use):**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

### Module Not Found

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd seatrace-frontend
npm install
```

### Database Issues

```bash
# Reset database
cd backend
rm seatrace.db
python
>>> from app import app, db
>>> with app.app_context():
>>>     db.create_all()
>>> exit()
```

## 📚 Common Commands

### Backend

```bash
# Run server
python app.py

# Run with debug
FLASK_DEBUG=True python app.py

# Create database tables
python -c "from app import db; db.create_all()"

# Shell access
python -c "from app import app; app.app_context().push()"
```

### Frontend

```bash
# Development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject (one-way operation)
npm eject
```

## 🚀 Deployment

### Vercel (Frontend)

```bash
npm install -g vercel
vercel login
vercel
```

### Heroku (Backend)

```bash
heroku create your-app-name
heroku config:set FLASK_ENV=production
git push heroku main
```

## 📞 Support

- Check the full README.md for detailed documentation
- Review API documentation in backend/
- Check component documentation in frontend/src/

## 🔐 Security Notes

- Change SECRET_KEY in production
- Use environment variables for sensitive data
- Enable HTTPS in production
- Set secure CORS origins
- Use strong passwords

## 📈 Next Steps

1. Customize branding and colors
2. Configure Twilio for SMS (optional)
3. Set up database backups
4. Configure email notifications
5. Set up monitoring and logging
6. Deploy to production

---

**Happy coding! 🚀**
