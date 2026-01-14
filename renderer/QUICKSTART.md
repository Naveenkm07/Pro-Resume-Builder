# Quick Start Guide - Renderer Service

## Current Status

You're already in the `renderer` directory! ✅

## Starting the Server

Since you're already here, just run:

```powershell
# Option 1: Use node directly (avoids npm execution policy issues)
node index.js

# Option 2: If npm works for you
npm start
```

**Note**: First run will download Chromium (~170MB), so it may take 1-2 minutes to start.

## Testing

Once the server is running, you'll see:
```
PDF Renderer service running on port 4000
```

### Test 1: Health Check
```powershell
Invoke-WebRequest -Uri "http://localhost:4000/health" -UseBasicParsing
```

### Test 2: Local Test (no server needed)
```powershell
node test-local.js
```

### Test 3: Acceptance Test (requires server running)
```powershell
# In a new terminal window
node test-acceptance.js
```

## Common Issues

### Issue: "Cannot find path 'X:\portfolio\renderer\renderer'"
**Solution**: You're already in the renderer directory! Don't run `cd renderer` again.

### Issue: npm execution policy error
**Solution**: Use `node index.js` instead of `npm start`

### Issue: Server not responding
**Solution**: 
- Wait 1-2 minutes for Chromium download on first run
- Check if port 4000 is already in use: `netstat -ano | findstr :4000`
- Check server logs for errors

## Current Directory Commands

Since you're in `x:\portfolio\renderer`, you can run:

```powershell
# Start server
node index.js

# Run local test
node test-local.js

# Check if dependencies are installed
Test-Path node_modules

# Install dependencies (if needed)
npm install
```

## Next Steps

1. ✅ You're in the right directory
2. ✅ Dependencies are installed
3. ▶️ Start the server: `node index.js`
4. ▶️ Test it: Open a new terminal and run `node test-acceptance.js`

