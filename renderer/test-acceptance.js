const http = require('http');
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:4000';
const SAMPLE_HTML_PATH = path.join(__dirname, 'samples', 'resume.html');

async function testAcceptance() {
  console.log('Running acceptance tests...\n');
  console.log(`Server URL: ${SERVER_URL}\n`);

  // Read sample HTML
  if (!fs.existsSync(SAMPLE_HTML_PATH)) {
    console.error(`Error: Sample file not found at ${SAMPLE_HTML_PATH}`);
    process.exit(1);
  }

  const html = fs.readFileSync(SAMPLE_HTML_PATH, 'utf-8');
  console.log(`✓ Read sample HTML (${html.length} bytes)`);

  // Prepare request
  const requestData = JSON.stringify({
    html: html,
    margins: {
      top: '12mm',
      right: '12mm',
      bottom: '12mm',
      left: '12mm'
    }
  });

  return new Promise((resolve, reject) => {
    const url = new URL(SERVER_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 4000),
      path: '/render',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestData)
      }
    };

    const req = http.request(options, (res) => {
      console.log(`\nResponse Status: ${res.statusCode}`);
      console.log(`Content-Type: ${res.headers['content-type']}`);

      if (res.statusCode !== 200) {
        let errorData = '';
        res.on('data', chunk => errorData += chunk);
        res.on('end', () => {
          console.error('Error response:', errorData);
          reject(new Error(`Server returned ${res.statusCode}`));
        });
        return;
      }

      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', async () => {
        try {
          const pdfBuffer = Buffer.concat(chunks);
          console.log(`✓ Received PDF (${pdfBuffer.length} bytes)`);

          // Verify PDF dimensions
          const pdfDoc = await PDFDocument.load(pdfBuffer);
          const pages = pdfDoc.getPages();
          const firstPage = pages[0];
          const { width, height } = firstPage.getSize();

          // A4 dimensions in points
          const A4_WIDTH_PT = 595.276;
          const A4_HEIGHT_PT = 841.890;
          const tolerance = 5;

          console.log(`\nPDF Page Dimensions:`);
          console.log(`  Width: ${width.toFixed(2)} pt (expected: ${A4_WIDTH_PT} pt)`);
          console.log(`  Height: ${height.toFixed(2)} pt (expected: ${A4_HEIGHT_PT} pt)`);

          const widthMatch = Math.abs(width - A4_WIDTH_PT) < tolerance;
          const heightMatch = Math.abs(height - A4_HEIGHT_PT) < tolerance;

          if (widthMatch && heightMatch) {
            console.log(`\n✅ ACCEPTANCE TEST PASSED`);
            console.log(`✓ PDF dimensions match A4 format (within ${tolerance}pt tolerance)`);
            console.log(`✓ PDF prints exactly as A4`);
            
            // Save for inspection
            const outputPath = path.join(__dirname, 'test-output.pdf');
            fs.writeFileSync(outputPath, pdfBuffer);
            console.log(`✓ Test PDF saved to: ${outputPath}`);
            
            resolve();
          } else {
            console.log(`\n❌ ACCEPTANCE TEST FAILED`);
            console.log(`✗ PDF dimensions do not match A4 format`);
            if (!widthMatch) {
              console.log(`  Width difference: ${Math.abs(width - A4_WIDTH_PT).toFixed(2)} pt`);
            }
            if (!heightMatch) {
              console.log(`  Height difference: ${Math.abs(height - A4_HEIGHT_PT).toFixed(2)} pt`);
            }
            reject(new Error('PDF dimensions do not match A4'));
          }
        } catch (error) {
          console.error('\n✗ Error verifying PDF:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`\n✗ Request error: ${error.message}`);
      console.error('Make sure the server is running: npm start');
      reject(error);
    });

    req.write(requestData);
    req.end();
  });
}

// Run test
if (require.main === module) {
  testAcceptance()
    .then(() => {
      console.log('\n✅ All tests passed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Test failed:', error.message);
      process.exit(1);
    });
}

module.exports = { testAcceptance };

