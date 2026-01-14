# Troubleshooting Guide

## "Registration failed" Error

If you're seeing "Registration failed" when trying to sign up, check the following:

### 1. Backend Server Not Running

**Check:**
```bash
# In backend directory
cd backend
npm run dev
```

**Expected output:**
```
✅ MongoDB connected
🚀 Server running on http://localhost:3001
```

**Fix:** Start the backend server if it's not running.

### 2. MongoDB Not Running

**Check MongoDB connection:**
- The backend should show: `✅ MongoDB connected`
- If you see: `❌ MongoDB connection error`, MongoDB is not running

**Start MongoDB:**

**Windows:**
- Open Services (Win + R, type `services.msc`)
- Find "MongoDB" service
- Right-click → Start

**macOS (Homebrew):**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Or use MongoDB Atlas (Cloud):**
- Create account at https://www.mongodb.com/cloud/atlas
- Get connection string
- Update `MONGODB_URI` in `backend/.env`

### 3. API URL Configuration

**Check frontend `.env` file:**
```env
VITE_API_URL=http://localhost:3001
```

**Verify:**
- File exists at root: `.env` (not `env.example`)
- URL matches backend port (default: 3001)
- Restart frontend dev server after changing `.env`

### 4. CORS Issues

**Check backend `server.ts`:**
```typescript
cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
})
```

**Verify:**
- Frontend URL matches (default: `http://localhost:5173`)
- Backend `.env` has correct `FRONTEND_URL`

### 5. Check Browser Console

**Open browser DevTools (F12) and check:**
- Network tab: Look for failed requests to `/api/auth/register`
- Console tab: Check for error messages
- Check the error response for specific details

### 6. Common Error Messages

**"Cannot connect to server"**
- Backend not running
- Wrong API URL in frontend `.env`

**"Email already exists"**
- User with this email already registered
- Try different email or sign in instead

**"Password must be at least 6 characters"**
- Password too short
- Use 6+ characters

**"Invalid email format"**
- Email format incorrect
- Use valid email (e.g., `user@example.com`)

**"MongoDB connection error"**
- MongoDB not running
- Wrong connection string in `backend/.env`

### 7. Quick Test

**Test backend health:**
```bash
# In browser or terminal
curl http://localhost:3001/health
```

**Expected response:**
```json
{"status":"ok"}
```

**If this fails:** Backend is not running or wrong port.

### 8. Check Backend Logs

**Look at backend terminal for errors:**
- Registration errors are logged with `console.error`
- Check for specific error messages
- MongoDB connection errors
- Validation errors

### 9. Environment Variables

**Backend `.env` should have:**
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/resume-builder
JWT_SECRET=your-secret-key-here
```

**Frontend `.env` should have:**
```env
VITE_API_URL=http://localhost:3001
```

### 10. Restart Everything

**If nothing works, restart:**
1. Stop backend (Ctrl+C)
2. Stop frontend (Ctrl+C)
3. Start MongoDB
4. Start backend: `cd backend && npm run dev`
5. Start frontend: `npm run dev`

## Still Having Issues?

1. Check browser console for specific error
2. Check backend terminal for error logs
3. Verify MongoDB is running
4. Verify backend is running on port 3001
5. Check `.env` files are configured correctly

