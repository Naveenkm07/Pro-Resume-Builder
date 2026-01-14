# Google Authentication Setup Guide

Complete step-by-step guide to set up Google OAuth 2.0 authentication for the Resume Builder application.

## Prerequisites

- Google Cloud Platform account
- MongoDB instance (local or cloud)
- Node.js and npm installed

## Step 1: Google Cloud Console Setup

### 1.1 Create a New Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it "Resume Builder" (or your preferred name)
4. Click "Create"

### 1.2 Enable Google+ API

1. Navigate to "APIs & Services" → "Library"
2. Search for "Google+ API" or "Google Identity Services"
3. Click "Enable"

### 1.3 Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure OAuth consent screen:
   - User Type: External
   - App name: Resume Builder
   - User support email: your-email@example.com
   - Developer contact: your-email@example.com
   - Click "Save and Continue"
   - Scopes: Add `email`, `profile`, `openid`
   - Click "Save and Continue"
   - Test users: Add your email (for testing)
   - Click "Save and Continue"

4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: Resume Builder Web Client
   - Authorized JavaScript origins:
     - `http://localhost:5173` (development)
     - `https://yourdomain.com` (production)
   - Authorized redirect URIs:
     - `http://localhost:5173` (development)
     - `https://yourdomain.com` (production)
   - Click "Create"

5. **Save the credentials:**
   - Copy the **Client ID** (you'll need this for frontend)
   - Copy the **Client Secret** (you'll need this for backend - KEEP SECRET!)

## Step 2: Backend Setup

### 2.1 Install Dependencies

```bash
cd backend
npm install google-auth-library jsonwebtoken cookie-parser
npm install --save-dev @types/jsonwebtoken @types/cookie-parser
```

### 2.2 Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your values:
   ```env
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   
   MONGODB_URI=mongodb://localhost:27017/resume-builder
   
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
   JWT_EXPIRY=15m
   ```

### 2.3 Update server.ts

The server.ts file is already configured. Ensure it includes:
- CORS with credentials
- Cookie parser middleware
- Auth routes

### 2.4 Start MongoDB

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
2. Create cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### 2.5 Start Backend Server

```bash
cd backend
npm run dev
# or
npm start
```

## Step 3: Frontend Setup

### 3.1 Install Dependencies

```bash
npm install axios
```

### 3.2 Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your Google Client ID:
   ```env
   VITE_API_URL=http://localhost:3001
   VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ```

### 3.3 Update App.tsx

Wrap your app with `AuthProvider`:

```tsx
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* Your app components */}
    </AuthProvider>
  );
}
```

### 3.4 Protect Routes

Wrap protected components with `ProtectedRoute`:

```tsx
import ProtectedRoute from './components/ProtectedRoute';

<ProtectedRoute>
  <YourProtectedComponent />
</ProtectedRoute>
```

## Step 4: Security Configuration

### 4.1 httpOnly Cookies (Recommended)

**Backend:** Already configured in `auth.ts` route handler.

**Frontend:** Ensure `withCredentials: true` in axios requests.

**CORS:** Backend must allow credentials:
```typescript
cors({
  origin: process.env.FRONTEND_URL,
  credentials: true, // Required!
})
```

### 4.2 localStorage Approach (Alternative)

If using localStorage instead of cookies:

1. **Backend:** Uncomment token return in `auth.ts`:
   ```typescript
   res.json({ token: jwtToken, user: {...} });
   ```

2. **Frontend:** Uncomment localStorage code in `auth.ts` service.

3. **Add Authorization header** to axios requests:
   ```typescript
   headers: {
     Authorization: `Bearer ${localStorage.getItem('authToken')}`,
   }
   ```

**⚠️ Security Risks of localStorage:**
- Vulnerable to XSS attacks
- Accessible via JavaScript
- No automatic expiration
- Must manually attach to requests

## Step 5: Testing

### 5.1 Test Authentication Flow

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `npm run dev`
3. Navigate to protected route
4. Click "Sign in with Google"
5. Select Google account
6. Verify user is logged in

### 5.2 Test Protected Routes

1. Try accessing `/api/resumes` without auth → Should return 401
2. Sign in with Google
3. Try accessing `/api/resumes` → Should return success

### 5.3 Test Logout

1. Click logout button
2. Verify cookie/token is cleared
3. Try accessing protected route → Should redirect to login

## Step 6: Production Deployment

### 6.1 Update Environment Variables

**Backend:**
- Set `NODE_ENV=production`
- Use strong `JWT_SECRET` (32+ characters)
- Update `FRONTEND_URL` to production domain
- Use secure MongoDB connection string

**Frontend:**
- Update `VITE_API_URL` to production API URL
- Update `VITE_GOOGLE_CLIENT_ID` (can be same)

### 6.2 Google Console Updates

1. Add production domain to authorized origins
2. Add production redirect URIs
3. Submit OAuth consent screen for verification (if public)

### 6.3 Security Checklist

- [ ] Strong JWT secret (32+ characters, random)
- [ ] HTTPS enabled (required for secure cookies)
- [ ] CORS configured correctly
- [ ] Environment variables secured
- [ ] MongoDB connection secured
- [ ] Rate limiting implemented (optional)
- [ ] Error messages don't leak sensitive info

## Troubleshooting

### "Invalid Google token"
- Check Client ID matches in frontend and backend
- Verify token hasn't expired
- Check OAuth consent screen is configured

### "CORS error"
- Ensure `credentials: true` in CORS config
- Check `withCredentials: true` in axios requests
- Verify origin matches exactly

### "Cookie not set"
- Check `secure: true` only in production (HTTPS)
- Verify `sameSite: 'strict'` or `'lax'`
- Check cookie path matches

### "User not found"
- Check MongoDB connection
- Verify user model schema
- Check database logs

## Security Best Practices

1. **Never expose Google Client Secret** to frontend
2. **Use httpOnly cookies** instead of localStorage when possible
3. **Short-lived JWTs** (15 minutes) with refresh tokens for production
4. **Validate email verification** (already implemented)
5. **Rate limit** authentication endpoints
6. **Monitor** failed authentication attempts
7. **Use HTTPS** in production (required for secure cookies)

## Additional Resources

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

