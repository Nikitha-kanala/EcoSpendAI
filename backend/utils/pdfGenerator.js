const PDFDocument = require('pdfkit');

/**
 * Generates a sustainability certificate for the user and writes to stream.
 * @param {Object} user - Mongoose User document
 * @param {Array} expenses - User's historical expenses list
 * @param {Stream} writeStream - Stream to write PDF to
 */
const generateCertificatePDF = (user, expenses, writeStream) => {
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margin: 40
  });

  // Pipe to response/file stream
  doc.pipe(writeStream);

  const points = user.ecoPoints || 0;
  const carbonSavings = user.totalCarbonOffset || 0;
  const financialSavings = user.totalSavings || 0;

  // Decide Tier styling based on points milestone
  let certTitle = 'CERTIFICATE OF ENVIRONMENTAL STEWARDSHIP';
  let certSub = 'SILVER STEWARD TIER';
  let certColor = '#10b981'; // Emerald Accent
  let sealColor = 'rgba(16, 185, 129, 0.15)';

  if (points >= 250) {
    certTitle = 'CERTIFICATE OF CARBON GUARDIANSHIP';
    certSub = 'GOLD GUARDIAN TIER';
    certColor = '#d97706'; // Gold/Amber Accent
    sealColor = 'rgba(217, 119, 6, 0.15)';
  } else if (points >= 100) {
    certTitle = 'CERTIFICATE OF ENVIRONMENTAL STEWARDSHIP';
    certSub = 'SILVER STEWARD TIER';
    certColor = '#10b981'; // Emerald Accent
    sealColor = 'rgba(16, 185, 129, 0.15)';
  } else {
    certTitle = 'CERTIFICATE OF SUSTAINABILITY PIONEERING';
    certSub = 'BRONZE PIONEER TIER';
    certColor = '#b45309'; // Bronze Accent
    sealColor = 'rgba(180, 83, 9, 0.15)';
  }

  // Colors matching the Premium Environmental Palette
  const darkGreen = '#022b1d';
  const charcoal = '#1e293b';

  // --- DRAW BACKGROUND & BORDER ---
  // Outer border
  doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
     .lineWidth(3)
     .stroke(darkGreen);

  // Inner thin border
  doc.rect(26, 26, doc.page.width - 52, doc.page.height - 52)
     .lineWidth(1)
     .stroke(certColor);

  // Corner decorations
  const drawCornerDeco = (x, y, xDir, yDir) => {
    doc.moveTo(x, y)
       .lineTo(x + (xDir * 30), y)
       .lineTo(x + (xDir * 30), y + (yDir * 5))
       .lineTo(x + (xDir * 5), y + (yDir * 5))
       .lineTo(x + (xDir * 5), y + (yDir * 30))
       .lineTo(x, y + (yDir * 30))
       .closePath()
       .fill(darkGreen);
  };

  drawCornerDeco(26, 26, 1, 1);
  drawCornerDeco(doc.page.width - 26, 26, -1, 1);
  drawCornerDeco(26, doc.page.height - 26, 1, -1);
  drawCornerDeco(doc.page.width - 26, doc.page.height - 26, -1, -1);

  // --- PROFILE PICTURE IN PDF ---
  if (user.profilePhoto && user.profilePhoto.startsWith('data:image')) {
    try {
      const base64Data = user.profilePhoto.replace(/^data:image\/\w+;base64,/, "");
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      const photoSize = 100;
      const photoX = doc.page.width - 150;
      const photoY = 35;
      
      doc.save();
      doc.circle(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2)
         .clip();
         
      doc.image(imageBuffer, photoX, photoY, { width: photoSize, height: photoSize });
      doc.restore();
      
      doc.strokeColor(certColor)
         .lineWidth(2.5)
         .circle(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2 + 1)
         .stroke();
    } catch (photoError) {
      console.error('Failed to draw user photo in PDF:', photoError.message);
    }
  }

  // --- CERTIFICATE HEADER ---
  doc.fillColor(darkGreen)
     .font('Helvetica-Bold')
     .fontSize(36)
     .text('ECOSPEND AI', 0, 80, { align: 'center' });

  doc.fillColor(certColor)
     .font('Helvetica')
     .fontSize(16)
     .text(certTitle, 0, 125, { align: 'center' });

  doc.fillColor(charcoal)
     .font('Helvetica-Bold')
     .fontSize(10)
     .text(certSub, 0, 145, { align: 'center' });

  doc.moveDown(1.5);

  // --- BODY TEXT ---
  doc.fillColor(charcoal)
     .font('Helvetica')
     .fontSize(14)
     .text('This official certificate is proudly presented to:', { align: 'center' });

  doc.moveDown(0.8);

  doc.fillColor(darkGreen)
     .font('Helvetica-Bold')
     .fontSize(28)
     .text(user.name, { align: 'center' });

  doc.moveDown(0.8);

  doc.fillColor(charcoal)
     .font('Helvetica')
     .fontSize(13)
     .text(
       `For demonstrating outstanding environmental performance and commitment to sustainability.`,
       { align: 'center' }
     );

  doc.moveDown(0.4);

  doc.text(
     `Through carbon-conscious spending patterns and resource optimization, this individual has mitigated`,
     { align: 'center' }
  );

  doc.moveDown(0.5);

  doc.fillColor(certColor)
     .font('Helvetica-Bold')
     .fontSize(18)
     .text(`${carbonSavings.toFixed(1)} kg of CO₂ emissions`, { align: 'center' });

  doc.moveDown(0.4);

  doc.fillColor(charcoal)
     .font('Helvetica')
     .fontSize(13)
     .text(`and saved a cumulative total of Rs. ${financialSavings} over the billing cycle.`, { align: 'center' });

  doc.moveDown(2);

  // --- STATS ROW / CARDS ---
  const startY = doc.y + 20;
  const cardWidth = 180;
  const cardHeight = 65;
  const cardSpacing = 40;
  const startX = (doc.page.width - (cardWidth * 3 + cardSpacing * 2)) / 2;

  const drawStatCard = (x, title, value, unit) => {
    // Card background
    doc.roundedRect(x, startY, cardWidth, cardHeight, 6)
       .fillColor('#f8fafc')
       .strokeColor('#e2e8f0')
       .lineWidth(1)
       .fillAndStroke();

    // Title
    doc.fillColor('#64748b')
       .font('Helvetica-Bold')
       .fontSize(10)
       .text(title.toUpperCase(), x + 10, startY + 14, { width: cardWidth - 20, align: 'center' });

    // Value
    doc.fillColor(darkGreen)
       .font('Helvetica-Bold')
       .fontSize(18)
       .text(`${value} ${unit}`, x + 10, startY + 34, { width: cardWidth - 20, align: 'center' });
  };

  drawStatCard(startX, 'Carbon Offset', carbonSavings.toFixed(1), 'kg');
  drawStatCard(startX + cardWidth + cardSpacing, 'Eco Points', points, 'PTS');
  drawStatCard(startX + (cardWidth + cardSpacing) * 2, 'Weekly Score', user.weeklyScore, '/100');

  // --- FOOTER & SIGNATURE ---
  const footerY = startY + cardHeight + 35;

  // Left Signature
  doc.strokeColor('#cbd5e1')
     .lineWidth(1)
     .moveTo(80, footerY)
     .lineTo(240, footerY)
     .stroke();

  doc.fillColor(charcoal)
     .font('Helvetica')
     .fontSize(10)
     .text('EcoSpend AI Core Engine', 80, footerY + 5, { width: 160, align: 'center' });

  // Right Date
  doc.strokeColor('#cbd5e1')
     .lineWidth(1)
     .moveTo(doc.page.width - 240, footerY)
     .lineTo(doc.page.width - 80, footerY)
     .stroke();

  const dateString = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' });
  doc.fillColor(charcoal)
     .font('Helvetica')
     .fontSize(10)
     .text(dateString, doc.page.width - 240, footerY + 5, { width: 160, align: 'center' });

  // Seal / Stamp drawing in the bottom middle
  const sealX = doc.page.width / 2;
  const sealY = footerY - 5;
  doc.fillColor(sealColor)
     .circle(sealX, sealY, 35)
     .fill();

  doc.strokeColor(certColor)
     .lineWidth(1.5)
     .circle(sealX, sealY, 30)
     .stroke();

  doc.fillColor(darkGreen)
     .font('Helvetica-Bold')
     .fontSize(10)
     .text('VERIFIED', sealX - 25, sealY - 12, { width: 50, align: 'center' });
  doc.fontSize(8)
     .text('ECO-PROOF', sealX - 30, sealY + 2, { width: 60, align: 'center' });

  // End the document
  doc.end();
};

module.exports = {
  generateCertificatePDF
};
