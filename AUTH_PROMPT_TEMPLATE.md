# Authentication Implementation Prompt Template

Use this prompt template to request authentication features:

---

**Task: Implement secure authentication for [YOUR_APP_NAME] web application.**

## Application Context:
- **App Type**: [e.g., Resume Builder, E-commerce, SaaS Platform]
- **Tech Stack**: 
  - Frontend: [React/Vue/Angular] + [Vite/Next.js/CRA] + TypeScript
  - Backend: [Node.js/Express, Python/FastAPI, etc.] + TypeScript
  - Database: [MongoDB/PostgreSQL/MySQL]

## Authentication Requirements:

### 1. Authentication Method:
- [ ] Google OAuth 2.0
- [ ] Email/Password
- [ ] GitHub OAuth
- [ ] Microsoft OAuth
- [ ] Magic Link
- [ ] Other: _______________

### 2. Frontend Requirements:
- [ ] Sign-in component/button
- [ ] Sign-up component
- [ ] Logout functionality
- [ ] Protected routes
- [ ] Auth state management (Context/Redux)
- [ ] Session persistence
- [ ] Remember me option

### 3. Backend Requirements:
- [ ] Token verification endpoint
- [ ] User registration endpoint
- [ ] User login endpoint
- [ ] Logout endpoint
- [ ] Password hashing (if email/password)
- [ ] JWT token generation
- [ ] Token refresh mechanism
- [ ] User model/schema

### 4. Security Requirements:
- [ ] Token storage method:
  - [ ] httpOnly cookies (recommended)
  - [ ] localStorage
  - [ ] sessionStorage
- [ ] Token expiry: [e.g., 15 minutes, 1 hour]
- [ ] Refresh token: [Yes/No]
- [ ] Email verification: [Required/Optional]
- [ ] Password requirements: [if applicable]
- [ ] Rate limiting: [Yes/No]
- [ ] CSRF protection: [Yes/No]

### 5. Authorization:
- [ ] Role-based access control (RBAC)
- [ ] Permission-based access
- [ ] Protected API routes
- [ ] Middleware for route protection

### 6. User Management:
- [ ] User profile management
- [ ] Password reset functionality
- [ ] Email change functionality
- [ ] Account deletion
- [ ] User preferences storage

### 7. Error Handling:
- [ ] Invalid credentials
- [ ] Expired tokens
- [ ] Network errors
- [ ] OAuth failures
- [ ] User-friendly error messages

## Deliverables:
- [ ] Frontend authentication components
- [ ] Backend authentication routes
- [ ] Database schema/models
- [ ] Middleware for protection
- [ ] Environment variable configuration
- [ ] Setup documentation
- [ ] Security best practices guide

## Additional Requirements:
[Add any specific requirements here]

---

## Example Usage:

**Task: Implement secure Google OAuth 2.0 authentication for a Resume Builder web application.**

**Application Context:**
- App Type: Resume Builder SaaS
- Tech Stack: React + Vite + TypeScript (Frontend), Node.js + Express + TypeScript (Backend), MongoDB

**Authentication Requirements:**
1. Authentication Method: Google OAuth 2.0
2. Frontend: Sign-in button, protected routes, auth context
3. Backend: Token verification, JWT generation, user model
4. Security: httpOnly cookies, 15-minute token expiry, email verification required
5. Authorization: Protected API routes for resume save/export
6. Error Handling: All common auth errors

**Deliverables:**
- Complete frontend and backend code
- Setup guide
- Security documentation

---

## Quick Prompt (Copy-Paste Ready):

```
Task: Implement secure [AUTH_METHOD] authentication for [APP_NAME].

Tech Stack:
- Frontend: [FRAMEWORK] + TypeScript
- Backend: [FRAMEWORK] + TypeScript  
- Database: [DATABASE]

Requirements:
1. [AUTH_METHOD] authentication
2. Frontend: Sign-in, protected routes, auth state
3. Backend: Token verification, JWT, user model
4. Security: [STORAGE_METHOD], [TOKEN_EXPIRY], [EMAIL_VERIFICATION]
5. Protected routes for [FEATURE_1], [FEATURE_2]

Deliverables: Complete code + setup guide + security docs.
```

