const express = require('express');
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { minutes, filename } = req.body;

    if (!minutes) {
      return res.status(400).json({ error: 'Minutes content is required' });
    }

    const sections = minutes.split('\n\n').filter(s => s.trim());
    const paragraphs = [];

    sections.forEach((section, index) => {
      const lines = section.split('\n');
      
      lines.forEach((line, lineIndex) => {
        if (line.trim()) {
          const isHeading = line.match(/^#+\s/) || line.includes('：') && lineIndex === 0;
          
          if (isHeading) {
            paragraphs.push(
              new Paragraph({
                text: line.replace(/^#+\s/, '').replace('：', ''),
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 100 }
              })
            );
          } else {
            paragraphs.push(
              new Paragraph({
                text: line,
                spacing: { line: 240, after: 100 }
              })
            );
          }
        }
      });

      if (index < sections.length - 1) {
        paragraphs.push(new Paragraph({ text: '' }));
      }
    });

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs
        }
      ]
    });

    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, filename || `meeting-minutes-${Date.now()}.docx`);

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(filePath, buffer);

    res.json({
      success: true,
      filePath: filePath,
      filename: path.basename(filePath)
    });
  } catch (error) {
    console.error('Word generation error:', error.message);
    res.status(500).json({ error: 'Word document generation failed' });
  }
});

module.exports = router;
