const fs = require('fs');
const path = require('path');
const { renderHtmlToPdf } = require('./index');
const { PDFDocument } = require('pdf-lib');

async function testLocalRender() {
  console.log('Testing local PDF rendering...\n');

  // Read sample HTML
  const samplePath = path.join(__dirname, 'samples', 'resume.html');
  if (!fs.existsSync(samplePath)) {
    console.error(`Error: Sample file not found at ${samplePath}`);
    process.exit(1);
  }

  const html = fs.readFileSync(samplePath, 'utf-8');
  console.log(`✓ Read sample HTML (${html.length} bytes)`);

  try {
    // Render to PDF
    console.log('Rendering PDF...');
    const pdfBuffer = await renderHtmlToPdf(html, [], {
      top: '12mm',
      right: '12mm',
      bottom: '12mm',
      left: '12mm'
    });

    console.log(`✓ Generated PDF (${pdfBuffer.length} bytes)`);

    // Verify PDF dimensions using pdf-lib
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    // A4 dimensions in points: 595.276 x 841.890 (210mm x 297mm)
    const A4_WIDTH_PT = 595.276;
    const A4_HEIGHT_PT = 841.890;
    const tolerance = 5; // 5 points tolerance

    console.log(`\nPDF Page Dimensions:`);
    console.log(`  Width: ${width.toFixed(2)} pt (expected: ${A4_WIDTH_PT} pt)`);
    console.log(`  Height: ${height.toFixed(2)} pt (expected: ${A4_HEIGHT_PT} pt)`);

    const widthMatch = Math.abs(width - A4_WIDTH_PT) < tolerance;
    const heightMatch = Math.abs(height - A4_HEIGHT_PT) < tolerance;

    if (widthMatch && heightMatch) {
      console.log(`✓ PDF dimensions match A4 format (within ${tolerance}pt tolerance)`);
    } else {
      console.log(`✗ PDF dimensions do not match A4 format`);
      if (!widthMatch) {
        console.log(`  Width difference: ${Math.abs(width - A4_WIDTH_PT).toFixed(2)} pt`);
      }
      if (!heightMatch) {
        console.log(`  Height difference: ${Math.abs(height - A4_HEIGHT_PT).toFixed(2)} pt`);
      }
    }

    // Save to output file
    const outputPath = path.join(__dirname, 'out.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    console.log(`\n✓ PDF saved to: ${outputPath}`);

    console.log('\n✅ Local test completed successfully!');
  } catch (error) {
    console.error('\n✗ Error during rendering:', error);
    process.exit(1);
  }
}

// Run test
testLocalRender().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

