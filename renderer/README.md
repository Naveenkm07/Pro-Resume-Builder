# Resume PDF Renderer Service

Node.js service using Puppeteer to convert HTML resumes into A4 PDFs with proper formatting and font support.

## Features

- ✅ Converts HTML to A4 PDF format
- ✅ Supports custom margins
- ✅ Font embedding via webfont URLs
- ✅ Waits for network idle to ensure fonts/styles load
- ✅ Returns PDF as binary stream or base64
- ✅ Programmatic dimension verification

## Setup

1. Install dependencies:
```bash
npm install
```

**Note for PowerShell users**: If you encounter execution policy errors, you can:
- Use `node` directly: `node index.js` instead of `npm start`
- Or change execution policy: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

2. Start the service:
```bash
npm start
# Or use node directly: node index.js
```

The service runs on `http://localhost:4000` by default.

## API Endpoints

### POST /render

Converts HTML to PDF and returns binary stream.

**Request:**
```json
{
  "html": "<html>...</html>",
  "fonts": [
    "https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
  ],
  "margins": {
    "top": "12mm",
    "right": "12mm",
    "bottom": "12mm",
    "left": "12mm"
  }
}
```

**Response:**
- Content-Type: `application/pdf`
- Binary PDF stream

**Example (Bash/Linux/Mac):**
```bash
curl -X POST http://localhost:4000/render \
  -H "Content-Type: application/json" \
  -d '{"html": "<html><body><h1>Resume</h1></body></html>"}' \
  --output resume.pdf
```

**Example (PowerShell/Windows):**
```powershell
# Using Invoke-WebRequest
$body = @{html = "<html><body><h1>Resume</h1></body></html>"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:4000/render" -Method POST -Body $body -ContentType "application/json" -OutFile "resume.pdf"

# Or using curl.exe (if available)
curl.exe -X POST http://localhost:4000/render -H "Content-Type: application/json" -d '{\"html\": \"<html><body><h1>Resume</h1></body></html>\"}' --output resume.pdf
```

### POST /render-base64

Same as `/render` but returns PDF as base64 JSON.

**Response:**
```json
{
  "pdf": "base64-encoded-pdf-string",
  "size": 12345
}
```

### GET /health

Health check endpoint.

## Font Support

The service supports embedding webfonts by passing font URLs in the `fonts` array:

```json
{
  "html": "<html>...</html>",
  "fonts": [
    "https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap",
    "https://fonts.googleapis.com/css2?family=Open+Sans&display=swap"
  ]
}
```

The service will inject these font stylesheets into the HTML before rendering.

## Margins

Default margins are 12mm on all sides. You can customize:

```json
{
  "margins": {
    "top": "10mm",
    "right": "15mm",
    "bottom": "10mm",
    "left": "15mm"
  }
}
```

## Testing

### Local Test

Test with sample HTML file:

```bash
npm test
```

This will:
1. Read `samples/resume.html`
2. Render it to PDF
3. Verify A4 dimensions (210mm x 297mm)
4. Save output to `out.pdf`

### Acceptance Test

Test the API endpoint:

```bash
# Start server in one terminal
npm start

# In another terminal, run acceptance test
node test-acceptance.js
```

The acceptance test:
- Sends sample HTML to `/render` endpoint
- Verifies PDF dimensions match A4 format
- Saves test output to `test-output.pdf`

## A4 Format Verification

The service ensures PDFs are exactly A4 size:
- **Width**: 210mm (595.276 points)
- **Height**: 297mm (841.890 points)

Tests verify dimensions programmatically using `pdf-lib`.

## Sample HTML

See `samples/resume.html` for an example resume template with:
- Professional styling
- Sections: Header, Summary, Skills, Experience, Education
- Print-optimized CSS
- A4-sized layout

## Environment Variables

- `PORT`: Server port (default: 4000)

## Error Handling

The service returns appropriate HTTP status codes:
- `400`: Missing or invalid request data
- `500`: Internal server error (rendering failure)

## Notes

- Puppeteer launches headless Chromium
- Service waits for `networkidle0` to ensure fonts/styles load
- Fonts are injected into HTML `<head>` before rendering
- PDFs use `printBackground: true` to include background colors/images

