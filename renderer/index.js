const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.use(express.json({ limit: '10mb' }));

// Default A4 margins (12mm all around)
const DEFAULT_MARGINS = {
  top: '12mm',
  right: '12mm',
  bottom: '12mm',
  left: '12mm'
};

/**
 * Inject font stylesheets into HTML
 */
function injectFonts(html, fonts = []) {
  if (!fonts || fonts.length === 0) {
    return html;
  }

  const fontLinks = fonts
    .map(font => {
      if (typeof font === 'string') {
        // Assume it's a Google Fonts URL or direct stylesheet URL
        if (font.includes('fonts.googleapis.com')) {
          return `<link href="${font}" rel="stylesheet">`;
        }
        return `<link href="${font}" rel="stylesheet">`;
      } else if (font.href) {
        return `<link href="${font.href}" rel="stylesheet">`;
      }
      return '';
    })
    .filter(Boolean)
    .join('\n');

  // Inject fonts in the <head> section
  if (html.includes('</head>')) {
    return html.replace('</head>', `${fontLinks}\n</head>`);
  } else if (html.includes('<head>')) {
    return html.replace('<head>', `<head>\n${fontLinks}`);
  } else {
    // No head tag, prepend to HTML
    return `<head>${fontLinks}</head>\n${html}`;
  }
}

/**
 * Convert HTML to PDF using Puppeteer
 */
async function renderHtmlToPdf(html, fonts = [], margins = DEFAULT_MARGINS) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();

    // Inject fonts into HTML
    const htmlWithFonts = injectFonts(html, fonts);

    // Set content and wait for network to be idle
    await page.setContent(htmlWithFonts, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait a bit more for fonts to load
    await page.evaluateHandle(() => document.fonts.ready);

    // Generate PDF with A4 format
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: margins,
      preferCSSPageSize: true
    });

    await browser.close();
    return pdf;
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    throw error;
  }
}

/**
 * POST /render
 * Accepts: { "html": "<html>", "fonts": [optional], "margins": {optional} }
 * Returns: PDF binary stream
 */
app.post('/render', async (req, res) => {
  try {
    const { html, fonts, margins } = req.body;

    if (!html) {
      return res.status(400).json({ error: 'Missing required field: html' });
    }

    const pdfMargins = margins || DEFAULT_MARGINS;

    // Generate PDF
    const pdfBuffer = await renderHtmlToPdf(html, fonts, pdfMargins);

    // Set headers for PDF response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="resume.pdf"');
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF as binary stream
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error rendering PDF:', error);
    res.status(500).json({
      error: 'Failed to render PDF',
      message: error.message
    });
  }
});

/**
 * POST /render-base64
 * Alternative endpoint that returns PDF as base64 JSON
 */
app.post('/render-base64', async (req, res) => {
  try {
    const { html, fonts, margins } = req.body;

    if (!html) {
      return res.status(400).json({ error: 'Missing required field: html' });
    }

    const pdfMargins = margins || DEFAULT_MARGINS;

    // Generate PDF
    const pdfBuffer = await renderHtmlToPdf(html, fonts, pdfMargins);

    // Return as base64
    res.json({
      pdf: pdfBuffer.toString('base64'),
      size: pdfBuffer.length
    });
  } catch (error) {
    console.error('Error rendering PDF:', error);
    res.status(500).json({
      error: 'Failed to render PDF',
      message: error.message
    });
  }
});

/**
 * GET /health
 */
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`PDF Renderer service running on port ${PORT}`);
  console.log(`POST /render - Convert HTML to PDF`);
  console.log(`POST /render-base64 - Convert HTML to PDF (base64 response)`);
});

module.exports = { renderHtmlToPdf, injectFonts };

