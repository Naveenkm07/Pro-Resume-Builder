# Quick Setup Guide for Windows/PowerShell

## Fixing Common Issues

### 1. npm Execution Policy Error

If you see:
```
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled
```

**Solution**: Use `node` directly instead of `npm`:
```powershell
# Instead of: npm start
node index.js

# Instead of: npm test
node test-local.js

# Instead of: npm install
# Use: node install (but npm install should work)
```

Or change PowerShell execution policy:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. Missing pdf-lib Module

If you see:
```
Error: Cannot find module 'pdf-lib'
```

**Solution**: Install dependencies first:
```powershell
npm install
# Or if npm doesn't work:
node install
```

### 3. Testing the Service

**Terminal 1 - Start Server:**
```powershell
node index.js
```

**Terminal 2 - Run Tests:**
```powershell
# Install dependencies first if not done
npm install

# Run local test
node test-local.js

# Run acceptance test (requires server running)
node test-acceptance.js
```

### 4. Testing API with PowerShell

**Using Invoke-WebRequest:**
```powershell
$body = @{
    html = "<html><body><h1>Test Resume</h1></body></html>"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:4000/render" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -OutFile "resume.pdf"
```

**Using curl.exe (if available):**
```powershell
curl.exe -X POST http://localhost:4000/render `
    -H "Content-Type: application/json" `
    -d '{\"html\": \"<html><body><h1>Resume</h1></body></html>\"}' `
    --output resume.pdf
```

### 5. Port Configuration

The renderer service runs on port **4000** by default (not 3001).

To change it:
```powershell
$env:PORT = "5000"
node index.js
```

