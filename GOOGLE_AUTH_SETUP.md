# Google OAuth 2.0 Setup Guide

Complete step-by-step guide to set up Google Authentication for your application.

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: **"Resume Builder"** (or your app name)
4. Click **"Create"**

## Step 2: Enable Google+ API

1. In Google Cloud Console, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"** or **"Google Identity Services"**
3. Click on it and press **"Enable"**

## Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** user type → Click **"Create"**
3. Fill in the required information:
   - **App name**: Resume Builder (or your app name)
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
   - Click **"Save and Continue"**

4. **Scopes** (Step 2):
   - Click **"Add or Remove Scopes"**
   - Select these scopes:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`
   - Click **"Update"** → **"Save and Continue"**

5. **Test users** (Step 3):
   - Add your email address as a test user
   - Click **"Save and Continue"**

6. **Summary** (Step 4):
   - Review and click **"Back to Dashboard"**

## Step 4: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Select **"Web application"** as application type
4. Fill in the details:
   - **Name**: Resume Builder Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (for development)
     - `https://yourdomain.com` (for production)
   - **Authorized redirect URIs**:
     - `http://localhost:5173/auth/callback` (for development)
     - `https://yourdomain.com/auth/callback` (for production)
5. Click **"Create"**

## Step 5: Save Your Credentials

After creating, you'll see a popup with:
- **Client ID**: Copy this (you'll need it for frontend)
- **Client Secret**: Copy this (you'll need it for backend - KEEP SECRET!)

**Important**: Save these credentials securely. You won't be able to see the Client Secret again!

## Step 6: Configure Environment Variables

### Backend (.env)

Create `backend/.env` file:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# MongoDB
MONGODB_URI=mongodb://localhost:27017/resume-builder

# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRY=7d
```

**Replace:**
- `your-client-id.apps.googleusercontent.com` with your **Client ID**
- `your-client-secret-here` with your **Client Secret**
- `your-super-secret-jwt-key-minimum-32-characters-long` with a strong random string (32+ characters)

### Frontend (.env)

Create `.env` file in root:

```env
# API Configuration
VITE_API_URL=http://localhost:3001

# Google OAuth 2.0 Client ID (Public - safe to expose)
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

**Replace:**
- `your-client-id.apps.googleusercontent.com` with your **Client ID**

## Step 7: Install Dependencies

### Backend

```bash
cd backend
npm install google-auth-library jsonwebtoken mongoose axios
npm install --save-dev @types/jsonwebtoken
```

### Frontend

```bash
npm install react-router-dom axios
```

## Step 8: Start MongoDB

**Local MongoDB:**
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
# Start MongoDB service from Services panel
```

**MongoDB Atlas (Cloud):**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Update `MONGODB_URI` in `backend/.env`

## Step 9: Start the Application

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected
🚀 Server running on http://localhost:3001
```

### Terminal 2 - Frontend
```bash
npm run dev
```

You should see:
```
VITE v6.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

## Step 10: Test Authentication

1. Open browser: `http://localhost:5173`
2. Click **"Sign in with Google"** button
3. You'll be redirected to Google OAuth consent screen
4. Select your Google account
5. Grant permissions
6. You'll be redirected back to `/auth/callback`
7. Then redirected to `/dashboard`
8. You should see your name, email, and profile picture!

## Troubleshooting

### "redirect_uri_mismatch" Error
- Check that redirect URI in Google Console matches exactly: `http://localhost:5173/auth/callback`
- Make sure there are no trailing slashes
- Check both Authorized redirect URIs in Google Console

### "Invalid client" Error
- Verify `GOOGLE_CLIENT_ID` in both frontend and backend `.env` files
- Make sure Client ID matches exactly (no extra spaces)

### "Invalid client secret" Error
- Verify `GOOGLE_CLIENT_SECRET` in backend `.env`
- Make sure there are no quotes around the secret
- Regenerate client secret if needed

### "MongoDB connection error"
- Make sure MongoDB is running
- Check `MONGODB_URI` in backend `.env`
- For Atlas, check IP whitelist and connection string

### Token not stored in localStorage
- Check browser console for errors
- Verify API URL is correct: `VITE_API_URL=http://localhost:3001`
- Check Network tab to see if `/api/auth/google/callback` returns token

## Security Notes

1. **Never commit `.env` files** to version control
2. **Client Secret** should only be in backend `.env` (never in frontend)
3. **JWT_SECRET** should be a strong random string (32+ characters)
4. In production, use **HTTPS** for all URLs
5. Update **Authorized redirect URIs** with production domain

## Production Deployment

1. Update Google Console:
   - Add production domain to Authorized JavaScript origins
   - Add production callback URL to Authorized redirect URIs

2. Update environment variables:
   - Backend: Use production MongoDB URI
   - Frontend: Use production API URL
   - Both: Use production Google Client ID

3. Enable HTTPS:
   - Required for secure OAuth flow
   - Update redirect URIs to use `https://`

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Identity Services](https://developers.google.com/identity/gsi/web)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)

