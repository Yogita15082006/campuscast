const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const certsDir = path.join(__dirname, '..', 'certificates');
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
}

const generateCertificatePDF = (studentName, eventName, eventDate, organizerName, certificateId) => {
  return new Promise((resolve, reject) => {
    const fileName = `certificate-${certificateId}.pdf`;
    const filePath = path.join(certsDir, fileName);

    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Background
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#fefefe');

    // Border
    const bx = 30, by = 30;
    const bw = doc.page.width - 60, bh = doc.page.height - 60;
    doc.lineWidth(3).rect(bx, by, bw, bh).stroke('#667eea');
    doc.lineWidth(1).rect(bx + 8, by + 8, bw - 16, bh - 16).stroke('#764ba2');

    // Header ornament
    doc.fontSize(14).fillColor('#667eea').text('★ ★ ★', 0, 55, { align: 'center' });

    // Title
    doc.fontSize(38).fillColor('#333').font('Helvetica-Bold').text('CERTIFICATE', 0, 90, { align: 'center' });
    doc.fontSize(18).fillColor('#667eea').font('Helvetica').text('OF PARTICIPATION', 0, 135, { align: 'center' });

    // Divider
    doc.moveTo(250, 170).lineTo(doc.page.width - 250, 170).lineWidth(2).stroke('#667eea');

    // Body
    doc.fontSize(14).fillColor('#555').font('Helvetica').text('This is to certify that', 0, 195, { align: 'center' });

    doc.fontSize(28).fillColor('#333').font('Helvetica-Bold').text(studentName, 0, 225, { align: 'center' });

    // Underline name
    const nameWidth = doc.widthOfString(studentName);
    const nameX = (doc.page.width - nameWidth) / 2;
    doc.moveTo(nameX, 258).lineTo(nameX + nameWidth, 258).lineWidth(1).stroke('#667eea');

    doc.fontSize(14).fillColor('#555').font('Helvetica').text('has successfully participated in', 0, 275, { align: 'center' });

    doc.fontSize(22).fillColor('#764ba2').font('Helvetica-Bold').text(`"${eventName}"`, 0, 305, { align: 'center' });

    const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
    doc.fontSize(14).fillColor('#555').font('Helvetica').text(`held on ${formattedDate}`, 0, 345, { align: 'center' });

    // Organizer
    doc.fontSize(12).fillColor('#888').text('Organized by', 0, 390, { align: 'center' });
    doc.fontSize(16).fillColor('#333').font('Helvetica-Bold').text(organizerName, 0, 410, { align: 'center' });

    // Certificate ID
    doc.fontSize(10).fillColor('#aaa').font('Helvetica').text(`Certificate ID: ${certificateId}`, 0, 460, { align: 'center' });

    // Footer ornament
    doc.fontSize(14).fillColor('#667eea').text('★ ★ ★', 0, 490, { align: 'center' });

    doc.end();

    stream.on('finish', () => resolve({ filePath, fileName }));
    stream.on('error', reject);
  });
};

module.exports = { generateCertificatePDF };
