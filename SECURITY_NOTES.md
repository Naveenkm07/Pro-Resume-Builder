# Security Implementation Notes

## Authentication Architecture

This implementation provides **two authentication approaches** with clear security trade-offs.

## Approach 1: httpOnly Cookies (RECOMMENDED) ✅

### Implementation
- JWT token stored in **httpOnly cookie** set by backend
- Cookie automatically sent with requests
- Not accessible via JavaScript (XSS protection)

### Security Benefits
- ✅ **XSS Protection**: JavaScript cannot access the token
- ✅ **Automatic Transmission**: Sent with every request
- ✅ **CSRF Protection**: Using `sameSite: 'strict'`
- ✅ **Secure Flag**: HTTPS-only in production

### Configuration
```typescript
// Backend: Set cookie
res.cookie('authToken', jwtToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000, // 15 minutes
});

// Frontend: Include credentials
axios.post(url, data, {
  withCredentials: true, // Required!
});
```

### CORS Requirements
```typescript
cors({
  origin: process.env.FRONTEND_URL,
  credentials: true, // Must be true!
});
```

## Approach 2: localStorage (ALTERNATIVE - LESS SECURE) ⚠️

### Implementation
- JWT token stored in **localStorage**
- Manually attached to Authorization header
- Accessible via JavaScript

### Security Risks
- ⚠️ **XSS Vulnerability**: Malicious scripts can steal token
- ⚠️ **Manual Management**: Must remember to attach to requests
- ⚠️ **No Automatic Expiry**: Token persists until manually cleared
- ⚠️ **CSRF Risk**: Token sent with every request

### When to Use
- Development/testing environments
- When cookie-based auth is not feasible
- With additional XSS protection measures

### Configuration
```typescript
// Backend: Return token in response
res.json({ token: jwtToken, user: {...} });

// Frontend: Store and use
localStorage.setItem('authToken', token);
axios.get(url, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

## Security Best Practices Implemented

### 1. Token Expiry
- Short-lived JWTs (15 minutes)
- Prevents long-term token exposure
- Forces re-authentication

### 2. Email Verification
- Only verified Google emails accepted
- Prevents unverified account access

### 3. Token Validation
- Backend verifies every request
- Rejects expired or tampered tokens
- Proper error handling

### 4. CORS Configuration
- Specific origin whitelist
- Credentials enabled for cookies
- Proper headers allowed

### 5. Error Handling
- Generic error messages (no info leakage)
- Proper HTTP status codes
- Logging for debugging (server-side only)

## Production Checklist

- [ ] Use **httpOnly cookies** (not localStorage)
- [ ] Enable **HTTPS** (required for secure cookies)
- [ ] Strong **JWT_SECRET** (32+ random characters)
- [ ] Set **NODE_ENV=production**
- [ ] Configure **CORS** with specific origins
- [ ] Enable **rate limiting** on auth endpoints
- [ ] Monitor **failed authentication** attempts
- [ ] Regular **security audits**
- [ ] Keep dependencies **updated**

## Additional Security Measures (Optional)

### Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
});

app.use('/api/auth/google', authLimiter);
```

### Refresh Tokens
For production, implement refresh tokens:
- Long-lived refresh token (7 days)
- Short-lived access token (15 minutes)
- Refresh endpoint to get new access token

### Token Blacklisting
For logout, implement token blacklist:
- Store revoked tokens in Redis
- Check blacklist on each request
- Expire blacklisted tokens automatically

## Common Vulnerabilities Prevented

1. **XSS Attacks**: httpOnly cookies prevent token theft
2. **CSRF Attacks**: sameSite cookies + CORS protection
3. **Token Replay**: Short expiry + validation
4. **Man-in-the-Middle**: HTTPS required in production
5. **Token Tampering**: JWT signature verification

## Testing Security

1. **Test XSS**: Try accessing token via `document.cookie` (should fail)
2. **Test CSRF**: Try cross-origin request (should fail)
3. **Test Expiry**: Wait 15 minutes, try request (should fail)
4. **Test Invalid Token**: Send modified token (should fail)
5. **Test Unverified Email**: Use unverified Google account (should fail)

